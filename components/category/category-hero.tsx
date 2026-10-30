import Image from "next/image";
// Placeholders: one hero photo per audience until we have one per page
import womenHero from "../../public/images/image 17.png";
import menHero from "../../public/images/image 17 (2).png";

export default function CategoryHero({
  title,
  audience = "Women",
}: {
  title: string;
  audience?: "Women" | "Men"; // small word above the title
}) {
  const hero = audience === "Men" ? menHero : womenHero;

  return (
    <section>
      <div className="relative h-[280px] w-full overflow-hidden bg-[#E8E4DF] sm:h-[420px] lg:h-[600px]">
        <Image
          src={hero}
          alt={`${audience}'s ${title}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="w-11/12 container mx-auto pb-[32px] pt-[48px] text-center lg:pb-[40px] lg:pt-[64px]">
        <p className="text-[14px] uppercase leading-[20px] text-[#4D4D4D]">{audience}</p>
        <h1 className="mt-[8px] text-[28px] font-extrabold uppercase leading-[34px] text-black lg:text-[40px] lg:leading-[48px]">
          {title}
        </h1>
      </div>
    </section>
  );
}