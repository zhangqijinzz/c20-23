import { createId, isPlanFinalized, type FinalizeAction, type FinalizeRecord, type WorkspacePlan } from './models'

export const LOCKED_EDIT_FEEDBACK = '方案已定稿，布局修改已被锁定；解除定稿后才能继续编辑'

export function createFinalizeRecord(action: FinalizeAction, at: string): FinalizeRecord {
  return { id: createId('record'), action, at }
}

export function markPlanFinalized(plan: WorkspacePlan, at: string): WorkspacePlan {
  if (isPlanFinalized(plan)) return plan
  return {
    ...plan,
    finalizedAt: at,
    finalizeHistory: [...plan.finalizeHistory, createFinalizeRecord('finalized', at)],
  }
}

export function markPlanUnfinalized(plan: WorkspacePlan, at: string): WorkspacePlan {
  if (!isPlanFinalized(plan)) return plan
  return {
    ...plan,
    finalizedAt: null,
    finalizeHistory: [...plan.finalizeHistory, createFinalizeRecord('unfinalized', at)],
  }
}

export function createEditablePlanCopy(plan: WorkspacePlan): WorkspacePlan {
  return {
    ...plan,
    id: createId('plan'),
    name: `${plan.name} · 副本`,
    items: plan.items.map((item) => ({ ...item, id: createId('item') })),
    finalizedAt: null,
    finalizeHistory: [],
    updatedAt: new Date().toISOString(),
  }
}

export function formatFinalizeTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
