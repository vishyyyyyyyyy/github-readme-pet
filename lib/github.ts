export async function getGitHubStats(username: string) {
  const query = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
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

  const calendar =
    json.data.user.contributionsCollection.contributionCalendar;

  const days = calendar.weeks.flatMap(
    (week: any) => week.contributionDays
  );

  const currentStreak = calculateCurrentStreak(days);

  return {
    //contributions: calendar.totalContributions,
    currentStreak,
    //projects: json.data.user.repositories.totalCount,
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