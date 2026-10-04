import { Lock, Monitor, Keyboard, LampDesk, Speaker, TabletSmartphone } from 'lucide-react'
import type { DeviceDefinition, DeviceType } from '../../../shared/models'

interface DevicePaletteProps {
  devices: DeviceDefinition[]
  locked?: boolean
  onAdd: (type: DeviceType) => void
}

const icons = { monitor: Monitor, keyboard: Keyboard, lamp: LampDesk, speaker: Speaker, stand: TabletSmartphone }

export function DevicePalette({ devices, locked = false, onAdd }: DevicePaletteProps) {
  return (
    <section className={`module-panel palette-panel ${locked ? 'is-locked' : ''}`} aria-labelledby="palette-title">
      <div className="module-heading">
        <div>
          <span className="eyebrow">01 / 素材</span>
          <h2 id="palette-title">设备素材</h2>
        </div>
        <span className="module-count">{devices.length}</span>
      </div>
      <p className="panel-description">{locked ? '方案已定稿，新增设备已锁定，解除定稿后可继续添加。' : '点击添加到桌面，尺寸可在右侧调整。'}</p>
      <div className="device-list">
        {devices.map((device) => {
          const Icon = icons[device.type]
          return (
            <button className="device-card" key={device.type} disabled={locked} title={locked ? '方案已定稿，请先解除定稿' : undefined} onClick={() => onAdd(device.type)} type="button">
              <span className="device-icon" style={{ backgroundColor: device.color }}><Icon size={20} strokeWidth={1.8} /></span>
              <span className="device-copy"><strong>{device.label}</strong><small>{device.hint}</small></span>
              <span className="add-mark">{locked ? <Lock size={13} /> : '+'}</span>
            </button>
          )
        })}
      </div>
      <div className="palette-tip">{locked ? <><span><Lock size={9} /></span><span>定稿只锁定布局，查看与预览不受影响</span></> : <><span>⌘</span><span>可先放置，再用尺寸检查微调</span></>}</div>
    </section>
  )
}
