export const ManagerToolbar = ({
  breadcrumb,
  currentFolderId,
  isUploading,
  newFolderName,
  uploadInputRef,
  uploadBatchCount,
  selectedItems,
  onNavigate,
  onFolderNameChange,
  onCreateFolder,
  onUploadFiles,
  onRenameSelected,
  onDeleteSelected,
}) => (
  <section className="fm-toolbar pixel-panel">
    <div className="fm-breadcrumb" role="navigation" aria-label="Duong dan thu muc">
      {breadcrumb.map((node) => (
        <button
          key={node.id}
          type="button"
          onClick={() => onNavigate(node.id)}
          className={node.id === currentFolderId ? 'pixel-btn active' : 'pixel-btn'}
        >
          {node.name}
        </button>
      ))}
    </div>

    <div className="fm-actions-row">
      <form onSubmit={onCreateFolder} className="fm-new-folder-form">
        <input
          value={newFolderName}
          onChange={(event) => onFolderNameChange(event.target.value)}
          placeholder="Ten folder moi"
          aria-label="Ten folder"
        />
        <button type="submit" className="pixel-btn">
          + Folder
        </button>
      </form>

      <label className={isUploading ? 'pixel-btn fm-upload-btn is-loading' : 'pixel-btn fm-upload-btn'}>
        {isUploading ? `Dang upload ${uploadBatchCount} file` : 'Upload'}
        {isUploading ? <span className="loading-dots" aria-hidden="true"></span> : null}
        <input ref={uploadInputRef} type="file" multiple onChange={onUploadFiles} disabled={isUploading} />
      </label>

      <button type="button" className="pixel-btn" onClick={onRenameSelected} disabled={selectedItems.length !== 1}>
        Rename
      </button>

      <button type="button" className="pixel-btn danger" onClick={onDeleteSelected} disabled={!selectedItems.length}>
        Delete
      </button>
    </div>
  </section>
)
