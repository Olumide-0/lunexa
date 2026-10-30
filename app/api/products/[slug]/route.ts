import { getProductBySlug } from "@/lib/products";

// GET /api/products/whitney-shorts
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> } // Next 16: params is a Promise
) {
  const { slug } = await params;

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return Response.json({ message: "Product not found" }, { status: 404 });
    }
    return Response.json({ product });
  } catch (error) {
    console.error("Product error:", error);
    return Response.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}