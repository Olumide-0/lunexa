import Image from "next/image";
import Link from "next/link";
import banner from "../../public/images/Frame 31 (1).png";

export default function RestockBanner() {
  return (
    <section className="relative h-[420px] w-full overflow-hidden bg-[#BFB8AE] lg:h-[620px]">
      <Image
        src={banner}
        alt="Women wearing the Everyday Seamless collection"
        fill
        sizes="100vw"
        className="h-full w-full object-cover object-top"
      />

      {/* Dark overlay so the white text is readable */}
      <div className="absolute inset-0 bg-[#000000]/20" />

      <div className="w-11/12 container mx-auto absolute inset-x-0 bottom-[48px] flex flex-col items-center px-[16px] text-center text-white lg:bottom-[80px]">
        <h2 className="text-[28px] font-extrabold uppercase leading-[34px] tracking-[-0.01em] sm:text-[44px] sm:leading-[52px]">
          Everyday seamless restock
        </h2>
        <p className="mt-[12px] text-[15px] leading-[22px] sm:text-[20px] sm:leading-[28px]">
          These are your soft, second-skin, seamless sets that keep you comfy and confident.
        </p>
        <Link
          href="/women/everyday-seamless"
          className="mt-[24px] flex h-[48px] items-center rounded-full bg-white px-[24px] text-[16px] font-semibold text-black transition-colors hover:bg-black hover:text-white"
        >
          Shop now
        </Link>
      </div>
    </section>
  );
}