import os
import sys
import uuid
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Missing Supabase credentials")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def seed():
    # 1. Create a fake user in auth.users using admin api
    print("Creating admin/manager user...")
    try:
        user = supabase.auth.admin.create_user({
            "email": "manager@uwcopilot.com",
            "password": "securepassword123",
            "email_confirm": True
        })
        user_id = user.user.id
        print(f"Created user {user_id}")
    except Exception as e:
        print(f"User might already exist: {e}")
        # Try to fetch existing
        users = supabase.auth.admin.list_users()
        user_id = next((u.id for u in users.users if u.email == "manager@uwcopilot.com"), None)
        if not user_id:
            print("Failed to get user")
            sys.exit(1)

    # 2. Create an agency
    print("Creating agency...")
    agency_res = supabase.table("agencies").insert({"name": "Acme Agency"}).execute()
    agency_id = agency_res.data[0]["id"]
    print(f"Created agency {agency_id}")

    # 3. Create a profile (since it's a manager)
    print("Creating profile...")
    try:
        supabase.table("profiles").insert({
            "id": user_id,
            "email": "manager@uwcopilot.com",
            "name": "Admin Manager",
            "role": "MANAGER",
            "agency_id": agency_id,
            "commission_rate": 15.00
        }).execute()
        print("Profile created!")
    except Exception as e:
        print(f"Profile might exist: {e}")

if __name__ == "__main__":
    seed()
