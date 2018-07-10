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
  children = Array.isArray(children)
    ? children.concat(otherChildren)
    : [children].concat(otherChildren)
  if (typeof name === 'function') return name(attributes, children)
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
  let firstRender = true
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
    renderScheduled = !renderScheduled
    const newNode = resolveNode(view)
    globalRootElement = renderChunk(
      container,
      globalRootElement,
      globalOldNode,
      newNode,
    )
    globalOldNode = newNode
    firstRender = false
    // clear all live cycle events (mostly oncreate events)
    // but without differing, lifecycle would just triggered every update.
    while (lifeCycleEvents.length) lifeCycleEvents.pop()()
  }

  // resolve empty text node for null node.
  function resolveNode(node) {
    return typeof node === 'function'
      ? resolveNode(node(globalState, wiredActions))
      : node != null
        ? node
        : ''
  }

  // DEV: first working version of chunk rendering.
  function renderChunk2(parentElement, rootElement, oldNode, newNode) {
    // no reuse
    const newElement = createElement(newNode)
    const newRootElement = parentElement.insertBefore(newElement, rootElement)

    if (oldNode != null) {
      removeElement(parentElement, rootElement, oldNode)
    }

    return newRootElement
  }

  function canReuse(oldNode, newNode) {
    return oldNode != null && oldNode.nodeName === newNode.nodeName
  }

  /**
   * differing
   * @param parentElement, the container you want newNode to be in.
   * @param rootElement, the element that previously rendered by newNode
   * @param oldNode, the previous version of v-node
   * @param newNode, the version of v-node you want to render
   * @param isSvg
   * @returns {*}
   */
  function renderChunk(parentElement, rootElement, oldNode, newNode, isSvg) {
    /**
     * There are three cases when chunk rendering:
     *   - same v-node (for text, number and empty node.)
     *   - can't re-use, create new element, insert and remove the old one (if there is).
     *   - simple replacement of nodeValue (for text, number and empty node.)
     *   - reuse, update element and align children. continume call re-render on children.
     */
    if (newNode === oldNode) {
      // the node is same, do nothing.
    } else if (!canReuse(oldNode, newNode)) {
      // when nodeName is different, or is new node, just create.
      const newElement = createElement(newNode, isSvg)
      parentElement.insertBefore(newElement, rootElement)

      if (oldNode != null) {
        // if is replacement, remove the old one.
        removeElement(parentElement, rootElement, oldNode)
      } else {
        // pure insertion, nothing else happened.
      }

      return newElement
    } else if (oldNode.nodeName == null) {
      rootElement.nodeValue = newNode
    } else {
      /**
       * reuse part:
       *   1. mark all keyed old children, collect the old elements.
       *   2. iterate all new children, insert new children or perform move & update.
       *   3. remove all remaining child element that doesn't have key.
       *   4. remove all unused keyed child element.
       */
      // now we perform the reuse:
      // first, we update this element's attributes.
      updateElement(
        rootElement,
        oldNode.attributes,
        newNode.attributes,
        // if parent is svg, then all children is svg.
        (isSvg = isSvg || newNode.nodeName === 'svg'),
      )

      // we find out which children we can reuse.
      const oldKeyed = {}
      const newKeyed = {}
      const oldElements = []
      const oldChildren = oldNode.children
      const newChildren = newNode.children

      oldChildren.map((child, i) => {
        oldElements[i] = rootElement.childNodes[i]

        const oldKey = getKey(child)
        if (oldKey != null) {
          oldKeyed[oldKey] = [oldElements[i], child]
        }
      })

      let oldChildrenPtr = 0
      let newChildrenPtr = 0

      /**
       * with one single iteration of new children, we do things below:
       *   - resolve the new node function to a v-node object, and save it.
       *   - fast-forward the oldChildrenPtr to a not inserted child.
       *   - if the new node do not have a key:
       *     - fast-forward the oldChildrenPtr to a not keyed child
       *     - now both old and new node do not have key, perform a re-render on those node.
       *     - NOTE: if all old children have keys and a new child do not,
       *       it may cause all old children to re-render. (so-called rare performance pitfall)
       *   - if the new node do have key:
       *     - if new node and old node key are the same, perform a simple update.
       *     - else if new node key was in old nodes, move the same key old node before current old node,
       *       and perform a update on same key node.
       *     - else perform a simple insertion before current old node.
       *   - save the key to rendered new node map, and move forward new node pointer.
       */
      while (newChildrenPtr < newChildren.length) {
        // resolve new child first.
        const newChild = resolveNode(newChildren[newChildrenPtr])
        newChildren[newChildrenPtr] = newChild
        const oldChild = oldChildren[oldChildrenPtr]
        const oldChildElement = oldElements[oldChildrenPtr]
        const oldKey = getKey(oldChild)
        const newKey = getKey(newChild)

        // if have re-rendered the old key, move old node ptr forward
        if (newKeyed[oldKey]) {
          oldChildrenPtr++
          continue
        }

        // FIXME
        // if (
        //   newKey != null &&
        //   newKey === getKey(oldChildren[oldChildrenPtr + 1])
        // ) {
        //   debugger
        //   if (oldKey == null) {
        //     removeElement(rootElement, oldChildElement, oldChild)
        //   }
        //   oldChildrenPtr++
        //   continue
        // }

        if (newKey == null || firstRender) {
          if (oldKey == null) {
            // both have no key, try to reuse the old element.
            renderChunk(rootElement, oldChildElement, oldChild, newChild, isSvg)
            newChildrenPtr++
          }
          oldChildrenPtr++
        } else {
          const [oldSameKeyedElement, oldSameKeyedNode] = oldKeyed[newKey] || []

          if (oldKey === newKey) {
            // best case, we perform an simple update with matching element and nodes.
            renderChunk(
              rootElement,
              oldSameKeyedElement,
              oldSameKeyedNode,
              newChild,
              isSvg,
            )
            oldChildrenPtr++
          } else if (oldSameKeyedElement) {
            // we have a match but not with the right index.
            // we move the old element to the current index place.
            const movedSameKeyElement = rootElement.insertBefore(
              oldSameKeyedElement,
              oldChildElement,
            )
            // and then perform an update on it.
            renderChunk(
              rootElement,
              movedSameKeyElement,
              oldSameKeyedNode,
              newChildren[newChildrenPtr],
              isSvg,
            )
          } else {
            // perform a pure insertion, before oldChildElement.
            renderChunk(rootElement, oldChildElement, null, newChild, isSvg)
          }

          // update new child ptr with new child produced.
          newKeyed[newKey] = newChild
          newChildrenPtr++
        }
      }

      // all new nodes are rendered, remove the remaining not keyed old elements from parent.
      while (oldChildrenPtr < oldChildren.length) {
        const oldChild = oldChildren[oldChildrenPtr]
        if (getKey(oldChild) == null) {
          removeElement(rootElement, oldElements[oldChildrenPtr], oldChild)
        }
        oldChildrenPtr++
      }

      // also remove the not rendered old elements
      for (let i in oldKeyed) {
        if (!newKeyed[i]) {
          removeElement(rootElement, oldKeyed[i][0], oldKeyed[i][1])
        }
      }
    }
    return rootElement
  }

  function getKey(node) {
    return node ? node.key : null
  }

  function removeElement(parent, element, node) {
    function removeImpl() {
      if (element && node) {
        element = removeChildren(element, node)
      }
      parent.removeChild(element)
    }

    const { attributes } = node || {}
    if (attributes && attributes.onremove) {
      // onremove is a special event in framework.
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
        attributes.ondestroy(element, wiredActions)
      }
    }
    return element
  }

  function createElement(node, isSvg) {
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
        lifeCycleEvents.push(() => attributes.oncreate(element, wiredActions))
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
    if (name === 'className') name = 'class'
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
            state = getPartialState(path, globalState)
            if (newState !== state) {
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
