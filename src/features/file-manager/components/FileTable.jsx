import { useState } from 'react'
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
}) => {
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const onRowDrop = (targetId) => {
    if (!canReorder || !draggingId) {
      return
    }

    onMoveItem(draggingId, targetId)
    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <section className="fm-table-wrap pixel-panel" aria-live="polite">
      <div className="fm-table-head fm-table-row">
        <span></span>
        <span>Ten</span>
        <span>Loai</span>
        <span>Dung luong</span>
        <span>Cap nhat</span>
        <span>Ghim</span>
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
                {canReorder ? <span className="fm-drag-handle">::: </span> : null}
                {item.type === 'folder' ? '[DIR]' : '[FILE]'} {item.name}
              </button>

              <span>{item.type === 'folder' ? 'Folder' : 'File'}</span>
              <span>{item.type === 'folder' ? '-' : formatBytes(item.size)}</span>
              <span>{formatDate(item.updatedAt)}</span>
              <button
                type="button"
                className={isPinned ? 'pixel-btn fm-pin-btn active' : 'pixel-btn fm-pin-btn'}
                onClick={() => onTogglePinned(item.id)}
                aria-label={isPinned ? `Bo ghim ${item.name}` : `Ghim ${item.name}`}
              >
                {isPinned ? 'PIN' : '...'}
              </button>
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
