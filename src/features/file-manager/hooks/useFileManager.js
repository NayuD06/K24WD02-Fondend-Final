import { useMemo, useState } from 'react'
import { initialItems } from '../data/initialItems'
import { now, sortItems } from '../utils/fileUtils'

export const useFileManager = () => {
  const [items, setItems] = useState(initialItems)
  const [currentFolderId, setCurrentFolderId] = useState('root')
  const [selectedIds, setSelectedIds] = useState([])
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [newFolderName, setNewFolderName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadBatchCount, setUploadBatchCount] = useState(0)

  const visibleItems = useMemo(() => {
    const inCurrentFolder = items.filter((item) => item.parentId === currentFolderId)
    const byKeyword = inCurrentFolder.filter((item) =>
      item.name.toLowerCase().includes(keyword.trim().toLowerCase()),
    )

    return sortItems(byKeyword, sortBy, sortDirection)
  }, [items, currentFolderId, keyword, sortBy, sortDirection])

  const breadcrumb = useMemo(() => {
    if (currentFolderId === 'root') {
      return [{ id: 'root', name: 'Home' }]
    }

    const trail = [{ id: 'root', name: 'Home' }]
    let cursor = currentFolderId

    while (cursor !== 'root') {
      const folder = items.find((item) => item.id === cursor)

      if (!folder) {
        break
      }

      trail.push({ id: folder.id, name: folder.name })
      cursor = folder.parentId
    }

    return trail
  }, [items, currentFolderId])

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.id)),
    [items, selectedIds],
  )

  const stats = useMemo(
    () => ({
      totalFiles: items.filter((item) => item.type === 'file').length,
      totalFolders: items.filter((item) => item.type === 'folder').length,
      totalStorage: items.reduce((sum, item) => sum + (item.size || 0), 0),
    }),
    [items],
  )

  const openAt = (folderId) => {
    setCurrentFolderId(folderId)
    setSelectedIds([])
  }

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((entryId) => entryId !== id) : [...prev, id],
    )
  }

  const openFolder = (item) => {
    if (item.type !== 'folder') {
      return
    }

    openAt(item.id)
  }

  const createFolder = (event) => {
    event.preventDefault()

    const folderName = newFolderName.trim()

    if (!folderName) {
      return
    }

    const folder = {
      id: `folder-${crypto.randomUUID()}`,
      name: folderName,
      type: 'folder',
      parentId: currentFolderId,
      size: 0,
      updatedAt: now(),
    }

    setItems((prev) => [folder, ...prev])
    setNewFolderName('')
  }

  const uploadFiles = async (event) => {
    if (isUploading) {
      return
    }

    const files = Array.from(event.target.files || [])

    if (!files.length) {
      return
    }

    event.target.value = ''
    setUploadBatchCount(files.length)
    setIsUploading(true)

    const uploaded = files.map((file) => ({
      id: `file-${crypto.randomUUID()}`,
      name: file.name,
      type: 'file',
      parentId: currentFolderId,
      size: file.size,
      updatedAt: now(),
    }))

    await new Promise((resolve) => {
      window.setTimeout(resolve, 820)
    })

    setItems((prev) => [...uploaded, ...prev])
    setIsUploading(false)
    setUploadBatchCount(0)
  }

  const renameSelected = () => {
    if (selectedItems.length !== 1) {
      return
    }

    const target = selectedItems[0]
    const renamed = window.prompt('Nhap ten moi', target.name)

    if (!renamed || !renamed.trim()) {
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === target.id ? { ...item, name: renamed.trim(), updatedAt: now() } : item,
      ),
    )
  }

  const deleteSelected = () => {
    if (!selectedIds.length) {
      return
    }

    const toDelete = new Set(selectedIds)
    let changed = true

    while (changed) {
      changed = false
      for (const item of items) {
        if (toDelete.has(item.parentId) && !toDelete.has(item.id)) {
          toDelete.add(item.id)
          changed = true
        }
      }
    }

    setItems((prev) => prev.filter((item) => !toDelete.has(item.id)))
    setSelectedIds([])
  }

  const onSortChange = (nextSort) => {
    if (nextSort === sortBy) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortBy(nextSort)
    setSortDirection('asc')
  }

  const resetFilters = () => {
    setKeyword('')
    setSortBy('name')
    setSortDirection('asc')
  }

  const cleanOldFilesView = () => {
    setKeyword('')
    setSortBy('updatedAt')
    setSortDirection('asc')
    setSelectedIds([])
  }

  return {
    state: {
      breadcrumb,
      currentFolderId,
      keyword,
      newFolderName,
      selectedIds,
      selectedItems,
      sortBy,
      sortDirection,
      isUploading,
      uploadBatchCount,
      visibleItems,
    },
    stats,
    actions: {
      createFolder,
      deleteSelected,
      onSortChange,
      openAt,
      openFolder,
      cleanOldFilesView,
      resetFilters,
      renameSelected,
      setKeyword,
      setNewFolderName,
      toggleSelected,
      uploadFiles,
    },
  }
}
