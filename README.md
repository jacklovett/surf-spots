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

Create a `.env` file in the `surf-spots` directory:
```env
VITE_API_URL=http://localhost:8080/api
VITE_MAP_ACCESS_TOKEN=your_mapbox_token
SESSION_SECRET=your-secret-key-min-32-chars
BASE_URL=http://localhost:5173

# Optional OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5173/auth/google

FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5173/auth/facebook
```

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
