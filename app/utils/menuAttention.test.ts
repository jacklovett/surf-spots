import { describe, expect, it } from 'vitest'

import { hasUnseenIds, menuAttentionStorageKey } from './menuAttention'

describe('hasUnseenIds', () => {
  it('should return false when there are no current ids', () => {
    expect(hasUnseenIds([], [])).toBe(false)
    expect(hasUnseenIds([], ['old'])).toBe(false)
  })

  it('should return true when any current id is not in the seen set', () => {
    expect(hasUnseenIds(['a', 'b'], ['a'])).toBe(true)
    expect(hasUnseenIds(['a'], [])).toBe(true)
  })

  it('should return false when every current id was already seen', () => {
    expect(hasUnseenIds(['a', 'b'], ['a', 'b'])).toBe(false)
    expect(hasUnseenIds(['a'], ['a', 'b', 'c'])).toBe(false)
  })
})

describe('menuAttentionStorageKey', () => {
  it('should namespace by user and menu key', () => {
    expect(menuAttentionStorageKey('user-1', 'watch-list')).toBe(
      'menu-attention:user-1:watch-list',
    )
  })
})
