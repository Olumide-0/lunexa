import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { getAdmin } from "@/lib/admin";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MAX_BYTES = 4 * 1024 * 1024; // Vercel rejects request bodies over about 4.5 MB
const TYPES = ["image/jpeg", "image/png", "image/webp"];

// POST /api/admin/upload   body: FormData with one "file"   →   { url }
export async function POST(request: Request) {
  // Admins only. Everyone else gets the same "not found" as a missing route.
  const admin = await getAdmin();
  if (!admin) return Response.json({ message: "Not found" }, { status: 404 });

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return Response.json({ message: "Image upload isn't set up yet. Add the Cloudinary keys." }, { status: 500 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ message: "No image was sent" }, { status: 400 });

  if (!TYPES.includes(file.type)) {
    return Response.json({ message: "Only JPG, PNG or WebP images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ message: "That image is bigger than 4 MB" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "lunexa/products",
            resource_type: "image",
            // Save a small copy: at most 1600px wide, WebP, automatic quality.
            // Big originals made Next's image loader time out.
            format: "webp",
            transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto" }],
          },
          (error, uploaded) => {
            if (error || !uploaded) reject(error ?? new Error("No upload result"));
            else resolve(uploaded);
          }
        )
        .end(buffer);
    });

    return Response.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ message: "The upload failed. Please try again." }, { status: 502 });
  }
}