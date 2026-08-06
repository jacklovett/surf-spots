import { useEffect } from 'react'
import {
  data,
  HeadersFunction,
  Links,
  LinksFunction,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from 'react-router'

import {
  SettingsProvider,
  UserProvider,
  LayoutProvider,
  SurfSpotsProvider,
  TripProvider,
  ToastProvider,
  SignUpPromptProvider,
  LiveSessionProvider,
} from './contexts'
import { ErrorBoundary as AppErrorBoundary, FloatingSpeedDial, ToastContainer, WelcomeFromUrlToast } from './components'
import { ERROR_BOUNDARY_APP } from './utils/errorUtils'

export { ErrorBoundary } from './RootErrorBoundary'

import { useScrollToTopOnNavigation } from './hooks'
import { destroySession, getSession } from './services/session.server'
import { isNetworkError, privateCacheControlHeader } from './services/networkService'
import { loadInProgressSurfSessionForUser } from './services/surfSession.server'
import { SessionUser } from './types/user'
import { SurfSessionListItem } from './types/surfSpots'

import mainStylesheet from './styles/main.scss?url'
import mapboxStylesheet from 'mapbox-gl/dist/mapbox-gl.css?url'

interface LoaderData {
  user: SessionUser | null
  inProgressSession: SurfSessionListItem | null
  liveSessionRefreshFailed: boolean
}

const securityHeaders: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

export const loader: LoaderFunction = async ({ request }) => {
  const cookie = request.headers.get('Cookie') ?? ''
  const session = await getSession(cookie)
  let user = session.get('user') as SessionUser | undefined
  let clearedSessionCookie: string | undefined

  let inProgressSession: SurfSessionListItem | null = null
  let liveSessionRefreshFailed = false
  if (user?.id) {
    try {
      inProgressSession = await loadInProgressSurfSessionForUser(cookie)
    } catch (error) {
      const status = isNetworkError(error) ? error.status : undefined
      // Once-per-navigation session check: in-progress requires auth. Stale
      // cookie after wipe/delete → drop session so nav shows logged-out.
      // Do not redirect (public pages stay put). Protected loaders still use
      // redirectOnUnauthorized when their own API calls return 401/403.
      if (status === 401 || status === 403) {
        clearedSessionCookie = await destroySession(session)
        user = undefined
        inProgressSession = null
      } else {
        liveSessionRefreshFailed = true
        console.error('Root loader: failed to load in-progress session', {
          status,
          responseSummary: isNetworkError(error)
            ? error.responseSummary
            : undefined,
          message: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  return data(
    { user: user ?? null, inProgressSession, liveSessionRefreshFailed },
    {
      headers: {
        ...securityHeaders,
        ...privateCacheControlHeader,
        ...(clearedSessionCookie
          ? { 'Set-Cookie': clearedSessionCookie }
          : {}),
      },
    },
  )
}

export const headers: HeadersFunction = ({ loaderHeaders }) => loaderHeaders

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: mainStylesheet },
  { rel: 'stylesheet', href: mapboxStylesheet },
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
  useScrollToTopOnNavigation()

  return (
    // suppressHydrationWarning: browser extensions often mutate html/body attrs
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { user, inProgressSession, liveSessionRefreshFailed } =
    useLoaderData<LoaderData>()

  // Set CSS custom property for accurate mobile viewport height
  // This fixes the issue where 100vh includes browser UI on mobile
  useEffect(() => {
    const setViewportHeight = () => {
      const viewportHeightUnit = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${viewportHeightUnit}px`)
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
    <AppErrorBoundary message={ERROR_BOUNDARY_APP}>
      <UserProvider {...{ user }}>
        <LayoutProvider>
          <SettingsProvider>
            <SurfSpotsProvider>
              <TripProvider>
                <ToastProvider>
                  <WelcomeFromUrlToast />
                  <SignUpPromptProvider>
                    <LiveSessionProvider
                      initialInProgressSession={inProgressSession}
                      initialLiveSessionRefreshFailed={liveSessionRefreshFailed}
                    >
                      <Outlet />
                      <FloatingSpeedDial />
                      <ToastContainer />
                    </LiveSessionProvider>
                  </SignUpPromptProvider>
                </ToastProvider>
              </TripProvider>
            </SurfSpotsProvider>
          </SettingsProvider>
        </LayoutProvider>
      </UserProvider>
    </AppErrorBoundary>
  )
}
