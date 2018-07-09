function renderChunk(parentElement, rootElement, oldNode, newNode) {
  if (oldNode === newNode) {
    // do nothing
  } else if (oldNode && oldNode.nodeName == null) {
    parentElement.nodeValue = newNode
  } else if (
    oldNode == null ||
    rootElement == null ||
    newNode == null ||
    oldNode.nodeName !== newNode.nodeName
  ) {
    // no reuse when the nodeName is different
    const newElement = createElement(newNode)
    let newRootElement
    if (newElement != null) {
      newRootElement = parentElement.insertBefore(newElement, rootElement)
    }

    if (rootElement != null && newNode) {
      removeElement(parentElement, rootElement, oldNode)
    }
    return newRootElement
  } else if (oldNode.nodeName == null) {
    // text node
    rootElement.nodeValue = newNode
  } else {
    // should update element rather than remove and insert.
    // first update the element's attributes.
    updateElement(rootElement, oldNode.attributes, newNode.attributes)

    // first we collect nessisary information into a map
    const newChildren = newNode.children.map(resolveNode)
    newNode.children = newChildren
    let oldChildren = oldNode.children
    let oldChildrenElements = []
    const oldKeyedChildrenMap = {}
    oldChildren.map((child, index) => {
      const key = getKey(child)
      if (key != null) {
        oldKeyedChildrenMap[key] = child
      }
      oldChildrenElements[index] = rootElement.childNodes[index]
    })

    // then we mark the element we are going to use.
    newChildren.map((child) => {
      const key = getKey(child)
      // we mark future using childrenMap as
      if (child && key != null && oldKeyedChildrenMap[key]) {
        oldKeyedChildrenMap[key].using = true
      }
    })

    // we remove the child we don't use.
    oldChildren.map((child, index) => {
      const key = getKey(child)
      if (key != null && !oldKeyedChildrenMap[key].using) {
        if (oldChildrenElements[index]) {
          removeElement(rootElement, oldChildrenElements[index], child)
        }
      }
    })

    // we iterate through new children, insert or update.
    let nextReuseNodeIndex = newChildren.findIndex(
      (c) => oldKeyedChildrenMap[getKey(c)],
    )
    let nextReuseElement =
      oldChildrenElements[
        oldChildren.findIndex(
          (c) =>
            getKey(c) != null &&
            getKey(c) === getKey(newChildren[nextReuseNodeIndex]),
        )
        ]
    newChildren.map((child, index) => {
      const key = getKey(child)
      if (key == null) {
        // no key, just try to reuse.
        renderChunk(
          rootElement,
          oldChildrenElements[index],
          oldChildren[index],
          child,
        )
      } else if (!oldKeyedChildrenMap[key]) {
        // has new key, create
        if (index < nextReuseNodeIndex) {
          const emptyElement = createElement({ nodeName: 'unique' })
          renderChunk(
            rootElement,
            rootElement.insertBefore(emptyElement, nextReuseElement),
            null,
            child,
          )
        } else {
          renderChunk(rootElement, null, oldChildren[index], child)
        }
      } else {
        // we can reuse, then reuse.
        nextReuseNodeIndex = newChildren
          .slice(index + 1)
          .findIndex((c) => oldKeyedChildrenMap[getKey(c)])
        nextReuseElement =
          oldChildrenElements[
            oldChildren.findIndex(
              (c) =>
                getKey(c) != null &&
                getKey(c) === getKey(newChildren[nextReuseNodeIndex]),
            )
            ]
        const oldChild = oldKeyedChildrenMap[key]
        const oldChildElementIndex = oldChildren.findIndex(
          (c) => getKey(c) === key,
        )
        const oldChildElement = oldChildrenElements[oldChildElementIndex]
        renderChunk(rootElement, oldChildElement, oldChild, child)
      }
    })
  }
  return rootElement
}


