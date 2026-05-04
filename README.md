# Frontend Mentor - Weather app solution

This is a solution to the [Weather app challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/weather-app-K1FhddVm49).

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [How to run locally](#how-to-run-locally)
  - [API and data source](#api-and-data-source)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [AI Collaboration](#ai-collaboration)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- Search for weather information by entering a location in the search bar
- View current weather conditions including temperature, weather icon, and location details
- See additional weather metrics like feels like temperature, humidity percentage, wind speed, and precipitation amounts
- Browse a 7-day weather forecast with daily high/low temperatures and weather icons
- View an hourly forecast showing temperature changes throughout the day
- Switch between different days of the week using the day selector in the hourly forecast section
- Toggle between Imperial and Metric measurement units via the units dropdown
- Switch between specific temperature, wind speed, and precipitation units via the units dropdown
- View the optimal layout for the interface depending on device screen size
- See hover and focus states for all interactive elements on the page

### Screenshot

![SkyLuxe Weather preview](./preview.jpg)

### Links

- Solution URL: [My Frontend Mentor solution URL](https://www.frontendmentor.io/solutions/weathernow-fTY6BD93v5)
- Live Site URL: [My live site URL](https://weather-now-chi-beige.vercel.app)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox + CSS Grid
- Mobile-first workflow
- [React 19](https://react.dev/) - UI library
- [Next.js 16 (App Router)](https://nextjs.org/) - React framework
- TypeScript
- Native Fetch API

### How to run locally

1. Clone the repository
2. Install dependencies
3. Start the dev server

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

For production checks:

```bash
npm run lint
npm run build
```

### API and data source

This project uses:

- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)
- [Open-Meteo Forecast API](https://open-meteo.com/en/docs)

No API key is required for the current implementation.

Data flow:

1. User enters a city name.
2. Geocoding endpoint resolves the city to latitude/longitude.
3. Forecast endpoint returns current, daily, and hourly weather.
4. Unit selections are passed as API query params and reflected in the UI.

### What I learned

- Building a complete weather dashboard with multiple forecast slices (current, daily, hourly) from one API provider
- Structuring unit conversion as API-level options rather than manual client-side conversions
- Managing asynchronous UI states cleanly (loading, error, success, retry)
- Designing a responsive, polished card-based layout while keeping semantic and accessible controls

### Continued development

- Add geolocation support to load weather for the user’s current position
- Persist unit preferences using local storage
- Add richer accessibility improvements (keyboard interactions for menu close, ARIA live updates)
- Add unit/integration tests for fetch and state logic

### AI Collaboration

AI was used to accelerate implementation and iteration.

- Tooling used: Cascade AI coding agent
- Used for: component/state scaffolding, styling iteration, and requirement-to-implementation alignment
- Worked well: rapid refactoring, consistent TypeScript updates, quick lint/build validation loop
- Needed manual review: final UX polish decisions, naming, and README curation

## Author

- Frontend Mentor - [@rafi983](https://www.frontendmentor.io/profile/rafi983)
