import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'

function ActionMenu({ actions, ariaLabel = 'Mais opções', triggerClassName = 'icon-btn-plain', iconSize = 16 }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="action-menu" ref={ref}>
      <button
        type="button"
        className={triggerClassName}
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreVertical size={iconSize} strokeWidth={2.2} />
      </button>
      {open && (
        <div className="action-menu-panel" role="menu">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              className={`action-menu-item ${action.destructive ? 'destructive' : ''}`}
              onClick={() => {
                setOpen(false)
                action.onClick()
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ActionMenu
