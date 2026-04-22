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
        selectedItems={state.selectedItems}
        onNavigate={actions.openAt}
        onFolderNameChange={actions.setNewFolderName}
        onCreateFolder={actions.createFolder}
        onUploadFiles={actions.uploadFiles}
        onRenameSelected={actions.renameSelected}
        onDeleteSelected={actions.deleteSelected}
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
        onToggleSelected={actions.toggleSelected}
        onOpenFolder={actions.openFolder}
      />

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
