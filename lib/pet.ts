export function getPetState(commits: number) {
  const base = "https://github-readme-pet-yw8h.vercel.app";

  if (commits === 0) {
    return {
      asset: `${base}/assets/sleeping_cat.png`,
    };
  }

  return {
    asset: `${base}/assets/awake_cat.png`,
  };
}