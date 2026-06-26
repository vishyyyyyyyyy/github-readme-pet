  import { getGitHubStats } from "@/lib/github";
  import { getPetState } from "@/lib/pet";
  import { ASSETS } from "@/lib/assets";

  export async function GET() {
  const stats = await getGitHubStats("vishyyyyyyyyy");

  const pet = getPetState(stats.currentStreak);
    const svg = `
    <svg  
      width="350"
      height="380"
      xmlns="http://www.w3.org/2000/svg"
    >

      <rect
        width="100%"
        height="100%"
        fill="none" 
      />

      <image
        href="${pet.asset}"
        x="30"
        y="90"
        width="250"
        height="250"
      />

      <image
        href="${ASSETS.fish}"
        x="33"
        y="20"
        width="250"
        height="110"
      />

      <text
        x="75"
        y="70"
        fill="white"
        font-size="16"
        font-weight="bold"
        font-family="Arial, sans-serif"
      >
        Commit Streak
      </text>

      <text
        x="90"
        y="105"
        fill="white"
        font-family="Arial, sans-serif"
      >
        <tspan font-size="32" font-weight="bold">
          ${stats.currentStreak}
        </tspan>

        <tspan font-size="16" font-weight="bold">
          Days
        </tspan>
      </text> 

    </svg>
    `;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  }