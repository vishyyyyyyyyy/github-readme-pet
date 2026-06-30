# Create a README Widget using GitHub GraphQL API
Difficulty: Medium ▰▰▱▱ (but super beginner friendly!!)

Time: ~30 mins


## Introduction

Have you ever looked at someone's GitHub profile README and seen a cool snake contribution animation? 
<img width="800" height="auto" alt="githubsnake" src="https://github.com/user-attachments/assets/d29de9b5-f81c-433e-be45-cec87d732cc0" />


or a collection of stat cards that update dynamically?

<img width="400" height="auto" alt="githubstats" src="https://github.com/user-attachments/assets/a936e719-9153-4546-885a-5776b98c14bf" />

They’re a fun way to showcase your GitHub activity, but most profile READMEs use the same handful of stat templates to display commit streaks and repository counts on their READMEs, making it very common to see the same widget on hundreds of other profiles.

But what if you could make and customize your own?

In this tutorial, you’ll learn how to use GitHub GraphQL API,Next.js and SVGs to display user stats on a multi-state README kitty widget! ⸜(｡˃ ᵕ ˂ )⸝♡
Example below ⤵︎⟢

<img width="300" height="auto" alt="widgetex" src="https://github.com/user-attachments/assets/3f668cb7-aca7-4410-9538-b8d2753a42f5" />

(ps. the cat sleeps if your contribution streak is zero ( •͈૦•͈ ) )

Along the way, you’ll learn how to:
- Authenticate with the GitHub GraphQL API
- Query contribution data using GraphQL
- Calculate a contribution streak
- Embed images directly into SVGs using Base64
- Create an API route that generates an SVG on demand
- Deploy your widget, so it automatically updates on your GitHub profile
Let’s get started! ᯓ★

 ## Prerequisites
Here a few things you need before we get started on this project
1. A code editor (like VS Code)
2. Node.js (latest LTS  version installed with path variables)
3. A GitHub Account
4. Cute assets for your widget! You can use the Figma assets linked below, create your own, or anything cute you find online :)

Assets ⤷ ゛https://www.figma.com/community/file/1653482947097715199 ˎˊ˗

And don’t forget to grab a snack! (๑ᵔ⤙ᵔ๑)

## Step 1: Setting up your environment
First, let’s set up a space for this project! Open your terminal and run the following commands to create a new directory and initialize your Node.js environment
```
mkdir github-readme-widget
cd github-readme-widget
npm init -y
```
Next, let’s create the following project structure. Make sure you have these files!
```
app/
├── page.tsx
├── layout.tsx
└── api/
    └── pet/
        └── route.ts
lib/
├── assets.ts
├── github.ts
└── pet.ts
public/
└── assets/
    ├── sleeping_cat.png //you can rename the assets if needed :)
    ├── awake_cat.png
    └── fish.png
.env
```
## Step 2: Creating an Access Token
Now, we need to create a fine-grained Personal Access Token so our widget can access GitHub’s GraphQL API. 

But first, what is a GitHub GraphQL API? 
GitHub GraphQL API is an API provided by GitHub that lets you query and modify GitHub data using the GraphQL query language, rather than making separate REST requests! 

To create one, go to https://github.com → settings → credentials → fine-grained tokens, and then generate a new token.
<img width="800" height="auto" alt="github credentials (1)" src="https://github.com/user-attachments/assets/8bbbff1d-76bf-4acc-9164-66358eaffed3" />

You can choose whatever expiration date you’d like. Once the token is generated, GitHub will only show you the token **ONCE**, so make sure to copy it into your .env file before leaving the page like so.
```
GITHUB_TOKEN=your_token_here

```
## Step 3: Converting asset formats

Next, let’s convert our assets into Base64 format so we can embed them image directly inside our SVG widget without having to rely on external URLs, making our widget completely self-contained!

In assets.ts, we’ll start by importing Node’s ```fs```(FileSystem) to read image files and ```path``` to safely build file paths that work on different operating systems.

```
import fs from "fs";
import path from "path";
```
Next, we’ll create a Base64 conversion function that takes in a path of an image file and converts it into a Base64 data URL string so browsers recognize the assets as images.

```
function toBase64(filePath: string) {
  const file = fs.readFileSync(filePath);
  return `data:image/png;base64,${file.toString("base64")}`;
}
```

