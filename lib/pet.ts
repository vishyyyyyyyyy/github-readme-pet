  import { ASSETS } from "@/lib/assets";


export function getPetState(commits: number) {
  if (commits === 0) {
    return {
        asset: ASSETS.sleepingCat,
    };
  }

  return {
      asset: ASSETS.awakeCat,
  };
}