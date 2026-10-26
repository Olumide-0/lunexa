"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ChevronRight } from "lucide-react";
import { slugify } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

type FooterColumn = {
  title: string;
  basePath: string; // where the links point, e.g. "/women" → /women/gym-leggings
  links: string[];
};

const shopColumns: FooterColumn[] = [
  {
    title: "Women's Leggings",
    basePath: "/women",
    links: [
      "Gym Leggings",
      "Leggings With Pockets",
      "High Waisted Leggings",
      "Scrunch Bum Leggings",
      "Black Leggings",
      "Flared Leggings",
      "Seamless Leggings",
      "Petite Gym Leggings",
    ],
  },
  {
    title: "Women's Gymwear",
    basePath: "/women",
    links: [
      "Women’s Gym Wear",
      "Women gym Shorts",
      "Running Shorts",
      "Sport Bras",
      "High Impact Sport Bras",
      "Black Sports Bras",
      "Matching Sets",
      "Lounge Wear",
    ],
  },
  {
    title: "Men's Gymwear",
    basePath: "/men",
    links: [
      "Men’s Gym Wear",
      "Men Gym shorts",
      "Shorts with Pockets",
      "Men’s Running Shorts",
      "Gym Shirts",
      "Sleeveless T-Shirts",
      "Gym Stringers",
      "Men’s Baselayers",
    ],
  },
  {
    title: "Accessories",
    basePath: "/accessories",
    links: [
      "Women’s Underwear",
      "Men’s Underwear",
      "Workout Bags",
      "Duffel Bags",
      "Gym Socks",
      "Crew Socks",
      "Caps",
      "Beanies",
    ],
  },
];

const infoColumns: FooterColumn[] = [
  {
    title: "Help",
    basePath: "/help",
    links: [
      "FAQ",
      "Delivery Information",
      "Returns Policy",
      "Make A Return",
      "Orders",
      "Submit a Fake",
    ],
  },
  {
    title: "My Account",
    basePath: "",
    links: ["Login", "Register"],
  },
  {
    title: "Pages",
    basePath: "",
    links: [
      "Refer a Friend",
      "Lunexa Central",
      "About Us",
      "Careers",
      "Student Discounts",
      "Training App",
      "Miltary Discount",
    ],
  },
];

const legalLinks = ["Terms", "Privacy", "Cookies Policy", "Cookies Preferences"];

// These footer items open the auth modal instead of going to a page
const authLinks: Record<string, "login" | "register"> = {
  Login: "login",
  Register: "register",
};

const linkClass =
  "text-[17px] leading-[22px] text-[#D4D4D4] transition-colors hover:text-white";

function FooterLinks({ column }: { column: FooterColumn }) {
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  return (
    <div>
      <h3 className="text-[20px] font-bold uppercase leading-[24px] text-white">
        {column.title}
      </h3>
      <ul className="mt-[26px] flex flex-col gap-[25px]">
        {column.links.map((link) => {
          const authView = authLinks[link];
          return (
            <li key={link}>
              {authView ? (
                <button
                  type="button"
                  onClick={() => openAuthModal(authView)}
                  className={`text-left ${linkClass}`}
                >
                  {link}
                </button>
              ) : (
                <Link href={`${column.basePath}/${slugify(link)}`} className={linkClass}>
                  {link}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser from reloading the page
    if (!email.trim()) return;
    // Backend phase: this is where we'll send the email to our API
    setSubscribed(true);
    setEmail("");
  }

  return (
    <footer className="bg-black text-white">
      <div className="w-11/12 container mx-auto px-[16px] pb-[42px] pt-[48px] lg:px-[32px]">
        {/* Top: shop links */}
        <div className="grid grid-cols-2 gap-x-[24px] gap-y-[40px] lg:grid-cols-[29%_29%_27%_1fr] lg:gap-x-0">
          {shopColumns.map((column) => (
            <FooterLinks key={column.title} column={column} />
          ))}
        </div>

        <hr className="mt-[62px] border-t border-[#4D4D4D]" />

        {/* Middle: help links + newsletter */}
        <div className="mt-[55px] grid grid-cols-2 gap-x-[24px] gap-y-[40px] lg:grid-cols-[20%_20%_20%_1fr] lg:gap-x-0">
          {infoColumns.map((column) => (
            <FooterLinks key={column.title} column={column} />
          ))}

          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-[18px] font-bold uppercase leading-[24px] text-white">
              Sign up for our newsletter - enter your email below
            </h3>

            <form
              onSubmit={handleSubscribe}
              className="mt-[25px] flex h-[61px] border border-[#D4D4D4]"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubscribed(false);
                }}
                placeholder="Enter your email"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-[20px] text-[17px] text-white outline-none placeholder:text-[#8A8A8A]"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="flex w-[64px] shrink-0 items-center justify-center bg-[#E5E5E5] text-black transition-colors hover:bg-white"
              >
                <ChevronRight strokeWidth={1.5} className="size-[26px]" />
              </button>
            </form>

            {subscribed && (
              <p role="status" className="mt-[12px] text-[15px] leading-[20px] text-[#D4D4D4]">
                Thanks for subscribing! Keep an eye on your inbox.
              </p>
            )}

            <h3 className="mt-[37px] text-[15px] font-bold uppercase leading-[20px] text-white">
              Follow us
            </h3>
            <p className="mt-[25px] text-[17px] leading-[24px] text-[#D4D4D4]">
              Help us improve the website and{" "}
              <Link
                href="/feedback"
                className="underline underline-offset-[3px] transition-colors hover:text-white"
              >
                leave feedback
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom: copyright + legal */}
        <div className="mt-[120px] flex flex-col gap-[20px] lg:mt-[175px] lg:flex-row lg:items-center lg:justify-between">
          <p className="text-[17px] leading-[22px] text-white">
            © 2025 |Lunexa Limited | All Rights Reserved. | We Do Gym.
          </p>
          <nav className="flex flex-wrap gap-x-[20px] gap-y-[8px]">
            {legalLinks.map((link) => (
              <Link
                key={link}
                href={`/${slugify(link)}`}
                className="text-[17px] leading-[22px] text-white underline underline-offset-[3px] transition-opacity hover:opacity-70"
              >
                {link}
              </Link>
            ))}
          </nav>
        </div>

        <hr className="mt-[16px] border-t border-[#4D4D4D]" />
      </div>
    </footer>
  );
}