import Image from "next/image";
// Placeholder: replace with the gym leggings hero photo (navy leggings) from the design
import hero from "../../public/images/Frame 41 (1).png";

export default function GymLeggingsHero() {
  return (
    <section>
      <div className="relative h-[280px] w-full overflow-hidden bg-[#E8E4DF] sm:h-[420px] lg:h-[600px]">
        <Image
          src={hero}
          alt="Women's gym leggings"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="w-11/12 container mx-auto pb-[32px] pt-[48px] text-center lg:pb-[40px] lg:pt-[64px]">
        <p className="text-[14px] uppercase leading-[20px] text-[#4D4D4D]">Women</p>
        <h1 className="mt-[8px] text-[28px] font-extrabold uppercase leading-[34px] text-black lg:text-[40px] lg:leading-[48px]">
          Gym Leggings
        </h1>
      </div>
    </section>
  );
}