# Belverra Hunter/Jumper Association Website

This is a static website for the fictional Belverra Hunter/Jumper Association in Topline. It has no database and can be hosted on Netlify, GitHub Pages, or any static web host.

## Files

- `index.html` — Home page
- `shows.html` — Shows and results
- `standings.html` — Automatic leaderboards
- `hunters.html` — Hunter program
- `jumpers.html` — Jumper program
- `rulebook.html` — Rules and CSV instructions
- `awards.html` — Awards and Hall of Fame
- `style.css` — Modern Southern estate styling
- `script.js` — CSV loading and leaderboard calculations
- `results.csv` — The file you edit after each show
- `assets/bhja-logo-web.png` — Full BHJA logo used on the home page
- `assets/bhja-logo-transparent.png` — Transparent logo used in the header

## Updating results

Use the BHJA / Topline show-results CSV export as `results.csv`. The website now expects the actual export headers from the first BHJA show:

```csv
Show ID,Show Name,Show Date,Game Year,Host,Class,Discipline,Level,Section,Final,Placing,Score,Eliminated,Animal ID,Animal Name,Horse/Dog,Owner,Stable/Kennel
```

The site calculates points automatically from `Place`:

- 1st = 10
- 2nd = 7
- 3rd = 5
- 4th = 3
- 5th = 1

You do **not** need to manually add `leaderboard_points`, `qualification_points`, or `top_three`.

For hunter advancement, the site automatically counts 1st, 2nd, and 3rd as top-three placings.

For jumper advancement, the site automatically uses the placing points as qualification points.

## Hosting

To host on Netlify, drag the unzipped folder into Netlify's deploy area. To update standings later, edit `results.csv` and redeploy the folder.


## Branding update

This version uses the BHJA horse-and-rider line-art logo and a warmer, more modern Southern estate palette: ivory, linen, taupe, espresso brown, muted olive, clay, and rosewood. The leaderboard logic is unchanged from the Topline CSV version.


## Opening Classic Data

This package includes `results.csv` from the BHJA Opening Classic held on 2026-06-18. It contains 48 result rows, 16 horses, and 6 stables.
