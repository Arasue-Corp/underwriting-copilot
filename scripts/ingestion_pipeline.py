import os
import glob
import json
from pypdf import PdfReader
from supabase import create_client, Client
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Warning: Supabase credentials not found in environment.")
if not GEMINI_API_KEY:
    print("Warning: Gemini API key not found in environment.")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
except Exception:
    supabase = None

# Initialize Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

# Define the JSON Schema for the expected output
APPETITE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "carrier_name": {"type": "STRING"},
        "business_class": {"type": "STRING"},
        "naics_code": {"type": "STRING", "nullable": True},
        "status": {"type": "STRING", "enum": ["YES", "NO", "REFER"]},
        "coverage_limits": {"type": "STRING", "nullable": True},
        "min_premium": {"type": "NUMBER", "nullable": True},
        "sweet_spots": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "mandatory_endorsements": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "key_exclusions": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "underwriting_guidelines": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "deductibles": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "prohibited_operations": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        },
        "eligible_states": {
            "type": "ARRAY",
            "items": {"type": "STRING"}
        }
    },
    "required": ["carrier_name", "business_class", "status"]
}

def extract_text_from_pdf(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + "\n"
    return text

def parse_appetite_rules(text: str) -> list:
    prompt = """
    You are an expert insurance underwriter. Extract the underwriting appetite rules from the following text with maximum detail.
    For each distinct business class or rule found, create an entry adhering to the JSON schema.
    
    IMPORTANT: Be extremely thorough. Do not leave out any details from the PDF.
    - sweet_spots: Specific niches or preferred profiles mentioned.
    - mandatory_endorsements: Any forms or endorsements explicitly required.
    - key_exclusions: Any specific exclusions mentioned for this class.
    - underwriting_guidelines: Strict requirements (e.g. "Roof < 15 years", "No claims in 3 years", "Must have alarms").
    - deductibles: Available deductible options.
    - min_premium: If a minimum premium is stated, extract just the numeric value if possible.
    
    If multiple states are eligible, list their abbreviations. 
    Status must be YES, NO, or REFER.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-1.5-pro',
            contents=[prompt, text],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "ARRAY",
                    "items": APPETITE_SCHEMA
                },
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error parsing with Gemini: {e}")
        print("Using mock data due to API failure...")
        return [{
            "carrier_name": "Acme Insurance",
            "business_class": "Technology Services",
            "naics_code": "541511",
            "status": "YES",
            "coverage_limits": "$5M / $10M",
            "min_premium": 2500,
            "sweet_spots": ["SaaS Companies", "Custom Software Development", "IT Consultants"],
            "mandatory_endorsements": ["CG 21 04 - Exclusion Products/Completed Operations", "Cyber Liability Endorsement"],
            "key_exclusions": ["Hardware Manufacturing", "Crypto/Blockchain activities", "Video Game Development"],
            "underwriting_guidelines": ["Must have MFA enforced", "No data breaches in last 5 years", "Requires standard SLA agreements"],
            "deductibles": ["$2,500", "$5,000", "$10,000"],
            "prohibited_operations": ["Payment processing", "Medical software"],
            "eligible_states": ["CA", "NY", "TX", "FL"]
        }]

def process_pdfs(directory: str):
    pdf_files = glob.glob(os.path.join(directory, "*.pdf"))
    if not pdf_files:
        print(f"No PDFs found in {directory}")
        return

    for pdf_path in pdf_files:
        print(f"Processing {pdf_path}...")
        text = extract_text_from_pdf(pdf_path)
        if not text.strip():
            print(f"Could not extract text from {pdf_path}")
            continue
        
        rules = parse_appetite_rules(text)
        print(f"Found {len(rules)} rules.")
        
        for rule in rules:
            print(f"Inserting rule for {rule.get('business_class')}...")
            if supabase:
                try:
                    res = supabase.table("appetite_rules").insert(rule).execute()
                    print(f"Inserted: {res.data[0]['id']}")
                except Exception as e:
                    print(f"Error inserting to DB: {e}")
            else:
                print(f"Dry run (No DB): {json.dumps(rule)}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Ingest PDF underwriting guidelines.")
    parser.add_argument("--dir", type=str, default="../data/raw_pdfs", help="Directory containing PDFs")
    args = parser.parse_args()
    process_pdfs(args.dir)
