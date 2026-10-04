import { describe, expect, it } from 'vitest'
import { createPlan, duplicatePlanAsDraft } from '../models'
import { markPlanFinalized } from '../../features/finalization/finalizeViewModel'

describe('plan models', () => {
  it('creates new plans as editable drafts', () => {
    const plan = createPlan('新方案', false)
    expect(plan.finalized).toBe(false)
    expect(plan.finalizedAt).toBeNull()
    expect(plan.finalizeHistory).toEqual([])
  })

  it('duplicates a finalized plan into an editable draft without finalize state', () => {
    const source = markPlanFinalized(createPlan('已定稿方案', true), '2026-10-04T09:00:00.000Z')

    const copy = duplicatePlanAsDraft(source)

    expect(copy.id).not.toBe(source.id)
    expect(copy.name).toBe('已定稿方案 · 副本')
    expect(copy.finalized).toBe(false)
    expect(copy.finalizedAt).toBeNull()
    expect(copy.finalizeHistory).toEqual([])
    // 布局内容仍被完整复制
    expect(copy.items).toHaveLength(source.items.length)
    expect(copy.deskWidthMm).toBe(source.deskWidthMm)
    expect(copy.deskHeightMm).toBe(source.deskHeightMm)
    copy.items.forEach((item, index) => {
      expect(item.id).not.toBe(source.items[index].id)
      expect(item).toMatchObject({
        type: source.items[index].type,
        x: source.items[index].x,
        y: source.items[index].y,
        widthMm: source.items[index].widthMm,
        heightMm: source.items[index].heightMm,
        rotation: source.items[index].rotation,
      })
    })
  })
})