Lastly, let’s make an ```ASSETS``` object that stores all of our images
```
export const ASSETS = {
  sleepingCat: toBase64(path.join(process.cwd(), "public/assets/sleeping_cat.png")),
  awakeCat: toBase64(path.join(process.cwd(), "public/assets/awake_cat.png")),
  fish: toBase64(path.join(process.cwd(), "public/assets/fish.png")),
};
```
Here, ```process.cwd()``` returns your project’s root folder and ```path.join()```safely builds the full file path

After this runs, instead of "/assets/fish.png", you get something like 
```
{
  sleepingCat: "data:image/png;base64,iVBORw0KGgoAAA...",
  awakeCat: "data:image/png;base64,iVBORw0KGgoAAA...",
  fish: "data:image/png;base64,iVBORw0KGgoAAA..."
}
```
in Base64 data URLs!

## Step 4: Defining pet states

Moving on to pet.ts, here we will choose which kitty asset to display based on the commit count.

Start by importing the ```ASSETS``` objects
```
 import { ASSETS } from "@/lib/assets";
```
Then, create an export function called ```getPetState(commits:number)``` which expects a number representing how many contributions have been made. 
Next, we use a simple ```if``` statement. If the commit streak is 0, we return the sleeping cat asset. Otherwise, we return our awake cat asset!
```
export function getPetState(commits: number) { //export makes this func available to other files
  if (commits === 0) {
    return {
        asset: ASSETS.sleepingCat,
    };
  }

  return {
      asset: ASSETS.awakeCat,
  };
}
```
We are returning an object rather than an image, so it’s easy to add more information and expand our widget later. For example, if we wanted to add more properties without changing how the rest of the code is being used in the function. 

## Step 5: Obtaining GitHub stats with GraphQL
Now for the fun part! Let's learn how to use GitHub GraphQL API to display user stats! In this tutorial, we will be displaying the current contribution streak :)

In github.ts, let's create a new ```async``` function that takes in a string parameter for your username. Next, we’ll write a GraphQL query using a ``` $login``` variable so we can dynamically access GitHub data for any user
```
export async function getGitHubStats(username: string) {
  const query = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection { //GitHub groups con tributions(commit,pr) into a calendar view
        contributionCalendar {
          weeks { //splits the contributions into weeks
            contributionDays { //further splits the contributions into days 
              contributionCount //stores the contributions day by day grouped into weeks
            }
          }
        }
      }
    }
  }
  `;
```

Next, let's send an HTTP POST request to GitHub. We now get to use the token we placed in the .```env``` file~
```
 const res = await fetch("https://api.github.com/graphql", { //sends a network req to GraphQL endpoint
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, //reads from .env file
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Query,
      variables: {
        login: username,  //this is the data we are sending
      },
    }),
  });
```
This request query sends the username to GitHub and waits for a response that gets converted into JSON:
```
 const json = await res.json();
```

Now, let’s extract contribution data!(¬ᴗ ´¬ )
We store the contribution counts in a calendar variable, then use ```.flatMap()``` to remove the week structure and turn everything into one big array of days.
```
const calendar =
    json.data.user.contributionsCollection.contributionCalendar;

  const days = calendar.weeks.flatMap(
    (week: any) => week.contributionDays
  );
```
Getting closer! Now let's calculate the user commit streak. We pass our ```days``` array into a calculateCurrentStreak function and return it so we can display it on our widget :) 
```
  const currentStreak = calculateCurrentStreak(days);

  return {
    currentStreak,
  };
}
```
## Step 6: Calculating the streak
GitHub gives us dates from oldest →  newest. But to find the current streak, we need to reverse it to go from newest → oldest.

Let’s create a calculateCurrentStreak function that takes in our dates array and create a streak variable that starts counting up from zero and will increase as we find consecutive active days.
```
function calculateCurrentStreak(days: any[]) {
  let streak = 0;

  // reverse the array to start from the newest day
  const reversed = [...days].reverse();
```
We  need to choose where to start counting our streak from. By default, we will start at index 0 for today. 
```
  let startIndex = 0;
```
But there is a special case. What happens if today has 0 contributions but the user might make a contribution later? We need to create an if statement to check the previous day's contribution to start our streak from!
```
//here we check if there was a commit activity from the day before bcuz GitHub considers streak alive if day isn’t over yet!
  if (
    reversed.length > 0 &&
    reversed[0].contributionCount === 0
  ) {
    startIndex = 1; //start counting streak on day b4 newest day
  }
```

We need to look for a continuous chain of active days. So, let’s create a for loop!
As long as every day has at least 1 contribution, the streak extends. 
```
  for (let i = startIndex; i < reversed.length; i++) {
    if (reversed[i].contributionCount > 0) {
      Streak++; //if day has contributions keep checking
    } else {
      Break; //break the loop if a day has zero contributions
    }
  }

  return streak;
}
```

## Step 7: Creating an SVG
Let’s put all of this together! In route.ts import the helper functions ```getGitHubStas()``` to fetch the current GitHub streak, ```getPetState()``` to decide whether the cat should be sleeping or awake and ```ASSETS``` that contain Base64 data objects
```
 import { getGitHubStats } from "@/lib/github";
  import { getPetState } from "@/lib/pet";
  import { ASSETS } from "@/lib/assets";
