# Album Search App

## Overview

The Album Search App is a simple Next.js application that allows users to search for an artist's releases and view details about their albums. The app fetches data from the [Discogs API](https://www.discogs.com/), and displays information such as album titles, release year, label, and artist name. This application is designed with a responsive UI powered by [Chakra UI](https://chakra-ui.com/) for modern, accessible, and customizable components.

---

## Features

- Search for an artist by ID (retrieved from the Discogs API).
- Display top album releases of the artist with pagination.
- Responsive layout, designed for mobile-first viewing.
- Clean, minimalist UI with Chakra UI components.
- Error handling for fetching artist data or albums.
- Input field to jump to a specific page in the paginated album list.

---

## Tech Stack

- **Next.js** - React framework for building the app with server-side rendering.
- **Chakra UI** - A simple, modular, and accessible component library for React.
- **Axios** - Promise-based HTTP client for making API requests.
- **TypeScript** - For type safety and better developer experience.
- **Discogs API** - Used to fetch artist and album data.

---

## Setup

### Prerequisites

- Node.js (LTS version recommended)
- Discogs API token. You can get one by signing up at [Discogs](https://www.discogs.com/).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
