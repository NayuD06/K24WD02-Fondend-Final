export const formatBytes = (bytes) => {
  if (!bytes) {
    return '-'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const decimals = value >= 10 ? 0 : 1
  return `${value.toFixed(decimals)} ${units[unitIndex]}`
}

export const formatDate = (isoDate) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate))

export const sortItems = (list, sortBy, sortDirection) => {
  const sorted = [...list].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1
    }

    if (sortBy === 'updatedAt') {
      return a.updatedAt.localeCompare(b.updatedAt)
    }

    if (sortBy === 'size') {
      return (a.size || 0) - (b.size || 0)
    }

    return a.name.localeCompare(b.name)
  })

  return sortDirection === 'asc' ? sorted : sorted.reverse()
}

export const now = () => new Date().toISOString()
