import { useEffect, useRef, useState } from 'react'
import { History, Lock, LockOpen, ShieldCheck } from 'lucide-react'
import type { FinalizeRecord, WorkspacePlan } from '../../../shared/models'

interface FinalizeControlProps {
  plan: WorkspacePlan
  onMarkFinalized: () => void
  onUnmarkFinalized: () => void
}

function formatRecordTime(iso: string): string {
  const time = new Date(iso)
  if (Number.isNaN(time.getTime())) return iso
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${time.getFullYear()}-${pad(time.getMonth() + 1)}-${pad(time.getDate())} ${pad(time.getHours())}:${pad(time.getMinutes())}`
}

function HistoryPopover({ records }: { records: FinalizeRecord[] }) {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  return (
    <div className="finalize-history" ref={popoverRef}>
      <button
        type="button"
        className="finalize-history-button"
        aria-label="查看定稿记录"
        title="定稿记录"
        onClick={() => setOpen((current) => !current)}
      >
        <History size={13} /> 记录
      </button>
      {open && (
        <div className="finalize-history-popover" role="dialog" aria-label="定稿记录">
          <div className="finalize-history-title">定稿 / 解除记录</div>
          {records.length === 0 ? (
            <p className="finalize-history-empty">还没有定稿记录</p>
          ) : (
            <ol className="finalize-history-list">
              {[...records].reverse().map((record, index) => (
                <li key={`${record.at}-${index}`} className="finalize-history-item">
                  <span className={`finalize-history-badge ${record.action === 'finalize' ? 'is-finalize' : 'is-unfinalize'}`}>
                    {record.action === 'finalize' ? <Lock size={10} /> : <LockOpen size={10} />}
                    {record.action === 'finalize' ? '定稿' : '解除'}
                  </span>
                  <time>{formatRecordTime(record.at)}</time>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  )
}

export function FinalizeControl({ plan, onMarkFinalized, onUnmarkFinalized }: FinalizeControlProps) {
  if (plan.finalized) {
    return (
      <div className="finalize-actions">
        <span className="finalize-pill" title={`定稿时间：${plan.finalizedAt ? formatRecordTime(plan.finalizedAt) : '—'}`}>
          <ShieldCheck size={13} /> 已定稿
        </span>
        <button type="button" className="unfinalize-button" onClick={onUnmarkFinalized}>
          <LockOpen size={13} /> 解除定稿
        </button>
        <HistoryPopover records={plan.finalizeHistory} />
      </div>
    )
  }

  return (
    <div className="finalize-actions">
      <button type="button" className="mark-finalize-button" onClick={onMarkFinalized}>
        <Lock size={13} /> 标记定稿
      </button>
      {plan.finalizeHistory.length > 0 && <HistoryPopover records={plan.finalizeHistory} />}
    </div>
  )
}

export function LockedBanner() {
  return (
    <div className="locked-banner" role="status">
      <Lock size={14} />
      <span>方案已定稿，布局已锁定。拖动、坐标与尺寸输入、增删设备、旋转和桌面尺寸调整均不可用；如需修改请先解除定稿。</span>
    </div>
  )
}
