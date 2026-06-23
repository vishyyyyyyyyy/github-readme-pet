export async function getGitHubStats(username: string) {
  const query = `
  query($login:String!) {
    user(login:$login) {
      repositories(ownerAffiliations: OWNER) {
        totalCount
      }

      contributionsCollection {
        contributionCalendar {
          totalContributions

          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: {
        login: username,
      },
    }),
  });

  const json = await res.json();

  // If the GitHub API returns errors (e.g. missing or invalid token),
  // `json.data` or `json.data.user` may be undefined which would
  // cause a server crash when accessing properties. Handle this
  // gracefully and return safe defaults so the endpoint doesn't 500.
  if (!json || !json.data || !json.data.user) {
    console.error("GitHub API error or missing data:", json);
    return {
      contributions: 0,
      currentStreak: 0,
      projects: 0,
    };
  }

  const calendar = json.data.user.contributionsCollection.contributionCalendar;

  const days = calendar.weeks.flatMap(
    (week: any) => week.contributionDays
  );

  const currentStreak = calculateCurrentStreak(days);

  return {
    contributions: calendar.totalContributions,
    currentStreak,
    projects: json.data.user.repositories.totalCount,
  };
}

function calculateCurrentStreak(days: any[]) {
  let streak = 0;

  // currentday
  const reversed = [...days].reverse();

  // if today has 0 contributions, start from day b4.
  let startIndex = 0;

  if (
    reversed.length > 0 &&
    reversed[0].contributionCount === 0
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < reversed.length; i++) {
    if (reversed[i].contributionCount > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}