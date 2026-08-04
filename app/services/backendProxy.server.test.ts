import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildBackendProxyTargetUrl,
  proxyToBackendApi,
} from '~/services/backendProxy.server'
import { DEFAULT_ERROR_MESSAGE } from '~/utils/errorUtils'

const TEST_API_BASE = 'https://api.example.com/api'

// TODO(auth-cookie-domain): delete this test file with the BFF when shared-domain cookies ship.
describe('buildBackendProxyTargetUrl', () => {
  it('should join Spring path and query onto the API base', () => {
    const url = buildBackendProxyTargetUrl(
      'surf-spots/within-bounds',
      '?debug=1',
      TEST_API_BASE,
    )
    expect(url).toBe(
      'https://api.example.com/api/surf-spots/within-bounds?debug=1',
    )
  })

  it('should reject path traversal', () => {
    expect(() =>
      buildBackendProxyTargetUrl('../secrets', '', TEST_API_BASE),
    ).toThrow('Invalid backend proxy path')
  })

  it('should reject absolute URLs in the splat', () => {
    expect(() =>
      buildBackendProxyTargetUrl('https://evil.example/x', '', TEST_API_BASE),
    ).toThrow('Invalid backend proxy path')
  })
})

describe('proxyToBackendApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('should return 502 JSON when upstream fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    )

    const response = await proxyToBackendApi({
      request: new Request('http://localhost/api/backend/countries'),
      splatPath: 'countries',
    })

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      message: DEFAULT_ERROR_MESSAGE,
    })
  })
})
