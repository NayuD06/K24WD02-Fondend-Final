export const PixelAssistant = ({
  isOpen,
  isUploading,
  onToggle,
  onCreateFolderHint,
  onUpload,
  onCleanOldFiles,
}) => (
  <>
    {isOpen ? (
      <aside className="fm-assistant" aria-label="Pixel Assistant">
        <div className="fm-assistant-head">
          <div className="fm-assistant-title">
            <span className="fm-assistant-dot" aria-hidden="true"></span>
            PIXEL BOT
          </div>
          <button type="button" className="pixel-btn fm-assistant-close" onClick={onToggle}>
            -
          </button>
        </div>

        <p>Can giup gi cho ban?</p>

        <div className="fm-assistant-actions">
          <button type="button" className="pixel-btn" onClick={onCreateFolderHint}>
            Tao folder?
          </button>

          <button type="button" className="pixel-btn" onClick={onUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                Dang upload <span className="loading-dots" aria-hidden="true"></span>
              </>
            ) : (
              'Upload file?'
            )}
          </button>

          <button type="button" className="pixel-btn" onClick={onCleanOldFiles}>
            Don file cu?
          </button>
        </div>
      </aside>
    ) : null}

    <button type="button" className="pixel-btn fm-assistant-launcher" onClick={onToggle} aria-label="Mo Pixel Assistant">
      <span className="fm-robot" aria-hidden="true">
        <span className="fm-robot-antenna"></span>
        <span className="fm-robot-head">
          <span className="fm-robot-eye fm-robot-eye-left"></span>
          <span className="fm-robot-eye fm-robot-eye-right"></span>
          <span className="fm-robot-mouth"></span>
        </span>
      </span>
    </button>
  </>
)