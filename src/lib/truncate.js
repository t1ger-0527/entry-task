const ELLIPSIS = '…'
export default (text, length) => {
  if (text.length > length) {
    return text.substr(0, length) + ELLIPSIS
  }
  return text
}