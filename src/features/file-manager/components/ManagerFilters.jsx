export const ManagerFilters = ({
  keyword,
  sortBy,
  sortDirection,
  onKeywordChange,
  onSortChange,
  onResetFilters,
}) => (
  <section className="fm-filters-row pixel-panel">
    <input
      value={keyword}
      onChange={(event) => onKeywordChange(event.target.value)}
      placeholder="Tim theo ten file hoac folder"
      aria-label="Tim kiem"
    />

    <div className="fm-sort-group">
      <button
        type="button"
        className={keyword || sortBy !== 'manual' || sortDirection !== 'asc' ? 'pixel-btn' : 'pixel-btn active'}
        onClick={onResetFilters}
      >
        Tat ca
      </button>
      <button type="button" className="pixel-btn" onClick={() => onSortChange('manual')}>
        Vi tri {sortBy === 'manual' ? 'ON' : ''}
      </button>
      <button type="button" className="pixel-btn" onClick={() => onSortChange('name')}>
        Ten {sortBy === 'name' ? (sortDirection === 'asc' ? 'A-Z' : 'Z-A') : ''}
      </button>
      <button type="button" className="pixel-btn" onClick={() => onSortChange('size')}>
        Dung luong {sortBy === 'size' ? (sortDirection === 'asc' ? 'UP' : 'DOWN') : ''}
      </button>
      <button type="button" className="pixel-btn" onClick={() => onSortChange('updatedAt')}>
        Cap nhat {sortBy === 'updatedAt' ? (sortDirection === 'asc' ? 'UP' : 'DOWN') : ''}
      </button>
    </div>

    <p className="fm-reorder-hint">Keo-tha khi dang o che do Vi tri. File da ghim se luon nam tren dau.</p>
  </section>
)
