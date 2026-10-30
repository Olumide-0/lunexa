import { NextResponse, type NextRequest } from "next/server";
import { getPopularProducts, searchProducts } from "@/lib/products";

// GET /api/products/search?q=black+leggings   → matching products
// GET /api/products/search                    → a few popular products
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.slice(0, 100) ?? "";
  try {
    const products = q.trim() ? await searchProducts(q) : await getPopularProducts(4);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}