"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import type { ListingProduct } from "@/lib/products";

type ColorRow = { name: string; hex: string };

type Values = {
  name: string;
  slug: string;
  subtitle: string;
  badge: string;
  description: string;
  price: string;
  compareAtPrice: string;
  discount: string;
  category: string;
  subcategory: string;
  collectionName: string;
  sizes: string; // typed as "S, M, L"
  colorName: string;
  features: string; // one per line
  fit: string;
  pattern: string;
  stock: string;
  isNewArrival: boolean;
  isFeatured: boolean;
};

const MAX_IMAGES = 8;
const MAX_BYTES = 4 * 1024 * 1024;

const inputClass =
  "h-[40px] w-full rounded-[4px] border border-[#E5E5E5] bg-white px-[12px] text-[14px] text-black outline-none transition-colors placeholder:text-[#9B9B9B] focus:border-black disabled:bg-[#F2F2F2] disabled:text-[#6B6B6B]";
const textareaClass =
  "w-full rounded-[4px] border border-[#E5E5E5] bg-white px-[12px] py-[10px] text-[14px] leading-[20px] text-black outline-none transition-colors placeholder:text-[#9B9B9B] focus:border-black";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const optional = (text: string) => (text.trim() === "" ? undefined : text.trim());
const optionalNumber = (text: string) => (text.trim() === "" ? undefined : Number(text));

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-[13px] font-semibold text-black">{label}</span>
      {children}
      {hint && <span className="mt-[4px] block text-[12px] leading-[16px] text-[#6B6B6B]">{hint}</span>}
    </label>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[4px] border border-[#E5E5E5] bg-white p-[20px]">
      <h2 className="text-[14px] font-bold uppercase leading-[20px] text-black">{title}</h2>
      <div className="mt-[16px] grid gap-[16px]">{children}</div>
    </section>
  );
}

function startingValues(product?: ListingProduct): Values {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    subtitle: product?.subtitle ?? "",
    badge: product?.badge ?? "",
    description: product?.description ?? "",
    price: product ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice !== undefined ? String(product.compareAtPrice) : "",
    discount: product?.discount !== undefined ? String(product.discount) : "",
    category: product?.category ?? "women",
    subcategory: product?.subcategory ?? "",
    collectionName: product?.collection ?? "",
    sizes: product?.sizes.join(", ") ?? "",
    colorName: product?.colorName ?? "",
    features: product?.features?.join("\n") ?? "",
    fit: product?.fit ?? "",
    pattern: product?.pattern ?? "",
    stock: product ? String(product.stock) : "0",
    isNewArrival: product?.isNew ?? false,
    isFeatured: product?.isFeatured ?? false,
  };
}

