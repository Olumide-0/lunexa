import { NextResponse, type NextRequest } from "next/server";
import { getProductsByIds } from "@/lib/products";

// GET /api/products/lookup?ids=abc,def  → those products (used by the wishlist page)
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get("ids") ?? "").split(",").filter(Boolean);
  try {
    const products = await getProductsByIds(ids);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Product lookup failed:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}