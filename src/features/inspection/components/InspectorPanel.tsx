import { AlertTriangle, Crosshair, Lock, LockOpen, RotateCcw, RotateCw, Ruler, Trash2 } from 'lucide-react'
import type { DeskItem, WorkspacePlan } from '../../../shared/models'
import { getDeviceDefinition, isPlanFinalized } from '../../../shared/models'
import { formatFinalizeTime } from '../../../shared/finalizeRules'

interface InspectorPanelProps {
  plan: WorkspacePlan
  item: DeskItem | null
  issueIds: string[]
  onUpdateDesk: (field: 'deskWidthMm' | 'deskHeightMm', value: number) => void
  onUpdateItem: (id: string, patch: Partial<Pick<DeskItem, 'widthMm' | 'heightMm' | 'x' | 'y'>>) => void
  onRotate: (id: string, delta: number) => void
  onDelete: (id: string) => void
}

function NumericField({ label, value, onChange, disabled = false }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return <label className="numeric-field"><span>{label}</span><input type="number" value={value} min={40} disabled={disabled} onChange={(event) => onChange(event.currentTarget.valueAsNumber)} /><em>mm</em></label>
}

export function InspectorPanel({ plan, item, issueIds, onUpdateDesk, onUpdateItem, onRotate, onDelete }: InspectorPanelProps) {
  const isIssue = item ? issueIds.includes(item.id) : false
  const definition = item ? getDeviceDefinition(item.type) : null
  const locked = isPlanFinalized(plan)
  return (
    <aside className="inspector-panel">
      <div className="module-heading">
        <div><span className="eyebrow">02 / 检查</span><h2>尺寸检查</h2></div>
        <Ruler size={18} className="muted-icon" />
      </div>
      <div className="desk-size-card">
        <div className="field-heading"><span>桌面画布</span><span className={`field-status ${locked ? 'status-locked' : ''}`}>{locked ? '已锁定' : '实时'}</span></div>
        <div className="desk-size-fields">
          <NumericField label="宽度" value={plan.deskWidthMm} onChange={(value) => onUpdateDesk('deskWidthMm', value)} disabled={locked} />
          <NumericField label="深度" value={plan.deskHeightMm} onChange={(value) => onUpdateDesk('deskHeightMm', value)} disabled={locked} />
        </div>
        <p className="helper-text">{locked ? '方案已定稿，桌面尺寸已锁定' : '建议保留 40 mm 走线缓冲空间'}</p>
      </div>
      {item && definition ? (
        <div className="item-editor">
          <div className="selected-item-heading"><span className="selected-swatch" style={{ backgroundColor: definition.color }} /> <div><strong>{definition.label}</strong><small>{definition.hint}</small></div><span className="item-code">{definition.shortLabel}</span></div>
          {isIssue && <div className="issue-callout"><AlertTriangle size={16} /><span>设备与其他元素重叠或超出桌面边界</span></div>}
          {locked && <div className="locked-callout"><Lock size={15} /><span>方案已定稿，尺寸、位置与旋转已锁定</span></div>}
          <div className="field-heading"><span>实际尺寸</span><span className="unit-label">单位：毫米</span></div>
          <div className="two-column-fields">
            <NumericField label="宽度" value={item.widthMm} onChange={(value) => onUpdateItem(item.id, { widthMm: value })} disabled={locked} />
            <NumericField label="深度" value={item.heightMm} onChange={(value) => onUpdateItem(item.id, { heightMm: value })} disabled={locked} />
          </div>
          <div className="field-heading position-heading"><span>位置</span><span className="unit-label">左上角坐标</span></div>
          <div className="two-column-fields">
            <NumericField label="X" value={Math.round(item.x)} onChange={(value) => onUpdateItem(item.id, { x: value })} disabled={locked} />
            <NumericField label="Y" value={Math.round(item.y)} onChange={(value) => onUpdateItem(item.id, { y: value })} disabled={locked} />
          </div>
          <div className="rotation-row"><span><Crosshair size={15} /> 旋转角度 <strong>{Math.round(item.rotation)}°</strong></span><div className="rotation-actions"><button aria-label="逆时针旋转 15 度" onClick={() => onRotate(item.id, -15)} disabled={locked} type="button"><RotateCcw size={15} /></button><button aria-label="顺时针旋转 15 度" onClick={() => onRotate(item.id, 15)} disabled={locked} type="button"><RotateCw size={15} /></button></div></div>
          <button className="remove-item-button" onClick={() => onDelete(item.id)} disabled={locked} type="button"><Trash2 size={15} /> 移除这个设备</button>
        </div>
      ) : (
        <div className="empty-inspector"><span className="empty-illustration">⌖</span><strong>选择一个设备</strong><p>点击画布上的设备查看尺寸、位置和旋转控制。</p></div>
      )}
      {plan.finalizeHistory.length > 0 && (
        <div className="finalize-history">
          <div className="field-heading"><span>定稿记录</span><span className="unit-label">{plan.finalizeHistory.length} 条</span></div>
          <ul>
            {[...plan.finalizeHistory].reverse().map((record) => (
              <li key={record.id}>
                {record.action === 'finalized' ? <Lock size={12} /> : <LockOpen size={12} />}
                <span>{record.action === 'finalized' ? '定稿' : '解除定稿'}</span>
                <time>{formatFinalizeTime(record.at)}</time>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