```
Next, create a GET API route. Every time someone visits ```/api/pet```, this function will run automatically, get your latest GitHub contribution streak and generate an SVG!
```
  export async function GET() {
  const stats = await getGitHubStats("vishyyyyyyyyy"); //replace this with your own GitHub username
```
Now we’ll decide which kitty to display based on the current streak with our helper function from pet.ts
```
  const pet = getPetState(stats.currentStreak);
```
The next step is creating our SVG. An SVG is just XML that describes shapes, images, and text. Since we are using a template string, we can insert JavaScript values (like our streak count or Base64 images) directly into the SVG! 

First, create the SVG canvas. Ours is 330 x 330 pixels, but feel free to experiment with different sizes for different layout options!
```
    const svg = `
    <svg  
      width="330" //creates and svg 330x330 pixels
      height="330"
      xmlns="http://www.w3.org/2000/svg"
    >
```
Now let’s create a rectangle. This rectangle will be our “background”. While placing all the assets, it’s helpful to keep the fill=”black” or any other color so you can see where things are being placed!
```
      <rect
        width="100%"
        height="100%"
        fill="black" //change the fill to “none “ after you are happy with the layout :D 
      />
```
Here, I’ll add the cat! I’ve positioned it at the bottom of the rectangle
```
      <image
        href="${pet.asset}" //pet.asset contains either the sleeping or awake cat based on streak
        x="30"
        y="90"
        width="250"
        height="250"
      />
```
After that, let’s place the fish above the cat.
```
      <image
        href="${ASSETS.fish}"
        x="33"
        y="20"
        width="250"
        height="110"
      />
```
Try playing around with the x, y, width, and height values until you are happy with the positioning ٩(^ᗜ^ )و ´-

Next, let’s add some text to our widget.
```
 <text
        x="70"
        y="70"
        fill="white"
        font-size="16"
        font-weight="bold"
        font-family="Arial, sans-serif"
      >
     Commit Streak
      </text>
```
Notice below that we’re using <tspan> tags instead of one large <text> element. This lets us style different parts of the same line. In this case, I made the actuarial streak number count font size a lot larger than the word “days”. 
```
      <text
        x="90"
        y="105"
        fill="white"
        font-family="Arial, sans-serif"
      >
        <tspan font-size="32" font-weight="bold"> //add in the stat streak text in a span tag
          ${stats.currentStreak}
        </tspan>

        <tspan font-size="16" font-weight="bold">
          Days
        </tspan>
      </text> 

    </svg>
    `;
```
Once we’ve finished building the SVG, we just need to return it as a response.
```"Content-Type": "image/svg+xml"  ``` This header is important because it tells browsers, especially GitHub, to render the response as an SVG instead of plain text
```
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml", //tells the browser this is an SVG image
      },
    });
  }
```
(ps. You can see how your widget would look on the web by running ```npm run dev``` in your project terminal)

## Step 8: Deploying + adding the widget to your readme
Awesome job for making it this far! ♪┏(˶⎚-⎚˶)┛♪
Now let's deploy the project to Vercel, then copy the URL for your API route. It should look something like
https://your-project.vercel.app/api/pet 
Now simply embed your deployment in your GitHub README as an img!
```
<img src="https://github-readme-pet.vercel.app/api/pet" /> //edit the link so it matches your url!
```
Your final should look something like this!♪┏(˶⎚-⎚˶)┛♪
<img width="800" height="auto" alt="full readme + widget" src="https://github.com/user-attachments/assets/c4ca7021-3210-4599-a219-d30fc5ea2c82" />


Every time someone visits your GitHub profile, GitHub will request your SVG from ```/api/pet```, dynamically updating your contribution streak.

Congrats!! You just built your very own dynamic GitHub README widget. From here, you can customize it however you’d like by adding more kitty states and different stats using other [GitHub GraphQL queries](https://docs.github.com/en/graphql/reference?utm_source=chatgpt.com )
, animations or something completely new!
