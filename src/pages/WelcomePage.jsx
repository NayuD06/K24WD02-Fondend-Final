import { Link } from 'react-router-dom'
import { initialItems } from '../features/file-manager/data/initialItems'
import { formatBytes } from '../features/file-manager/utils/fileUtils'
import './authPages.css'

const fileItems = initialItems.filter((item) => item.type === 'file')
const folderItems = initialItems.filter((item) => item.type === 'folder')

const previewStats = {
  totalFiles: fileItems.length,
  totalFolders: folderItems.length,
  totalStorage: formatBytes(fileItems.reduce((sum, item) => sum + (item.size || 0), 0)),
}

const fileExtension = (fileName) => fileName.split('.').pop()?.toLowerCase() || 'file'

const extensionTone = (extension) => {
  if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(extension)) {
    return 'image'
  }

  if (['xlsx', 'csv'].includes(extension)) {
    return 'sheet'
  }

  if (['pdf', 'docx', 'txt'].includes(extension)) {
    return 'doc'
  }

  return 'code'
}

const extensionClass = (extension) => {
  if (extension === 'jpeg') {
    return 'jpg'
  }

  if (extension === 'png') {
    return 'jpg'
  }

  if (extension === 'xlsx') {
    return 'xlsx'
  }

  if (extension === 'pdf') {
    return 'pdf'
  }

  if (extension === 'csv') {
    return 'xlsx'
  }

  return 'file'
}

const extensionIconText = (extension) => {
  if (extension === 'pdf') {
    return 'PDF'
  }

  if (extension === 'xlsx' || extension === 'csv') {
    return 'XLS'
  }

  if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(extension)) {
    return 'IMG'
  }

  if (extension === 'docx') {
    return 'DOC'
  }

  return 'FILE'
}

export const WelcomePage = () => {
  const previewFiles = fileItems.slice(0, 5)

  return (
    <main className="auth-shell">
      <section className="auth-panel auth-welcome-panel">
        <p className="auth-eyebrow">PixelDepot</p>
        <h1>Quan ly file nhanh, gon, de dung cho team va ca nhan</h1>
        <p className="auth-tagline">An toan du lieu - thao tac nhanh - giao dien pixel de nho</p>

        <p className="auth-copy">
          Day la bo giao dien file manager PixelDepot theo phong cach pixel, toi uu de ban quan ly tai lieu,
          hinh anh va file du an ngay trong trinh duyet ma van giu duoc su ro rang khi lam viec.
        </p>

        <section className="auth-showcase" aria-label="Xem truoc giao dien">
          <div className="auth-mockup-head">
            <span></span>
            <span></span>
            <span></span>
            <p>Preview Dashboard</p>
          </div>

          <div className="auth-mockup-toolbar">
            <div className="auth-chip">Home</div>
            <div className="auth-chip">All Files</div>
            <div className="auth-chip">Sort A-Z</div>
          </div>

          <div className="auth-mockup-grid">
            <article>
              <h3>Folders</h3>
              <p>{previewStats.totalFolders}</p>
            </article>
            <article>
              <h3>Files</h3>
              <p>{previewStats.totalFiles}</p>
            </article>
            <article>
              <h3>Storage</h3>
              <p>{previewStats.totalStorage}</p>
            </article>
          </div>

          <div className="auth-thumb-strip" aria-label="Danh sach file mau">
            {previewFiles.map((file, index) => {
              const extension = fileExtension(file.name)

              return (
                <article
                  key={file.id}
                  className="auth-thumb-card"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <div
                    className={`auth-thumb-box ${extensionTone(extension)} ext-${extensionClass(extension)}`}
                    data-ext={extension.toUpperCase()}
                  ></div>
                  <div className="auth-thumb-meta">
                    <span className={`auth-file-icon ext-${extensionClass(extension)}`}>
                      {extensionIconText(extension)}
                    </span>
                    <span className="auth-file-size">{formatBytes(file.size)}</span>
                  </div>
                <p>{file.name}</p>
                </article>
              )
            })}
          </div>
        </section>

        <div className="auth-intro-grid">
          <article className="auth-info-card">
            <div className="auth-pixel-icon icon-folder" aria-hidden="true"></div>
            <h2>Quan ly thong minh</h2>
            <p>Tao folder, doi ten, xoa nhanh va theo doi dung luong trong mot man hinh.</p>
          </article>

          <article className="auth-info-card">
            <div className="auth-pixel-icon icon-search" aria-hidden="true"></div>
            <h2>Tim file trong vai giay</h2>
            <p>Bo loc theo ten, dung luong, thoi gian cap nhat giup tim tai lieu chinh xac.</p>
          </article>

          <article className="auth-info-card">
            <div className="auth-pixel-icon icon-palette" aria-hidden="true"></div>
            <h2>Theme pixel dong bo</h2>
            <p>Mau sac nhat quan tren PixelDepot welcome, login, register va trang quan ly file.</p>
          </article>
        </div>

        <ol className="auth-flow">
          <li>Tao tai khoan moi trong 1 phut</li>
          <li>Dang nhap de vao he thong</li>
          <li>Bat dau upload va sap xep file ngay</li>
        </ol>

        <div className="auth-actions">
          <Link className="auth-btn primary" to="/login">
            Dang nhap
          </Link>
          <Link className="auth-btn" to="/register">
            Tao tai khoan
          </Link>
        </div>
      </section>
    </main>
  )
}
