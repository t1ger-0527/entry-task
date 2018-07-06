/**
 * v-node
 *  - nodeName
 *  - attributes
 *  - children
 *  - key
 * @returns {*}
 */
import shallowEqual from 'shallow-equal/objects'

// Create and return a new Element
export function h(name, attributes = {}, children, ...otherChildren) {
  if (typeof name === 'function') return name(attributes, children)
  children = Array.isArray(children)
    ? children.concat(otherChildren)
    : [children].concat(otherChildren)
  return {
    nodeName: name,
    attributes,
    children,
    key: attributes && attributes.key,
  }
}

/**
 * Render the app into container, and boot up.
 *
 * Notation:
 *  - *element is for HTMLElement
 *  - *node is for v-node
 * @param state
 * @param actions
 * @param view
 * @param container
 */
export function app(state, actions, view, container) {
  // the main code here
  let globalState = { ...state }
  let globalRootElement = null
  let globalOldNode = null
  let renderScheduled = false
  // plain action functions should be wired,
  // so that actions will trigger state change and re-render.
  const wiredActions = wireStateToActions([], globalState, { ...actions })
  // Life cycle events
  const lifeCycleEvents = []

  renderOnNextTick()
  // return actions so you can call actions from the outside.
  return wiredActions
  // script ends here, below are function definitions.

  function render() {
    renderScheduled = false
    const newNode = resolveNode(view)
    globalRootElement = renderChunk(
      container,
      globalRootElement,
      globalOldNode,
      newNode,
    )
    globalOldNode = newNode
    console.log('global old node updated:', globalOldNode)
    // clear all live cycle events (mostly oncreate events)
    // but without differing, lifecycle would just triggered every update.
    while (lifeCycleEvents.length) lifeCycleEvents.pop()()
  }

  function resolveNode(node) {
    return typeof node === 'function'
      ? resolveNode(node(globalState, wiredActions))
      : node != null
        ? node
        : null
  }

  function renderChunk2(parentElement, rootElement, oldNode, newNode) {
    // no reuse
    const newElement = createElement(newNode)
    const newRootElement = parentElement.insertBefore(newElement, rootElement)

    if (oldNode != null) {
      removeElement(parentElement, rootElement, oldNode)
    }

    return newRootElement
  }
  /**
   * differing
   * @param parentElement, the container you want newNode to be in.
   * @param rootElement, the element that previously rendered by newNode
   * @param oldNode, the previous version of v-node
   * @param newNode, the version of v-node you want to render
   * @returns {*}
   */
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

      if (rootElement != null) {
        removeElement(parentElement, rootElement, oldNode)
      }
      return newRootElement
    } else if (oldNode.nodeName == null) {
      // text node
      rootElement.nodeValue = newNode
    } else if (rootElement.childNodes) {
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

      // TODO: some nodes not deleted
      debugger
      // we remove the child we don't use.
      oldChildren.map((child, index) => {
        const key = getKey(child)
        if (key != null && !oldKeyedChildrenMap[key].using) {
          if (oldChildrenElements[index]) {
            removeElement(rootElement, oldChildrenElements[index], child)
            oldChildrenElements[index].deleted = true
            oldChildren[index].deleted = true
          }
        }
      })
      oldChildrenElements = oldChildrenElements.filter((c) => c && !c.deleted)
      oldChildren = oldChildren.filter((c) => c && !c.deleted)

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

  function getKey(node) {
    return node ? node.key : null
  }

  function removeElement(parent, element, node) {
    function removeImpl() {
      if (node) {
        element = removeChildren(element, node)
      }
      parent.removeChild(element)
    }

    const { attributes } = node || {}
    if (attributes && attributes.onremove) {
      // onremove is a special event in hyperapp.
      // It is usually used for animation.
      // you animate, and then call the callback to actually remove it.
      attributes.onremove(element, removeImpl)
    } else {
      removeImpl()
    }
  }

  function removeChildren(element, node) {
    const { attributes, children } = node
    if (attributes) {
      children.map((_, i) => {
        removeChildren(element.childNodes[i], node.children[i])
      })

      // trigger destroy immediately, but trigger create with a stack
      if (attributes.ondestroy) {
        attributes.ondestroy(element)
      }
    }
    return element
  }

  function createElement(node, isSvg) {
    if (node == null) return node
    const { attributes, nodeName, children } = node
    isSvg = isSvg || nodeName === 'svg'
    let element
    if (typeof node === 'string' || typeof node === 'number') {
      element = document.createTextNode(node)
    } else if (isSvg) {
      element = document.createElementNS('http://www.w3.org/2000/svg', nodeName)
    } else {
      element = document.createElement(nodeName)
    }

    if (attributes) {
      if (attributes.oncreate) {
        // produce oncreate events
        lifeCycleEvents.push(() => attributes.oncreate(element))
      }

      Object.keys(attributes).map((key) =>
        updateAttribute(element, key, attributes[key], null, isSvg),
      )
    }

    if (children) {
      children.map((child, index) => {
        child = resolveNode(child)
        children[index] = child
        if (child != null) {
          node.children[index] = child
          element.appendChild(createElement(child), isSvg)
        }
      })
      node.children = children
    }

    return element
  }

  // use synthetic event here to improve performance
  function eventListener(event) {
    return event.currentTarget.events[event.type](event)
  }

  // update an element
  function updateElement(element, oldAttributes, attributes) {
    oldAttributes = oldAttributes == null ? {} : oldAttributes
    attributes = attributes == null ? {} : attributes
    if (shallowEqual(oldAttributes, attributes)) return
    const allAttributes = { ...oldAttributes, ...attributes }
    Object.keys(allAttributes).map((attributeName) => {
      const newAttribute = attributes[attributeName]
      const oldAttribute =
        attributeName === 'checked' || attributeName === 'value'
          ? element[attributeName]
          : oldAttributes[attributeName]
      if (newAttribute !== oldAttribute) {
        updateAttribute(element, attributeName, newAttribute, oldAttribute)
      }
    })
    if (attributes.onupdate) {
      lifeCycleEvents.push(() =>
        attributes.onupdate(element, oldAttributes, attributes),
      )
    }
  }

  // update a element's attributes. with binding all the event listeners.
  function updateAttribute(element, name, value, oldValue) {
    if (name === 'key') {
    } else if (name === 'style') {
      Object.assign(element.style, value)
    } else {
      // bind the event listener
      if (name.startsWith('on')) {
        const eventName = name.substr(2)
        if (!element.events) {
          element.events = {}
        } else if (!oldValue) {
          oldValue = element.events[eventName]
        }

        element.events[eventName] = value

        if (value) {
          if (!oldValue) {
            element.addEventListener(eventName, eventListener)
          }
        } else {
          element.removeEventListener(eventName, eventListener)
        }
      }
      if (value === null || value === false) {
        element.removeAttribute(name)
      } else {
        element.setAttribute(name, value)
      }
    }
  }

  // impl with namespace feature.
  // Can easily update small part of state if action is nested under the same path as the state.
  function wireStateToActions(path = [], state, actions) {
    Object.keys(actions).map((key) => {
      if (typeof actions[key] === 'function') {
        const originalAction = actions[key]
        actions[key] = (...args) => {
          let result = originalAction(...args)
          if (typeof result === 'function') {
            state = getPartialState(path, globalState)
            result = result(state, wiredActions)
          }

          function updateStateImpl(newState) {
            if (newState !== getPartialState(path, globalState)) {
              globalState = setPartialState(
                path,
                { ...state, ...newState },
                globalState,
              )
              renderOnNextTick()
            }
          }

          if (result && result.then) {
            result.then((newState) => {
              updateStateImpl(newState)
            })
          } else {
            updateStateImpl(result)
          }
          return result
        }
      } else {
        actions[key] = wireStateToActions(
          path.concat(key),
          { ...state[key] },
          { ...actions[key] },
        )
      }
    })
    return actions
  }

  // get state in the path
  function getPartialState(path, state) {
    let result = state
    path.map((key) => {
      result = result ? result[key] : null
    })
    return result
  }

  function setPartialState(path, value, source) {
    let target = {}
    if (path.length) {
      target[path[0]] =
        path.length > 1
          ? setPartialState(path.slice(1), value, source[path[0]])
          : value
      return { ...source, ...target }
    }
    return value
  }

  function renderOnNextTick() {
    if (!renderScheduled) {
      renderScheduled = true
      setTimeout(render)
    }
  }
}
