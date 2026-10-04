import { describe, expect, it } from 'vitest'
import { createPlan } from '../../../shared/models'
import {
  blockedLayoutMessage,
  isPlanFinalized,
  markPlanFinalized,
  unmarkPlanFinalized,
} from '../finalizeViewModel'

describe('finalize module', () => {
  it('marks a plan finalized with a timestamped record', () => {
    const plan = createPlan('待交付', false)
    const finalized = markPlanFinalized(plan, '2026-10-04T09:00:00.000Z')

    expect(isPlanFinalized(finalized)).toBe(true)
    expect(finalized.finalizedAt).toBe('2026-10-04T09:00:00.000Z')
    expect(finalized.finalizeHistory).toEqual([{ action: 'finalize', at: '2026-10-04T09:00:00.000Z' }])
    // 原方案不被修改
    expect(plan.finalized).toBe(false)
  })

  it('records unfinalize and clears the finalized timestamp while keeping history', () => {
    const finalized = markPlanFinalized(createPlan('待交付', false), '2026-10-04T09:00:00.000Z')
    const reopened = unmarkPlanFinalized(finalized, '2026-10-04T11:30:00.000Z')

    expect(reopened.finalized).toBe(false)
    expect(reopened.finalizedAt).toBeNull()
    expect(reopened.finalizeHistory).toEqual([
      { action: 'finalize', at: '2026-10-04T09:00:00.000Z' },
      { action: 'unfinalize', at: '2026-10-04T11:30:00.000Z' },
    ])
  })

  it('is idempotent for repeated finalize and unfinalize calls', () => {
    const plan = createPlan('待交付', false)
    const finalized = markPlanFinalized(plan, '2026-10-04T09:00:00.000Z')
    expect(markPlanFinalized(finalized, '2026-10-04T10:00:00.000Z')).toBe(finalized)

    const reopened = unmarkPlanFinalized(finalized, '2026-10-04T11:30:00.000Z')
    expect(unmarkPlanFinalized(reopened, '2026-10-04T12:00:00.000Z')).toBe(reopened)
  })

  it('explains which layout operation was blocked', () => {
    expect(blockedLayoutMessage('move')).toBe('定稿方案不允许拖动设备，请先解除定稿')
    expect(blockedLayoutMessage('add-item')).toBe('定稿方案不允许新增设备，请先解除定稿')
    expect(blockedLayoutMessage('desk-size')).toBe('定稿方案不允许调整桌面尺寸，请先解除定稿')
  })
})
