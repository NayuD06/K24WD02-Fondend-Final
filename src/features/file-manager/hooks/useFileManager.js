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

const triggerDownload = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
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
  const [renameDialog, setRenameDialog] = useState({
    isOpen: false,
    itemId: null,
    value: '',
  })

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

  const removeItemsByIds = (idsToRemove) => {
    const toRemove = new Set(idsToRemove)
    let changed = true

    while (changed) {
      changed = false
      for (const item of items) {
        if (toRemove.has(item.parentId) && !toRemove.has(item.id)) {
          toRemove.add(item.id)
          changed = true
        }
      }
    }

    setItems((prev) => prev.filter((item) => !toRemove.has(item.id)))
    setPinnedIds((prev) => prev.filter((id) => !toRemove.has(id)))
    setRenameDialog((prev) =>
      prev.itemId && toRemove.has(prev.itemId)
        ? { isOpen: false, itemId: null, value: '' }
        : prev,
    )
    setManualOrderMap((prev) => {
      const next = {}

      for (const [parentId, orderedIds] of Object.entries(prev)) {
        const cleanedIds = orderedIds.filter((id) => !toRemove.has(id))

        if (cleanedIds.length) {
          next[parentId] = cleanedIds
        }
      }

      return next
    })

    return toRemove
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
      sourceFile: file,
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

    openRenameDialog(selectedItems[0].id)
  }

  const openRenameDialog = (itemId) => {
    const target = items.find((item) => item.id === itemId)

    if (!target) {
      return
    }

    setRenameDialog({
      isOpen: true,
      itemId: target.id,
      value: target.name,
    })
  }

  const closeRenameDialog = () => {
    setRenameDialog({
      isOpen: false,
      itemId: null,
      value: '',
    })
  }

  const updateRenameValue = (value) => {
    setRenameDialog((prev) => ({
      ...prev,
      value,
    }))
  }

  const submitRename = (event) => {
    event?.preventDefault?.()

    const target = items.find((item) => item.id === renameDialog.itemId)

    if (!target) {
      closeRenameDialog()
      return
    }

    const nextName = renameDialog.value.trim()

    if (!nextName) {
      return
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === target.id ? { ...item, name: nextName, updatedAt: now() } : item,
      ),
    )

    closeRenameDialog()
  }

  const deleteSelected = () => {
    if (!selectedIds.length) {
      return
    }

    removeItemsByIds(selectedIds)
    setSelectedIds([])
  }

  const deleteItem = (id) => {
    removeItemsByIds([id])
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
  }

  const downloadItem = (item) => {
    if (item.type === 'file' && item.sourceFile) {
      triggerDownload(item.sourceFile, item.name)
      return
    }

    if (item.type === 'file') {
      const fallbackBlob = new Blob(
        [
          `Ten file: ${item.name}\n`,
          `Kich thuoc: ${item.size || 0}\n`,
          `Cap nhat: ${item.updatedAt}\n`,
        ],
        { type: 'text/plain;charset=utf-8' },
      )
      triggerDownload(fallbackBlob, item.name)
      return
    }

    const childItems = items.filter((child) => child.parentId === item.id)
    const folderBlob = new Blob(
      [
        `Thu muc: ${item.name}\n`,
        `So item con: ${childItems.length}\n`,
        ...childItems.map((child) => `- ${child.type === 'folder' ? '[DIR]' : '[FILE]'} ${child.name}\n`),
      ],
      { type: 'text/plain;charset=utf-8' },
    )

    triggerDownload(folderBlob, `${item.name}.txt`)
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
      renameDialog,
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
      deleteItem,
      downloadItem,
      onSortChange,
      openAt,
      openFolder,
      moveItem,
      cleanOldFilesView,
      closeRenameDialog,
      resetFilters,
      renameSelected,
      openRenameDialog,
      submitRename,
      setKeyword,
      setNewFolderName,
      updateRenameValue,
      togglePinned,
      toggleSelected,
      uploadFiles,
    },
  }
}
