import Image from "next/image";
import Link from "next/link";
// Placeholder: replace with the Men hero image
import hero from "../../public/images/image 17 (2).png";

export default function MenHero() {
  return (
    <section className="relative -mt-[72px] h-[560px] w-full overflow-hidden bg-[#8C7B6B] sm:h-[820px] lg:-mt-[103px] lg:h-[960px]">
      <Image
        src={hero}
        alt="Men wearing the Devant collection"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* Dark overlay so the white text is readable */}
      <div className="absolute inset-0 bg-[#000000]/20" />

      <div className="w-11/12 container mx-auto absolute inset-x-0 bottom-[48px] flex flex-col items-center px-[16px] text-center text-white lg:bottom-[60px]">
        <h1 className="text-[36px] font-extrabold uppercase leading-none tracking-[-0.02em] sm:text-[62px]">
          Devant just dropped
        </h1>
        <p className="mt-[16px] max-w-[640px] text-[16px] leading-[26px] sm:text-[20px] sm:leading-[28px]">
          Nearly a decade out of circulation but never out of demand. Devant is back, and this
          time it’s for good.
        </p>
        <Link
          href="/men/devant"
          className="mt-[24px] flex h-[48px] items-center rounded-full bg-white px-[24px] text-[16px] font-semibold text-black transition-colors hover:bg-black hover:text-white"
        >
          Shop Devant
        </Link>
      </div>
    </section>
  );
}