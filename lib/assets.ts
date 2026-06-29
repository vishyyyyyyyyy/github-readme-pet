import fs from "fs";
import path from "path";

function toBase64(filePath: string) {
  const file = fs.readFileSync(filePath);
  return `data:image/png;base64,${file.toString("base64")}`;
}

//convert assets -> base 64 + export as object
export const ASSETS = {
  sleepingCat: toBase64(path.join(process.cwd(), "public/assets/sleeping_cat.png")),
  awakeCat: toBase64(path.join(process.cwd(), "public/assets/awake_cat.png")),
  fish: toBase64(path.join(process.cwd(), "public/assets/fish.png")),
};