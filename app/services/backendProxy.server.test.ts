import { describe, expect, it } from 'vitest'

import { buildBackendProxyTargetUrl } from '~/services/backendProxy.server'

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
