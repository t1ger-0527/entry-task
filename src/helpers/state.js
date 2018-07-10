export const merge = (map, items) => {
  if (!Array.isArray(items)) {
    items = [items]
  }
  const cloneMap = {
    ...map,
  }
  items.map(item => cloneMap[item.id] = {...cloneMap[item.id], ...item})
  return cloneMap
}

export const mergeIds = (ids, newItems, mode='append') => {
  if (!Array.isArray(newItems)) newItems = [newItems]
  const newIds = newItems.map(i => i.id || i)
  if (mode === 'append') {
    return ids.concat(newIds)
  } else if (mode === 'replace') {
    return newIds
  }
}