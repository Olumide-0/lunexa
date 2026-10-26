import Image from "next/image";
import Link from "next/link";
import banner from "../../public/images/Frame 31.png";

export default function PromoBanner() {
  return (
    <section className="relative h-[420px] w-full overflow-hidden bg-[#BFB8AE] lg:h-[620px]">
      <Image
        src={banner}
        alt="Model wearing a seamless workout T-shirt"
        fill
        sizes="100vw"
        className="h-full w-full object-cover"
      />

      <div className="w-11/12 container mx-auto absolute inset-x-0 bottom-[48px] flex flex-col items-center px-[16px] text-center text-white lg:bottom-[77px]">
        <h2 className="text-[28px] font-extrabold uppercase leading-[34px] tracking-[-0.01em] sm:text-[44px] sm:leading-[54px]">
          Workout shirts you’ll
          <br />
          want to live in
        </h2>
        <p className="mt-[16px] text-[15px] leading-[22px] sm:text-[18px]">
          For repping, running, resting, everything.
        </p>
        <Link
          href="/men/t-shirts-and-tops"
          className="mt-[24px] flex h-[48px] items-center rounded-full bg-white px-[24px] text-[16px] font-semibold text-black transition-colors hover:bg-black hover:text-white"
        >
          Shop T-Shirts
        </Link>
      </div>
    </section>
  );
}