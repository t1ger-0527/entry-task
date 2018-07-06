const decode = (url) => {
  try {
    return decodeURIComponent(url)
  } catch (e) {
    return url
  }
}

const trimTrailingSlash = (url) => {
  if (url[url.length - 1] === '/') {
    return url.substr(0, url.length - 1)
  }
  return url
}

const matchRoutes = (pathToMatch, currentPath) => {
  const pathToMatchArr = trimTrailingSlash(pathToMatch).split('/')
  const currentPathArr = trimTrailingSlash(currentPath)
    .split('/')
  const finalMatch = currentPathArr
    .reduce((match, folder, index) => {
      if (!match) return match
      if (pathToMatchArr.length !== currentPathArr.length) return null
      const matchingFolder = pathToMatchArr[index]
      if (!matchingFolder && index !== 0) return null
      if (!matchingFolder) return match
      if (folder === matchingFolder) return match
      if (matchingFolder && matchingFolder[0] === ':') {
        match[matchingFolder.substr(1)] = decode(folder)
        return match
      }
      return null
    }, {})

  return finalMatch
}

export default matchRoutes
