import { useEffect, useRef, useState } from 'react'
import { formatBytes, formatDate } from '../utils/fileUtils'

export const FileTable = ({
  visibleItems,
  selectedIds,
  pinnedIds,
  canReorder,
  onToggleSelected,
  onOpenFolder,
  onMoveItem,
  onTogglePinned,
  onDownloadItem,
  onDeleteItem,
  onRenameItem,
}) => {
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const tableRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!tableRef.current?.contains(event.target)) {
        setOpenMenuId(null)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenMenuId(null)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const onRowDrop = (targetId) => {
    if (!canReorder || !draggingId) {
      return
    }

    onMoveItem(draggingId, targetId)
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <section className="fm-table-wrap pixel-panel" aria-live="polite" ref={tableRef}>
      <div className="fm-table-head fm-table-row">
        <span></span>
        <span>Ten</span>
        <span>Loai</span>
        <span>Dung luong</span>
        <span>Cap nhat</span>
        <span>...</span>
      </div>

      {visibleItems.length ? (
        visibleItems.map((item) => {
          const isPinned = pinnedIds.includes(item.id)
          const rowClass = [
            'fm-table-row',
            selectedIds.includes(item.id) ? 'active' : '',
            draggingId === item.id ? 'is-dragging' : '',
            dragOverId === item.id ? 'is-drag-over' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div
              key={item.id}
              className={rowClass}
              onDoubleClick={() => onOpenFolder(item)}
              draggable={canReorder}
              onDragStart={() => setDraggingId(item.id)}
              onDragEnd={() => {
                setDraggingId(null)
                setDragOverId(null)
              }}
              onDragOver={(event) => {
                if (!canReorder) {
                  return
                }

                event.preventDefault()
                setDragOverId(item.id)
              }}
              onDrop={(event) => {
                event.preventDefault()
                onRowDrop(item.id)
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => onToggleSelected(item.id)}
                aria-label={`Chon ${item.name}`}
              />

              <button className="fm-name-cell" type="button" onClick={() => onOpenFolder(item)}>
                {isPinned ? <span className="fm-pin-marker" aria-hidden="true">📌 </span> : canReorder ? <span className="fm-drag-handle">::: </span> : null}
                {item.type === 'folder' ? '[DIR]' : '[FILE]'} {item.name}
              </button>

              <span>{item.type === 'folder' ? 'Folder' : 'File'}</span>
              <span>{item.type === 'folder' ? '-' : formatBytes(item.size)}</span>
              <span>{formatDate(item.updatedAt)}</span>
              <div className="fm-action-menu-wrap">
                <button
                  type="button"
                  className={openMenuId === item.id ? 'pixel-btn fm-menu-trigger active' : 'pixel-btn fm-menu-trigger'}
                  onClick={() => setOpenMenuId((prev) => (prev === item.id ? null : item.id))}
                  aria-haspopup="menu"
                  aria-expanded={openMenuId === item.id}
                  aria-label={`Mo menu ${item.name}`}
                >
                  ...
                </button>

                {openMenuId === item.id ? (
                  <div className="fm-action-menu" role="menu" aria-label={`Tuy chon ${item.name}`}>
                    <button
                      type="button"
                      role="menuitem"
                      className="fm-action-menu-item"
                      onClick={() => {
                        onDownloadItem(item)
                        setOpenMenuId(null)
                      }}
                    >
                      Download
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="fm-action-menu-item"
                      onClick={() => {
                        onTogglePinned(item.id)
                        setOpenMenuId(null)
                      }}
                    >
                      {isPinned ? 'Bo ghim' : 'Ghim'}
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="fm-action-menu-item"
                      onClick={() => {
                        onRenameItem(item.id)
                        setOpenMenuId(null)
                      }}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="fm-action-menu-item danger"
                      onClick={() => {
                        onDeleteItem(item.id)
                        setOpenMenuId(null)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })
      ) : (
        <div className="fm-empty-state">
          <h2>Thu muc trong</h2>
          <p>Tao folder moi hoac upload file de bat dau.</p>
        </div>
      )}
    </section>
  )
}
