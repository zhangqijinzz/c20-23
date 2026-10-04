import { describe, expect, it } from 'vitest'
import { createPlan, isPlanFinalized, normalizePlan, type WorkspacePlan } from '../../../shared/models'
import { createEditablePlanCopy, markPlanFinalized, markPlanUnfinalized } from '../../../shared/finalizeRules'

const T1 = '2026-10-04T09:00:00.000Z'
const T2 = '2026-10-04T10:00:00.000Z'
const T3 = '2026-10-04T11:00:00.000Z'

describe('finalize rules', () => {
  it('marks a plan as finalized and records when it happened', () => {
    const plan = createPlan('定稿测试', true)
    const finalized = markPlanFinalized(plan, T1)
    expect(finalized.finalizedAt).toBe(T1)
    expect(isPlanFinalized(finalized)).toBe(true)
    expect(finalized.finalizeHistory).toHaveLength(1)
    expect(finalized.finalizeHistory[0]).toMatchObject({ action: 'finalized', at: T1 })
    expect(plan.finalizedAt).toBeNull()
    expect(plan.finalizeHistory).toHaveLength(0)
  })

  it('keeps a running record across finalize and unfinalize cycles', () => {
    const plan = createPlan('记录', false)
    const finalized = markPlanFinalized(plan, T1)
    const reopened = markPlanUnfinalized(finalized, T2)
    expect(reopened.finalizedAt).toBeNull()
    expect(isPlanFinalized(reopened)).toBe(false)
    const refinalized = markPlanFinalized(reopened, T3)
    expect(refinalized.finalizedAt).toBe(T3)
    expect(refinalized.finalizeHistory.map((record) => record.action)).toEqual(['finalized', 'unfinalized', 'finalized'])
    expect(refinalized.finalizeHistory.map((record) => record.at)).toEqual([T1, T2, T3])
  })

  it('ignores repeated finalize or unfinalize calls', () => {
    const plan = createPlan('幂等', false)
    const finalized = markPlanFinalized(plan, T1)
    expect(markPlanFinalized(finalized, T2)).toBe(finalized)
    expect(markPlanUnfinalized(plan, T1)).toBe(plan)
  })

  it('creates an editable copy without carrying over the finalized state', () => {
    const source = markPlanFinalized(createPlan('源方案', true), T1)
    const copy = createEditablePlanCopy(source)
    expect(copy.id).not.toBe(source.id)
    expect(copy.name).toBe('源方案 · 副本')
    expect(copy.finalizedAt).toBeNull()
    expect(copy.finalizeHistory).toEqual([])
    expect(copy.deskWidthMm).toBe(source.deskWidthMm)
    expect(copy.deskHeightMm).toBe(source.deskHeightMm)
    expect(copy.items).toHaveLength(source.items.length)
    expect(copy.items.map((item) => item.id)).not.toContain(source.items[0].id)
    expect(copy.items[0]).toMatchObject({ x: source.items[0].x, y: source.items[0].y, widthMm: source.items[0].widthMm })
  })
})

describe('normalizePlan', () => {
  it('fills finalize defaults for plans saved before finalization existed', () => {
    const legacy = createPlan('旧数据', false) as Partial<WorkspacePlan>
    delete legacy.finalizedAt
    delete legacy.finalizeHistory
    const normalized = normalizePlan(legacy as WorkspacePlan)
    expect(normalized.finalizedAt).toBeNull()
    expect(normalized.finalizeHistory).toEqual([])
  })

  it('preserves stored finalize state and drops broken records', () => {
    const plan = markPlanFinalized(createPlan('已存', false), T1)
    const stored = { ...plan, finalizeHistory: [...plan.finalizeHistory, { broken: true }] } as unknown as WorkspacePlan
    const normalized = normalizePlan(stored)
    expect(normalized.finalizedAt).toBe(T1)
    expect(normalized.finalizeHistory).toHaveLength(1)
    expect(normalized.finalizeHistory[0]).toMatchObject({ action: 'finalized', at: T1 })
  })
})
