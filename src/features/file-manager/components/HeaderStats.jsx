import { formatBytes } from '../utils/fileUtils'

const userInitials = (name) => {
  if (!name) {
    return 'GU'
  }

  const parts = name.trim().split(/\s+/).filter(Boolean)

  if (!parts.length) {
    return 'GU'
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export const HeaderStats = ({ totalFiles, totalFolders, totalStorage, userName, onLogout }) => (
  <header className="fm-topbar pixel-panel">
    <div className="fm-hero-panel">
      <div>
        <p className="fm-eyebrow">Pixel File Manager</p>
        <h1>Quan ly file theo style retro game</h1>
      </div>

      <div className="fm-meta-actions">
        <div className="fm-user-badge">
          <span className="fm-user-avatar" aria-hidden="true">
            {userInitials(userName || 'Guest')}
          </span>
          <span className="fm-user-text">User: {userName || 'Guest'}</span>
        </div>
        <button type="button" className="pixel-btn fm-logout-btn" onClick={onLogout}>
          Dang xuat
        </button>
      </div>
    </div>

    <div className="fm-stats-row">
      <div className="pixel-card">
        <span>{totalFolders}</span>
        <small>Folders</small>
      </div>
      <div className="pixel-card">
        <span>{totalFiles}</span>
        <small>Files</small>
      </div>
      <div className="pixel-card">
        <span>{formatBytes(totalStorage)}</span>
        <small>Storage</small>
      </div>
    </div>
  </header>
)
