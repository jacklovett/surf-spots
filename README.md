# Surf Spots

A modern web application for discovering and sharing surf spots worldwide, built with React Router v7.

## Documentation

- [React Router v7 docs](https://reactrouter.com/dev)

## Quick Start

### Development

Install dependencies:
```bash
npm install
```

Run the dev server:
```bash
npm run dev
```

Visit `http://localhost:5173` to see your app.

### Environment Variables

Create a `.env` file in the `surf-spots` directory. See `.env.example` for a template.

**Required for development:**
- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:8080/api`)
- `SESSION_SECRET` - Secret key for session encryption (minimum 32 characters)

**Required for e2e tests:**
- `TEST_USER_EMAIL` - Email for test account (tests will create this account automatically)
- `TEST_USER_PASSWORD` - Password for test account
- `TEST_USER_NAME` - Name for test account (optional, defaults to "Test User")

**Optional:**
- `VITE_MAP_ACCESS_TOKEN` - Mapbox access token for maps
- `BASE_URL` - Base URL for the application
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` - Google OAuth
- `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`, `FACEBOOK_CALLBACK_URL` - Facebook OAuth

See .env.example

## Deployment

Currently deployed to Vercel:

https://surf-spots-five.vercel.app/

## Project Structure

```
surf-spots/
├── app/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── routes/         # React Router routes
│   ├── services/       # API services
│   ├── styles/         # SCSS styles
│   └── types/          # TypeScript types
├── public/             # Static assets
├── build/              # Build output (generated)
```

## Styling

This app uses SCSS for styling with a modular approach.

## Testing

Run end-to-end tests with Playwright:
```bash
npm run test
```

Run tests in UI mode:
```bash
npm run test:ui
```

## Build

Build for production:
```bash
npm run build
```

This creates:
- `build/client` - Client-side assets
- `build/server` - Server-side code

## Tech Stack

- **React Router v7** - Framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **SCSS** - Styling
- **Mapbox GL** - Maps
- **Playwright** - Testing

## License

MIT
