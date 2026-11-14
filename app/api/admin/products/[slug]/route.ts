import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { productInputSchema, toUpdate } from "@/lib/product-schema";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";

// The link name (slug) can't be changed after a product is created, so it isn't part of the update
const updateSchema = productInputSchema.omit({ slug: true });

// PUT /api/admin/products/leggings-black   body: the product form data
export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ message: "Not found" }, { status: 404 });

  const { slug } = await params;
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { message: "Please check the form", errors: z.flattenError(parsed.error).fieldErrors },
      { status: 400 }
    );
  }

  await connectDB();
  const updated = await Product.findOneAndUpdate({ slug: slug.toLowerCase() }, toUpdate(parsed.data), { new: true });
  if (!updated) return Response.json({ message: "Product not found" }, { status: 404 });

  revalidateTag("products", { expire: 0 });
  return Response.json({ slug: updated.slug });
}

// DELETE /api/admin/products/leggings-black
export async function DELETE(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ message: "Not found" }, { status: 404 });

  const { slug } = await params;
  await connectDB();

  const product = await Product.findOne({ slug: slug.toLowerCase() }).select("_id");
  if (!product) return Response.json({ message: "Product not found" }, { status: 404 });

  // A product that was ordered stays, so old order pages keep working. Hide it from the store instead.
  const ordered = await Order.exists({ "items.product": product._id });
  if (ordered) {
    return Response.json(
      { message: 'This product is in past orders, so it can\'t be deleted. Tick "Hidden from store" on its edit page instead.' },
      { status: 409 }
    );
  }

  await product.deleteOne();

  revalidateTag("products", { expire: 0 });
  return Response.json({ deleted: true });
}