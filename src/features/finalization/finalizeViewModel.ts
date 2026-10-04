import type { FinalizeRecord, WorkspacePlan } from '../../shared/models'

export type LayoutOperation =
  | 'move'
  | 'item-coordinates'
  | 'item-size'
  | 'add-item'
  | 'remove-item'
  | 'rotate'
  | 'desk-size'

const LAYOUT_OPERATION_HINTS: Record<LayoutOperation, string> = {
  move: '定稿方案不允许拖动设备',
  'item-coordinates': '定稿方案不允许修改坐标',
  'item-size': '定稿方案不允许修改设备尺寸',
  'add-item': '定稿方案不允许新增设备',
  'remove-item': '定稿方案不允许删除设备',
  rotate: '定稿方案不允许旋转设备',
  'desk-size': '定稿方案不允许调整桌面尺寸',
}

export function isPlanFinalized(plan: WorkspacePlan): boolean {
  return plan.finalized
}

export function blockedLayoutMessage(operation: LayoutOperation): string {
  return `${LAYOUT_OPERATION_HINTS[operation]}，请先解除定稿`
}

export function markPlanFinalized(plan: WorkspacePlan, at: string = new Date().toISOString()): WorkspacePlan {
  if (plan.finalized) return plan
  const record: FinalizeRecord = { action: 'finalize', at }
  return { ...plan, finalized: true, finalizedAt: at, finalizeHistory: [...plan.finalizeHistory, record] }
}

export function unmarkPlanFinalized(plan: WorkspacePlan, at: string = new Date().toISOString()): WorkspacePlan {
  if (!plan.finalized) return plan
  const record: FinalizeRecord = { action: 'unfinalize', at }
  return { ...plan, finalized: false, finalizedAt: null, finalizeHistory: [...plan.finalizeHistory, record] }
}
