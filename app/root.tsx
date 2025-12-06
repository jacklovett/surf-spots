import { useEffect } from 'react'
import {
  Links,
  LinksFunction,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from 'react-router'

import {
  SettingsProvider,
  UserProvider,
  LayoutProvider,
  SurfSpotsProvider,
  TripProvider,
} from './contexts'
import { ErrorBoundary } from './components'

import { getSession } from './services/session.server'
import { User } from './types/user'

import './styles/main.scss'

interface LoaderData {
  user: User | null
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'))
  const user = session.get('user')
  return { user: user ?? null }
}

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    rel: 'preload',
    href: '/images/png/logo.png',
    as: 'image',
  },
  {
    rel: 'preload',
    href: '/images/png/logo-with-text.png',
    as: 'image',
  },
  {
    rel: 'prefetch',
    href: '/images/png/logo-no-text.png',
    as: 'image',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { user } = useLoaderData<LoaderData>()
  const location = useLocation()

  // Scroll to top when pathname changes (on navigation)
  useEffect(() => window.scrollTo(0, 0), [location.pathname])

  // Set CSS custom property for accurate mobile viewport height
  // This fixes the issue where 100vh includes browser UI on mobile
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    setViewportHeight()
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)

    return () => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [])

  return (
    <ErrorBoundary message="Application error - please refresh the page">
      <UserProvider {...{ user }}>
        <LayoutProvider>
          <SettingsProvider>
            <SurfSpotsProvider>
              <TripProvider>
                <Outlet />
              </TripProvider>
            </SurfSpotsProvider>
          </SettingsProvider>
        </LayoutProvider>
      </UserProvider>
    </ErrorBoundary>
  )
}
