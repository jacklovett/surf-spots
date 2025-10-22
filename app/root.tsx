import {
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
} from './contexts'

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
  return (
    <UserProvider {...{ user }}>
      <LayoutProvider>
        <SettingsProvider>
          <SurfSpotsProvider>
            <Outlet />
          </SurfSpotsProvider>
        </SettingsProvider>
      </LayoutProvider>
    </UserProvider>
  )
}