export function ProductForm({ product }: { product?: ListingProduct }) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const fileInput = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<Values>(() => startingValues(product));
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [colors, setColors] = useState<ColorRow[]>(product?.colors ?? []);
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const set =
    (key: keyof Values) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((current) => ({ ...current, [key]: event.target.value }));

  function onNameChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.value;
    // On a new product the link name follows the name until you edit it yourself
    setValues((current) => ({ ...current, name, slug: isEdit || slugTouched ? current.slug : slugify(name) }));
  }

  async function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    setErrors([]);
    const problems: string[] = [];
    const urls: string[] = [];

    for (const file of files) {
      if (images.length + urls.length >= MAX_IMAGES) {
        problems.push(`Maximum ${MAX_IMAGES} images.`);
        break;
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name} is bigger than 4 MB.`);
        continue;
      }

      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.url) {
        problems.push(`${file.name}: ${data?.message ?? "upload failed"}`);
        continue;
      }
      urls.push(data.url);
    }

    setImages((current) => [...current, ...urls]);
    setErrors(problems);
    setUploading(false);
  }

  const removeImage = (url: string) => setImages((current) => current.filter((item) => item !== url));
  const makeMain = (url: string) => setImages((current) => [url, ...current.filter((item) => item !== url)]);

  const updateColor = (index: number, patch: Partial<ColorRow>) =>
    setColors((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrors([]);

    const payload = {
      ...(isEdit ? {} : { slug: values.slug }),
      name: values.name,
      subtitle: optional(values.subtitle),
      badge: optional(values.badge),
      description: values.description,
      price: optionalNumber(values.price),
      compareAtPrice: optionalNumber(values.compareAtPrice),
      discount: optionalNumber(values.discount),
      images,
      category: values.category,
      subcategory: optional(values.subcategory),
      collectionName: optional(values.collectionName),
      sizes: values.sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),
      colors: colors.filter((row) => row.name.trim() !== "" || row.hex.trim() !== ""),
      colorName: optional(values.colorName),
      features: values.features
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      fit: optional(values.fit),
      pattern: optional(values.pattern),
      stock: optionalNumber(values.stock),
      isNewArrival: values.isNewArrival,
      isFeatured: values.isFeatured,
    };

    const res = await fetch(isEdit ? `/api/admin/products/${product?.slug}` : "/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const fieldErrors: Record<string, string[]> = data?.errors ?? {};
      const lines = Object.entries(fieldErrors).flatMap(([field, messages]) =>
        messages.map((message) => `${field}: ${message}`)
      );
      setErrors(lines.length > 0 ? lines : [data?.message ?? "Something went wrong. Please try again."]);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-[760px] gap-[16px]">
      {errors.length > 0 && (
        <div role="alert" className="rounded-[4px] border border-[#F5C2C2] bg-[#FDECEC] p-[14px]">
          <p className="text-[13px] font-semibold text-[#C62828]">Please fix this:</p>
          <ul className="mt-[4px] list-disc pl-[18px] text-[13px] leading-[20px] text-[#C62828]">
            {errors.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <Card title="Basics">
        <Field label="Name">
          <input value={values.name} onChange={onNameChange} className={inputClass} placeholder="Lift Seamless Leggings" />
        </Field>
        <Field
          label="Link name"
          hint={isEdit ? "Can't be changed after the product is created." : "Used in the web address: /products/this-name"}
        >
          <input
            value={values.slug}
            onChange={(event) => {
              setSlugTouched(true);
              set("slug")(event);
            }}
            disabled={isEdit}
            className={inputClass}
            placeholder="lift-seamless-leggings"
          />
        </Field>
        <div className="grid gap-[16px] sm:grid-cols-2">
          <Field label="Subtitle (optional)">
            <input value={values.subtitle} onChange={set("subtitle")} className={inputClass} placeholder="High-waist leggings" />
          </Field>
          <Field label="Badge (optional)">
            <input value={values.badge} onChange={set("badge")} className={inputClass} placeholder="Best seller" />
          </Field>
        </div>
        <Field label="Description">
          <textarea value={values.description} onChange={set("description")} rows={5} className={textareaClass} />
        </Field>
      </Card>

      <Card title="Images">
        <p className="text-[12px] leading-[16px] text-[#6B6B6B]">
          JPG, PNG or WebP, up to 4 MB each, maximum {MAX_IMAGES}. The first image is the main one.
        </p>

        {images.length > 0 && (
          <ul className="grid grid-cols-2 gap-[12px] sm:grid-cols-4">
            {images.map((url, index) => (
              <li key={url} className="relative">
                <div className="relative aspect-square overflow-hidden rounded-[4px] border border-[#E5E5E5] bg-[#F2F2F2]">
                  <Image src={url} alt="" fill sizes="160px" className="object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  aria-label="Remove image"
                  className="absolute right-[6px] top-[6px] flex size-[24px] items-center justify-center rounded-full bg-white text-black shadow-sm transition-colors hover:bg-[#F2F2F2]"
                >
                  <X strokeWidth={2} className="size-[14px]" />
                </button>
                {index === 0 ? (
                  <p className="mt-[6px] text-[12px] font-semibold text-black">Main image</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeMain(url)}
                    className="mt-[6px] text-[12px] text-[#6B6B6B] underline hover:text-black"
                  >
                    Make main
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={onFiles} className="hidden" />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading || images.length >= MAX_IMAGES}
            className="flex h-[40px] items-center gap-[8px] rounded-[4px] border border-[#E5E5E5] bg-white px-[14px] text-[14px] text-black transition-colors hover:bg-[#F2F2F2] disabled:opacity-60"
          >
            {uploading ? <Loader2 className="size-[16px] animate-spin" /> : <Upload strokeWidth={1.75} className="size-[16px]" />}
            {uploading ? "Uploading..." : "Upload images"}
          </button>
        </div>
      </Card>

      <Card title="Price and stock">
        <div className="grid gap-[16px] sm:grid-cols-3">
          <Field label="Price (USD)">
            <input type="number" min="0" step="0.01" value={values.price} onChange={set("price")} className={inputClass} />
          </Field>
          <Field label="Old price (optional)" hint="Only when on sale">
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.compareAtPrice}
              onChange={set("compareAtPrice")}
              className={inputClass}
            />
          </Field>
          <Field label="Discount % (optional)">
            <input type="number" min="0" max="100" value={values.discount} onChange={set("discount")} className={inputClass} />
          </Field>
        </div>
        <Field label="Stock">
          <input type="number" min="0" step="1" value={values.stock} onChange={set("stock")} className={`${inputClass} sm:max-w-[200px]`} />
        </Field>
      </Card>

      <Card title="Where it shows">
        <div className="grid gap-[16px] sm:grid-cols-2">
          <Field label="Category">
            <select value={values.category} onChange={set("category")} className={inputClass}>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="accessories">Accessories</option>
            </select>
          </Field>
          <Field label="Subcategory (optional)" hint="e.g. leggings. It decides which listing page the product is on.">
            <input value={values.subcategory} onChange={set("subcategory")} className={inputClass} placeholder="leggings" />
          </Field>
        </div>
        <Field label="Collection (optional)" hint="e.g. lift-seamless-2 for a carousel section, or Vitals for the filter.">
          <input value={values.collectionName} onChange={set("collectionName")} className={inputClass} />
        </Field>
        <div className="flex flex-wrap gap-x-[24px] gap-y-[10px]">
          <label className="flex items-center gap-[8px] text-[14px] text-black">
            <input
              type="checkbox"
              checked={values.isNewArrival}
              onChange={(event) => setValues((current) => ({ ...current, isNewArrival: event.target.checked }))}
              className="size-[16px] accent-black"
            />
            New arrival
          </label>
          <label className="flex items-center gap-[8px] text-[14px] text-black">
            <input
              type="checkbox"
              checked={values.isFeatured}
              onChange={(event) => setValues((current) => ({ ...current, isFeatured: event.target.checked }))}
              className="size-[16px] accent-black"
            />
            Featured (shows in search suggestions)
          </label>
        </div>
      </Card>

      <Card title="Details">
        <Field label="Sizes" hint="Separate with commas, e.g. XS, S, M, L, XL">
          <input value={values.sizes} onChange={set("sizes")} className={inputClass} placeholder="XS, S, M, L, XL" />
        </Field>

        <div>
          <span className="mb-[6px] block text-[13px] font-semibold text-black">Colours</span>
          <div className="grid gap-[8px]">
            {colors.map((row, index) => (
              <div key={index} className="flex items-center gap-[8px]">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(row.hex) ? row.hex : "#000000"}
                  onChange={(event) => updateColor(index, { hex: event.target.value })}
                  aria-label="Pick colour"
                  className="h-[40px] w-[48px] shrink-0 cursor-pointer rounded-[4px] border border-[#E5E5E5] bg-white p-[4px]"
                />
                <input
                  value={row.name}
                  onChange={(event) => updateColor(index, { name: event.target.value })}
                  className={inputClass}
                  placeholder="Black"
                />
                <input
                  value={row.hex}
                  onChange={(event) => updateColor(index, { hex: event.target.value })}
                  className={`${inputClass} max-w-[110px]`}
                  placeholder="#000000"
                />
                <button
                  type="button"
                  onClick={() => setColors((current) => current.filter((_, i) => i !== index))}
                  aria-label="Remove colour"
                  className="flex size-[40px] shrink-0 items-center justify-center rounded-[4px] text-[#6B6B6B] transition-colors hover:bg-[#F2F2F2] hover:text-black"
                >
                  <Trash2 strokeWidth={1.75} className="size-[16px]" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setColors((current) => [...current, { name: "", hex: "#000000" }])}
            className="mt-[8px] flex h-[36px] items-center gap-[6px] rounded-[4px] px-[10px] text-[13px] text-black transition-colors hover:bg-[#F2F2F2]"
          >
            <Plus strokeWidth={1.75} className="size-[16px]" />
            Add colour
          </button>
        </div>

        <Field label="Colour filter (optional)" hint="The one word the colour filter uses, e.g. Black">
          <input value={values.colorName} onChange={set("colorName")} className={`${inputClass} sm:max-w-[240px]`} />
        </Field>
        <div className="grid gap-[16px] sm:grid-cols-2">
          <Field label="Fit (optional)">
            <input value={values.fit} onChange={set("fit")} className={inputClass} placeholder="Compression" />
          </Field>
          <Field label="Pattern (optional)">
            <input value={values.pattern} onChange={set("pattern")} className={inputClass} placeholder="Solid" />
          </Field>
        </div>
        <Field label="Features (optional)" hint="One feature per line">
          <textarea value={values.features} onChange={set("features")} rows={4} className={textareaClass} />
        </Field>
      </Card>

      <div className="flex items-center gap-[12px]">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex h-[44px] items-center gap-[8px] rounded-[4px] bg-black px-[24px] text-[14px] font-semibold text-white transition-colors hover:bg-[#1F1F1F] disabled:opacity-60"
        >
          {saving && <Loader2 className="size-[16px] animate-spin" />}
          {isEdit ? "Save changes" : "Add product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="h-[44px] rounded-[4px] px-[16px] text-[14px] text-black transition-colors hover:bg-[#EBEBEB]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}