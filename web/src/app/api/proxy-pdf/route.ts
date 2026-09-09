import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  // 1. Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // 2. Validate URL against SSRF: only allow HTTPS and trusted Supabase storage / app domains
  try {
    const parsedUrl = new URL(url);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let allowed = false;

    if (supabaseUrl) {
      const allowedHostname = new URL(supabaseUrl).hostname;
      if (parsedUrl.hostname === allowedHostname || parsedUrl.hostname.endsWith(`.${allowedHostname}`)) {
        allowed = true;
      }
    }

    // Also allow if it's from supabase storage subdomains or self origin
    if (parsedUrl.hostname.endsWith('.supabase.co') || parsedUrl.hostname.endsWith('.supabase.in')) {
      allowed = true;
    }

    if (!allowed || parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: "URL no permitida" }, { status: 403 });
    }

    const response = await fetch(parsedUrl.toString());
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch PDF" }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'private, max-age=3600',
      }
    });
  } catch (error: any) {
    console.error("Proxy PDF error:", error);
    return NextResponse.json({ error: "Invalid URL or internal server error" }, { status: 500 });
  }
}
