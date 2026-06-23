  import { ASSETS } from "@/lib/assets";


export function getPetState(commits: number) {
  const base = "https://github-readme-pet-yw8h.vercel.app";

  if (commits === 0) {
    return {
      asset: `${base}${ASSETS.sleepingCat}`,
    };
  }

  return {
    asset: `${base}${ASSETS.awakeCat}`,
  };
}