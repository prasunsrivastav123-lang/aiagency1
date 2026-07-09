import { NextResponse } from "next/server";
import { enrichBusiness } from "@/lib/scraper/enrichBusiness";

export async function POST(req) {
  try {
    const business = await req.json();

    const enriched = await enrichBusiness(business);

    return NextResponse.json(enriched);

  } catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        error: "Failed to enrich business"
      },
      {
        status: 500
      }
    );
  }
}