import { describe, expect, it } from 'vitest'

import {
  buildExpectedReturnInstantFromLocalTime,
  hhMmFromTimeDigitsOrEmpty,
  parseLocalTimeToMinutes,
  sessionWindowMinutesFromTimeInputs,
  stepBackTimeDigitBuffer,
  timeToHHmm,
} from './dateUtils'

describe('parseLocalTimeToMinutes', () => {
  it('should parse HH:mm and strip fractional seconds', () => {
    expect(parseLocalTimeToMinutes('09:15')).toBe(9 * 60 + 15)
    expect(parseLocalTimeToMinutes('14:32:05.123456')).toBe(14 * 60 + 32)
  })

  it('should reject invalid clock values', () => {
    expect(parseLocalTimeToMinutes('')).toBeNull()
    expect(parseLocalTimeToMinutes('25:00')).toBeNull()
    expect(parseLocalTimeToMinutes('12:60')).toBeNull()
    expect(parseLocalTimeToMinutes('noon')).toBeNull()
  })
})

describe('timeToHHmm', () => {
  it('should canonicalize wall times to HH:mm', () => {
    expect(timeToHHmm('9:05:00')).toBe('09:05')
    expect(timeToHHmm('bad')).toBe('')
  })
})

describe('hhMmFromTimeDigitsOrEmpty', () => {
  it('should return HH:mm only for complete valid digit buffers', () => {
    expect(hhMmFromTimeDigitsOrEmpty('0915')).toBe('09:15')
    expect(hhMmFromTimeDigitsOrEmpty('091')).toBe('')
    expect(hhMmFromTimeDigitsOrEmpty('9966')).toBe('')
  })
})

describe('stepBackTimeDigitBuffer', () => {
  it('should zero the rightmost digit on a valid four-digit clock', () => {
    expect(stepBackTimeDigitBuffer('1234')).toBe('1230')
    expect(stepBackTimeDigitBuffer('1230')).toBe('1200')
    expect(stepBackTimeDigitBuffer('0000')).toBe('')
  })

  it('should drop the last digit when incomplete', () => {
    expect(stepBackTimeDigitBuffer('12')).toBe('1')
  })
})

describe('sessionWindowMinutesFromTimeInputs', () => {
  it('should return the positive same-day span', () => {
    expect(sessionWindowMinutesFromTimeInputs('09:00', '10:30')).toBe(90)
    expect(sessionWindowMinutesFromTimeInputs('10:00', '09:00')).toBeNull()
    expect(sessionWindowMinutesFromTimeInputs('', '10:00')).toBeNull()
  })
})

describe('buildExpectedReturnInstantFromLocalTime', () => {
  it('should return null for invalid time', () => {
    expect(buildExpectedReturnInstantFromLocalTime('nope')).toBeNull()
  })

  it('should use today when the wall time is still ahead', () => {
    const reference = new Date(2026, 6, 18, 10, 0, 0, 0)
    const instant = buildExpectedReturnInstantFromLocalTime('15:30', reference)
    expect(instant).not.toBeNull()
    const parsed = new Date(instant as string)
    expect(parsed.getHours()).toBe(15)
    expect(parsed.getMinutes()).toBe(30)
    expect(parsed.getDate()).toBe(18)
  })

  it('should roll to tomorrow when the wall time has already passed', () => {
    const reference = new Date(2026, 6, 18, 16, 0, 0, 0)
    const instant = buildExpectedReturnInstantFromLocalTime('15:30', reference)
    expect(instant).not.toBeNull()
    const parsed = new Date(instant as string)
    expect(parsed.getDate()).toBe(19)
    expect(parsed.getHours()).toBe(15)
    expect(parsed.getMinutes()).toBe(30)
  })
})
