import { NextResponse } from "next/server";
import { enrichWebsite } from "@/lib/enrichment";

export async function POST(req) {

  try {

    const business = await req.json();

    let websiteData = {};

    if (business.website) {

      websiteData = await enrichWebsite(business.website);

    }

    const enriched = {

      ...business,

      phone:
        websiteData.phones?.[0] ||
        business.phone ||
        "",

      email:
        websiteData.emails?.[0] ||
        business.email ||
        "",

      phones:
        websiteData.phones || [],

      emails:
        websiteData.emails || [],

      whatsapp:
        websiteData.whatsapp || "",

      socials:
        websiteData.socials || {},

      hours:
        websiteData.hours || {},

      logo:
        websiteData.logo || "",

      heroImage:
        websiteData.heroImage || "",

      businessName:
        websiteData.businessName ||
        business.name,

      description:
        websiteData.description || "",

      tagline:
        websiteData.tagline || "",

      services:
        websiteData.services || [],

      faq:
        websiteData.faq || [],

      testimonials:
        websiteData.testimonials || [],

      pricing:
        websiteData.pricing || [],

      bookingUrl:
        websiteData.bookingUrl || "",

      maps:
        websiteData.maps || "",

      schema:
        websiteData.schema || {},

      colors:
        websiteData.colors || [],

      confidence:
        websiteData.confidence || {},

      completeness:
        websiteData.completeness || 0,

      missingFields:
        websiteData.missingFields || [],

      address:
        websiteData.address ||
        business.address,

      geo:
        websiteData.geo || {},

      pagesCrawled:
        websiteData.pagesCrawled || 0,

    };

    return NextResponse.json(enriched);

  }

  catch (err) {

    console.error(err);

    return NextResponse.json(
      {
        error: "Failed to enrich business",
      },
      {
        status: 500,
      }
    );

  }

}