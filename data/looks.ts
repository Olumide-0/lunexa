import type { Look } from "@/types";
import img1 from "../public/images/Frame 7.png";
import img2 from "../public/images/Frame 8.png";
import img3 from "../public/images/Frame 9.png";

export const looks: Look[] = [
  { id: "1", handle: "kelsiefaithhthomas", image: img1 },
  { id: "2", handle: "whatemwore", image: img2 },
  { id: "3", handle: "dantheschotenx", image: img3 },
  // Placeholder: reuses img2 until the real 4th image is ready
  { id: "4", handle: "lunexa", image: img2 },
];