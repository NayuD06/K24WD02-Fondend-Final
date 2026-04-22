import { useMemo, useState } from 'react'
import { initialItems } from '../data/initialItems'
import { now, sortItems } from '../utils/fileUtils'

const buildInitialOrderMap = (seedItems) =>
  seedItems.reduce((acc, item) => {
    if (!acc[item.parentId]) {
      acc[item.parentId] = []
    }

    acc[item.parentId].push(item.id)
    return acc
  }, {})

const orderByManualPosition = (list, parentId, manualOrderMap) => {
  const preferredOrder = manualOrderMap[parentId] || []
  const positionMap = new Map(preferredOrder.map((id, index) => [id, index]))

  return [...list].sort((a, b) => {
    const aIndex = positionMap.has(a.id) ? positionMap.get(a.id) : Number.MAX_SAFE_INTEGER
    const bIndex = positionMap.has(b.id) ? positionMap.get(b.id) : Number.MAX_SAFE_INTEGER

    if (aIndex !== bIndex) {
      return aIndex - bIndex
    }

    return a.name.localeCompare(b.name)
  })
}

export const useFileManager = () => {
  const [items, setItems] = useState(initialItems)
  const [currentFolderId, setCurrentFolderId] = useState('root')
  const [selectedIds, setSelectedIds] = useState([])
  const [keyword, setKeyword] = useState('')
  const [sortBy, setSortBy] = useState('manual')
  const [sortDirection, setSortDirection] = useState('asc')
  const [pinnedIds, setPinnedIds] = useState([])
  const [manualOrderMap, setManualOrderMap] = useState(() => buildInitialOrderMap(initialItems))
  const [newFolderName, setNewFolderName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadBatchCount, setUploadBatchCount] = useState(0)

  const visibleItems = useMemo(() => {
    const inCurrentFolder = items.filter((item) => item.parentId === currentFolderId)
    const byKeyword = inCurrentFolder.filter((item) =>
      item.name.toLowerCase().includes(keyword.trim().toLowerCase()),
    )

    const sortChunk = (chunk) => {
      if (sortBy === 'manual') {
        return orderByManualPosition(chunk, currentFolderId, manualOrderMap)
      }

      return sortItems(chunk, sortBy, sortDirection)
    }

    const pinnedChunk = byKeyword.filter((item) => pinnedIds.includes(item.id))
    const regularChunk = byKeyword.filter((item) => !pinnedIds.includes(item.id))

    return [...sortChunk(pinnedChunk), ...sortChunk(regularChunk)]
  }, [items, currentFolderId, keyword, pinnedIds, sortBy, sortDirection, manualOrderMap])

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
    setManualOrderMap((prev) => ({
      ...prev,
      [currentFolderId]: [folder.id, ...(prev[currentFolderId] || [])],
    }))
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
    setManualOrderMap((prev) => ({
      ...prev,
      [currentFolderId]: [...uploaded.map((item) => item.id), ...(prev[currentFolderId] || [])],
    }))
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
    setPinnedIds((prev) => prev.filter((id) => !toDelete.has(id)))
    setManualOrderMap((prev) => {
      const next = {}

      for (const [parentId, orderedIds] of Object.entries(prev)) {
        const cleanedIds = orderedIds.filter((id) => !toDelete.has(id))

        if (cleanedIds.length) {
          next[parentId] = cleanedIds
        }
      }

      return next
    })
    setSelectedIds([])
  }

  const moveItem = (draggedId, targetId) => {
    if (!draggedId || !targetId || draggedId === targetId) {
      return
    }

    const siblingIds = items
      .filter((item) => item.parentId === currentFolderId)
      .map((item) => item.id)

    if (!siblingIds.includes(draggedId) || !siblingIds.includes(targetId)) {
      return
    }

    setManualOrderMap((prev) => {
      const existingOrder = prev[currentFolderId] || []
      const knownSet = new Set(existingOrder)
      const mergedOrder = [
        ...existingOrder.filter((id) => siblingIds.includes(id)),
        ...siblingIds.filter((id) => !knownSet.has(id)),
      ]

      const fromIndex = mergedOrder.indexOf(draggedId)
      const toIndex = mergedOrder.indexOf(targetId)

      if (fromIndex < 0 || toIndex < 0) {
        return prev
      }

      const nextOrder = [...mergedOrder]
      const [dragged] = nextOrder.splice(fromIndex, 1)
      nextOrder.splice(toIndex, 0, dragged)

      return {
        ...prev,
        [currentFolderId]: nextOrder,
      }
    })
  }

  const togglePinned = (id) => {
    setPinnedIds((prev) => (prev.includes(id) ? prev.filter((entryId) => entryId !== id) : [id, ...prev]))
  }

  const onSortChange = (nextSort) => {
    if (nextSort === 'manual') {
      setSortBy('manual')
      setSortDirection('asc')
      return
    }

    if (nextSort === sortBy) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortBy(nextSort)
    setSortDirection('asc')
  }

  const resetFilters = () => {
    setKeyword('')
    setSortBy('manual')
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
      pinnedIds,
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
      moveItem,
      cleanOldFilesView,
      resetFilters,
      renameSelected,
      setKeyword,
      setNewFolderName,
      togglePinned,
      toggleSelected,
      uploadFiles,
    },
  }
}
