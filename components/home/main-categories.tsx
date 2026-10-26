import Image from "next/image";
import Link from "next/link";
import img1 from "../../public/images/Frame 7 (16).png";
import img2 from "../../public/images/Frame 7 (17).png";
import img3 from "../../public/images/Frame 7 (18).png";

const categories = [
  { title: "Women", image: img1, href: "/women" },
  { title: "Men", image: img2, href: "/men" },
  { title: "Accessories", image: img3, href: "/accessories" },
];

export default function MainCategories() {
  return (
    <section className="w-11/12 container mx-auto pb-[80px] pt-[84px]">
      <h2 className="px-[16px] text-[20px] font-bold uppercase leading-[28px] text-black sm:text-[24px] lg:px-[20px]">
        Luxena main categories
      </h2>

      <div className="mt-[20px] grid grid-cols-1 gap-[32px] px-[16px] sm:grid-cols-3 sm:gap-[24px] lg:px-[20px]">
        {categories.map((category) => (
          <article key={category.title}>
            <Link
              href={category.href}
              aria-label={category.title}
              className="relative block aspect-[446/565] overflow-hidden rounded-[6px] bg-[#E8E8E8]"
            >
              <Image
                src={category.image}
                alt={`${category.title} collection`}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </Link>
            <h3 className="mt-[20px] text-[20px] font-bold uppercase leading-[24px] text-black">
              {category.title}
            </h3>
            <Link
              href={category.href}
              className="mt-[20px] inline-flex h-[48px] items-center rounded-full bg-black px-[24px] text-[16px] font-semibold text-white transition-colors hover:bg-[#333333]"
            >
              Shop Now
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}