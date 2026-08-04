import { describe, expect, it } from 'vitest'
import { getFeedBadgeLabel } from './index'

describe('getFeedBadgeLabel', () => {
  it('labels hazard WARNING as sewage alert', () => {
    expect(getFeedBadgeLabel('hazard', 'WARNING')).toBe('Sewage alert')
  })

  it('labels hazard CAUTION as recent overflow', () => {
    expect(getFeedBadgeLabel('hazard', 'CAUTION')).toBe('Recent overflow')
  })

  it('falls back for unknown hazard severity', () => {
    expect(getFeedBadgeLabel('hazard', 'OTHER')).toBe('Alert')
  })
})