function renderChunk2(parentElement, rootElement, oldNode, newNode) {
  if (oldNode === newNode) {
    // do nothing
  } else if (newNode == null && oldNode) {
    // perform a simple delete
    removeElement(parentElement, rootElement, oldNode)
    rootElement = null
  } else if (oldNode == null) {
    // perform a simple create
    // in this case, root element indicate the position of element we want to put
    const nextElement = rootElement
    const newElement = createElement(newNode)
    if (newElement != null) {
      rootElement = parentElement.insertBefore(newElement, nextElement)
    }
  } else {
    // we have both old node and new node
    // in this case, we will perform a reuse update.
    updateElement(rootElement, oldNode.attributes, newNode.attributes)

    // we perform similar steps on the children
    // first we pick out children we want to reuse
    const newChildren = newNode.children.map(resolveNode)
    newNode.children = newChildren
    let oldChildren = oldNode.children
    let oldChildrenElements = []
    const oldKeyedChildrenMap = {}
    oldChildren.map((child, index) => {
      const key = getKey(child)
      if (key != null) {
        oldKeyedChildrenMap[key] = child
      }
      oldChildrenElements[index] = rootElement.childNodes[index]
    })

    // then we mark the element we are going to use.
    newChildren.map((child) => {
      const key = getKey(child)
      // we mark future using childrenMap as
      if (child && key != null && oldKeyedChildrenMap[key]) {
        oldKeyedChildrenMap[key].using = true
      }
    })

    // now we have using old child marked
    // first, we remove the child we don't use.
    oldChildren.map((child, index) => {
      const key = getKey(child)
      if (key != null && !oldKeyedChildrenMap[key].using) {
        if (oldChildrenElements[index]) {
          removeElement(rootElement, oldChildrenElements[index], child)
        }
      }
    })
  }
  return rootElement
}


function renderChunk(parent, element, oldNode, node, isSvg) {
  if (node === oldNode) {
  } else if (oldNode == null || oldNode.nodeName !== node.nodeName) {
    var newElement = createElement(node, isSvg)
    parent.insertBefore(newElement, element)

    if (oldNode != null) {
      removeElement(parent, element, oldNode)
    }

    element = newElement;
  } else if (oldNode.nodeName == null) {
    element.nodeValue = node
  } else {
    updateElement(
      element,
      oldNode.attributes,
      node.attributes,
      (isSvg = isSvg || node.nodeName === "svg")
    )

    var oldKeyed = {}
    var newKeyed = {}
    var oldElements = []
    var oldChildren = oldNode.children
    var children = node.children

    for (var i = 0; i < oldChildren.length; i++) {
      oldElements[i] = element.childNodes[i]

      var oldKey = getKey(oldChildren[i])
      if (oldKey != null) {
        oldKeyed[oldKey] = [oldElements[i], oldChildren[i]]
      }
    }

    var i = 0
    var k = 0

    while (k < children.length) {
      var oldKey = getKey(oldChildren[i])
      var newKey = getKey((children[k] = resolveNode(children[k])))

      if (newKeyed[oldKey]) {
        i++
        continue
      }

      if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
        if (oldKey == null) {
          removeElement(element, oldElements[i], oldChildren[i])
        }
        i++
        continue
      }

      if (newKey == null || isRecycling) {
        if (oldKey == null) {
          renderChunk(element, oldElements[i], oldChildren[i], children[k], isSvg)
          k++
        }
        i++
      } else {
        var keyedNode = oldKeyed[newKey] || []

        if (oldKey === newKey) {
          renderChunk(element, keyedNode[0], keyedNode[1], children[k], isSvg)
          i++
        } else if (keyedNode[0]) {
          renderChunk(
            element,
            element.insertBefore(keyedNode[0], oldElements[i]),
            keyedNode[1],
            children[k],
            isSvg
          )
        } else {
          renderChunk(element, oldElements[i], null, children[k], isSvg)
        }

        newKeyed[newKey] = children[k]
        k++
      }
    }

    while (i < oldChildren.length) {
      if (getKey(oldChildren[i]) == null) {
        removeElement(element, oldElements[i], oldChildren[i])
      }
      i++
    }

    for (var i in oldKeyed) {
      if (!newKeyed[i]) {
        removeElement(element, oldKeyed[i][0], oldKeyed[i][1])
      }
    }
  }
  return element
}