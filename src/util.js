export function getTitle (text) {
  const title = text.match(/^\s*t:\s*(.+)*/mi)
  return title && title[1]
}

export function trimBlankLines (text) {
  return text.replace(/\n\s*\n/g, '\n')
}

export function printNode (node, title) {
  const printView = window.open('')
  const content = node.cloneNode(true)

  printView.document.title = title
  printView.document.body.appendChild(content)
  printView.focus()
  printView.print()
  printView.close()
}
