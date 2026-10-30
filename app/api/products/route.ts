import { z } from "zod";
import { queryProducts } from "@/lib/products";

// What the URL is allowed to contain, e.g. /api/products?category=men&limit=12
const querySchema = z.object({
  category: z.enum(["men", "women", "accessories"]).optional(),
  subcategory: z.string().trim().min(1).optional(),
  collection: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

// GET /api/products
export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const result = querySchema.safeParse(params);

  if (!result.success) {
    return Response.json(
      { message: "Invalid filter", errors: z.flattenError(result.error).fieldErrors },
      { status: 400 }
    );
  }

  try {
    const products = await queryProducts(result.data);
    return Response.json({ count: products.length, products });
  } catch (error) {
    console.error("Products error:", error);
    return Response.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }
}