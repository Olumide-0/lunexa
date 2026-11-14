import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getAdmin } from "@/lib/admin";
import { connectDB } from "@/lib/db";
import { allMenuPaths } from "@/lib/menu-paths";
import { SiteSettings } from "@/models/SiteSettings";

const bodySchema = z.object({
  path: z.string().max(200),
  hidden: z.boolean(),
});

// PUT /api/admin/menu-visibility  { path: "/women/leggings", hidden: true }
export async function PUT(request: Request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ message: "Not found" }, { status: 404 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !allMenuPaths().has(parsed.data.path)) {
    return Response.json({ message: "Unknown menu item" }, { status: 400 });
  }
  const { path, hidden } = parsed.data;

  try {
    await connectDB();
    const settings = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      hidden ? { $addToSet: { hiddenPaths: path } } : { $pull: { hiddenPaths: path } },
      { upsert: true, new: true }
    ).lean<{ hiddenPaths: string[] }>();

    revalidateTag("menu-visibility", { expire: 0 }); // the store shows the change on the next visit
    return Response.json({ hiddenPaths: settings?.hiddenPaths ?? [] });
  } catch (error) {
    console.error("Menu visibility error:", error);
    return Response.json({ message: "Could not save. Please try again." }, { status: 500 });
  }
}