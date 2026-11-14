import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { productInputSchema } from "@/lib/product-schema";
import { Product } from "@/models/Product";

// POST /api/admin/products   body: the product form data   →   { slug }
export async function POST(request: Request) {
  // Admins only. Everyone else gets the same "not found" as a missing route.
  const admin = await getAdmin();
  if (!admin) return Response.json({ message: "Not found" }, { status: 404 });

  const parsed = productInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { message: "Please check the form", errors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    await Product.create(parsed.data);
  } catch (error) {
    // 11000 = the unique "slug" already exists
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      return Response.json({ message: "A product with that link name already exists" }, { status: 409 });
    }
    console.error("Create product error:", error);
    return Response.json({ message: "Something went wrong. Please try again." }, { status: 500 });
  }

  revalidateTag("products", { expire: 0 }); // the store pages show the new product straight away
  return Response.json({ slug: parsed.data.slug }, { status: 201 });
}