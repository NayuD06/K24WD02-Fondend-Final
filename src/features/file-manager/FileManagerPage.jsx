import { useRef, useState } from 'react'
import './fileManager.css'
import { useAuth } from '../auth/AuthContext'
import { FileTable } from './components/FileTable'
import { HeaderStats } from './components/HeaderStats'
import { ManagerFilters } from './components/ManagerFilters'
import { ManagerToolbar } from './components/ManagerToolbar'
import { PixelAssistant } from './components/PixelAssistant'
import { useFileManager } from './hooks/useFileManager'

export const FileManagerPage = () => {
  const { state, stats, actions } = useFileManager()
  const { user, logout } = useAuth()
  const uploadInputRef = useRef(null)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)

  const openUploadDialog = () => {
    uploadInputRef.current?.click()
  }

  const addFolderHint = () => {
    if (!state.newFolderName) {
      actions.setNewFolderName('Folder_moi')
    }
  }

  return (
    <div className="fm-shell">
      <HeaderStats
        totalFiles={stats.totalFiles}
        totalFolders={stats.totalFolders}
        totalStorage={stats.totalStorage}
        userName={user?.name}
        onLogout={logout}
      />

      <ManagerToolbar
        breadcrumb={state.breadcrumb}
        currentFolderId={state.currentFolderId}
        isUploading={state.isUploading}
        newFolderName={state.newFolderName}
        uploadInputRef={uploadInputRef}
        uploadBatchCount={state.uploadBatchCount}
        onNavigate={actions.openAt}
        onFolderNameChange={actions.setNewFolderName}
        onCreateFolder={actions.createFolder}
        onUploadFiles={actions.uploadFiles}
      />

      <ManagerFilters
        keyword={state.keyword}
        sortBy={state.sortBy}
        sortDirection={state.sortDirection}
        onKeywordChange={actions.setKeyword}
        onSortChange={actions.onSortChange}
        onResetFilters={actions.resetFilters}
      />

      <FileTable
        visibleItems={state.visibleItems}
        selectedIds={state.selectedIds}
        pinnedIds={state.pinnedIds}
        canReorder={state.sortBy === 'manual'}
        onToggleSelected={actions.toggleSelected}
        onOpenFolder={actions.openFolder}
        onMoveItem={actions.moveItem}
        onTogglePinned={actions.togglePinned}
        onDownloadItem={actions.downloadItem}
        onDeleteItem={actions.deleteItem}
        onRenameItem={actions.openRenameDialog}
      />

      {state.renameDialog.isOpen ? (
        <div className="fm-modal-backdrop" role="presentation" onClick={actions.closeRenameDialog}>
          <section
            className="fm-modal pixel-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="rename-dialog-title">Rename file</h2>
            <p>Nhap ten moi cho file/folder nay.</p>

            <form className="fm-rename-form" onSubmit={actions.submitRename}>
              <input
                autoFocus
                value={state.renameDialog.value}
                onChange={(event) => actions.updateRenameValue(event.target.value)}
                aria-label="Ten moi"
              />

              <div className="fm-rename-actions">
                <button type="button" className="pixel-btn" onClick={actions.closeRenameDialog}>
                  Cancel
                </button>
                <button type="submit" className="pixel-btn active">
                  OK
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <PixelAssistant
        isOpen={isAssistantOpen}
        isUploading={state.isUploading}
        onToggle={() => setIsAssistantOpen((prev) => !prev)}
        onCreateFolderHint={addFolderHint}
        onUpload={openUploadDialog}
        onCleanOldFiles={actions.cleanOldFilesView}
      />
    </div>
  )
}
