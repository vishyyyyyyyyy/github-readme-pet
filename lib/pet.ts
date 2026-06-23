    export function getPetState(commits: number) {
  if (commits === 0) {
    return {
      asset: "/assets/sleeping_cat.png",
    };
  }

  return {
    asset: "/assets/awake_cat.png",
  };
}