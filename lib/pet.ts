  import { ASSETS } from "@/lib/assets"; 

//return sleeping cat if no commit, else return aqwake cat as OBJECTS
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