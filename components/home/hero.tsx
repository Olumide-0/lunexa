import Image from "next/image";
import Link from "next/link";
import hero from "../../public/images/image 17.png";


export default function Hero() {
  return (
    <section className="relative h-[560px] w-full overflow-hidden bg-[#BDBDBD] sm:h-[760px] lg:h-[957px]">
      <Image
        src={hero}
        alt="Model wearing the Whitney sports bra and shorts"
        fill
        priority
        sizes="100vw"
        className="object-cover object-top"
      />

      {/* Dark overlay so the white text is readable */}
      <div className="absolute inset-0 bg-[#000000]/20" />

      <div className="w-11/12 container mx-auto absolute inset-x-0 bottom-[60px] flex flex-col items-center px-[16px] text-center text-white lg:bottom-[104px]">
        <h1 className="text-[40px] font-extrabold uppercase leading-none tracking-[-0.02em] sm:text-[64px]">
          Just Dropped
        </h1>
        <p className="mt-[20px] max-w-[820px] text-[16px] sm:text-[22px]">
          The Whitney leggings you love, now in shorts, flares &amp; vibrant new colours
        </p>
        <Link
          href="/women"
          className="mt-[30px] rounded-full bg-white px-[29px] py-[14px] text-[18px] font-semibold text-black transition-colors hover:bg-black hover:text-white"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
}