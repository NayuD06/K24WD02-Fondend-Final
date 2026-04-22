import { formatBytes, formatDate } from '../utils/fileUtils'

export const FileTable = ({ visibleItems, selectedIds, onToggleSelected, onOpenFolder }) => (
  <section className="fm-table-wrap pixel-panel" aria-live="polite">
    <div className="fm-table-head fm-table-row">
      <span></span>
      <span>Ten</span>
      <span>Loai</span>
      <span>Dung luong</span>
      <span>Cap nhat</span>
    </div>

    {visibleItems.length ? (
      visibleItems.map((item) => (
        <div
          key={item.id}
          className={selectedIds.includes(item.id) ? 'fm-table-row active' : 'fm-table-row'}
          onDoubleClick={() => onOpenFolder(item)}
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(item.id)}
            onChange={() => onToggleSelected(item.id)}
            aria-label={`Chon ${item.name}`}
          />

          <button className="fm-name-cell" type="button" onClick={() => onOpenFolder(item)}>
            {item.type === 'folder' ? '[DIR]' : '[FILE]'} {item.name}
          </button>

          <span>{item.type === 'folder' ? 'Folder' : 'File'}</span>
          <span>{item.type === 'folder' ? '-' : formatBytes(item.size)}</span>
          <span>{formatDate(item.updatedAt)}</span>
        </div>
      ))
    ) : (
      <div className="fm-empty-state">
        <h2>Thu muc trong</h2>
        <p>Tao folder moi hoac upload file de bat dau.</p>
      </div>
    )}
  </section>
)
