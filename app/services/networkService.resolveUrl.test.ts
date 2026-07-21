import { describe, expect, it } from 'vitest'

import {
  BACKEND_PROXY_PREFIX,
  resolveNetworkRequestUrl,
} from '~/services/networkService'

// TODO(auth-cookie-domain): rewrite these expectations when browser calls VITE_API_URL
// directly (shared cookie Domain); BFF rewrite goes away.
describe('resolveNetworkRequestUrl', () => {
  it('should send browser Spring paths through the Remix BFF', () => {
    const resolved = resolveNetworkRequestUrl('countries/continent/africa', {
      isBrowser: true,
    })
    expect(resolved.url).toBe(`${BACKEND_PROXY_PREFIX}/countries/continent/africa`)
    expect(resolved.credentials).toBe('include')
    expect(resolved.injectServerOrigin).toBe(false)
  })

  it('should call Spring directly on the server', () => {
    const resolved = resolveNetworkRequestUrl('surf-spots/within-bounds', {
      isBrowser: false,
    })
    expect(resolved.url).toMatch(/\/surf-spots\/within-bounds$/)
    expect(resolved.url.startsWith(BACKEND_PROXY_PREFIX)).toBe(false)
    expect(resolved.injectServerOrigin).toBe(true)
    expect(resolved.credentials).toBe('include')
  })

  it('should leave explicit Remix paths and external URLs alone', () => {
    expect(resolveNetworkRequestUrl('/resources/trips', { isBrowser: true }).url).toBe(
      '/resources/trips',
    )
    expect(
      resolveNetworkRequestUrl('https://s3.example/upload', { isBrowser: true }),
    ).toEqual({
      url: 'https://s3.example/upload',
      injectServerOrigin: false,
      credentials: 'omit',
    })
  })
})
