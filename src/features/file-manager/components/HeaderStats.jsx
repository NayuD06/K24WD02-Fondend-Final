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
      <p className="fm-eyebrow">PixelDepot</p>

      <div className="fm-hero-bottom-row">
        <div className="fm-user-profile-card" aria-label="Thong tin nguoi dung">
          <span className="fm-user-avatar fm-user-avatar-lg" aria-hidden="true">
            {userInitials(userName || 'Guest')}
          </span>

          <div className="fm-user-name-wrap">
            <strong>{userName || 'Guest'}</strong>
          </div>
        </div>

        <button
          type="button"
          className="pixel-btn fm-logout-btn fm-logout-icon-btn"
          onClick={onLogout}
          aria-label="Dang xuat"
          title="Dang xuat"
        >
          {'-'}
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
