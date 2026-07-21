/**
 * TODO(auth-cookie-domain): INTERIM — delete this route when shared-domain
 * cookies replace the BFF. See surf-spots-api/docs/staging-domain-setup.md.
 *
 * Catch-all BFF (Backend For Frontend): /api/backend/* → Spring VITE_API_URL/*
 * Not the long-term auth architecture; only unblocks browser session cookies
 * while frontend and API sit on unrelated hosts (e.g. Vercel + Scaleway).
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { proxyToBackendApi } from '~/services/backendProxy.server'

export const loader = async ({ request, params }: LoaderFunctionArgs) =>
  proxyToBackendApi({ request, splatPath: params['*'] })

export const action = async ({ request, params }: ActionFunctionArgs) =>
  proxyToBackendApi({ request, splatPath: params['*'] })
