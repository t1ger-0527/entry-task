/**
 * v-node
 *  - nodeName
 *  - attributes
 *  - children
 *  - key
 * @returns {*}
 */

// Create and return a new Element
export function h(name, attributes = {}, ...children) {
  if (typeof name === "function") return name(attributes, children);
  return {
    nodeName: name,
    attributes,
    children,
    key: attributes && attributes.key
  };
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
  let globalState = { ...state };
  let rootElement = null;
  let oldNode = null;
  // plain action functions should be wired,
  // so that actions will trigger state change and re-render.
  const wiredActions = wireStateToActions([], globalState, { ...actions });
  // Life cycle events
  const lifeCycleEvents = [];

  function render() {
    const newNode = resolveNode(view);
    renderChunk(container, view, oldNode, newNode);
    oldNode = newNode;
  }

  function resolveNode(node) {
    return typeof node === "function"
      ? resolveNode(node(globalState, wiredActions))
      : node != null
        ? node
        : "";
  }

  function renderChunk(parentElement, rootElement, oldNode, newNode) {
    const newElement = createElement(newNode)
    parentElement.insertBefore(newElement, rootElement)

    if (oldNode != null) {
      removeElement(parentElement, rootElement, oldNode)
    }
  }

  function removeElement(parent, element, node) {
     function removeImpl() {
       const child = removeChildren(element, node)
       parent.removeChild(child)
     }

     const {attributes} = node
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
    const {attributes, children} = node
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
    const { attributes, nodeName, children } = node;
    isSvg = isSvg || nodeName === "svg";
    let element;
    if (typeof node === "string" || typeof node === "number") {
      element = document.createTextNode(node);
    } else if (isSvg) {
      element = document.createElementNS(
        "http://www.w3.org/2000/svg",
        nodeName
      );
    } else {
      element = document.createElement(nodeName);
    }

    if (attributes) {
      if (attributes.oncreate) {
        // produce oncreate events
        lifeCycleEvents.push(() => attributes.oncreate(element));
      }

      children.map((child, index) => {
        child = resolveNode(child);
        node.children[index] = child;
        element.appendChild(createElement(child), isSvg);
      });

      Object.keys(attributes).map(key =>
        updateAttribute(element, key, attributes[key], null, isSvg)
      );
    }

    return element;
  }

  // TODO: updates a element's attributes. with binding all the event listeners.
  function updateAttribute(element, name, value, oldValue) {}

  // impl with namespace feature.
  // Can easily update small part of state if action is nested under the same path as the state.
  function wireStateToActions(path = [], state, actions) {
    Object.keys(actions).map(key => {
      if (typeof actions[key] === "function") {
        const originalAction = actions[key];
        actions[key] = (...args) => {
          let result = originalAction(...args);
          if (typeof result === "function") {
            state = getPartialState(path, globalState);
            result = result(state);
          }

          function updateStateImpl(newState) {
            if (newState !== getPartialState(path, globalState)) {
              globalState = setPartialState(
                path,
                { ...state, ...newState },
                globalState
              );
              renderOnNextTick();
            }
          }

          if (result.then) {
            result.then(newState => {
              updateStateImpl(newState);
            });
          } else {
            updateStateImpl(result);
          }
        };
      } else {
        wireStateToActions(
          path.concat(key),
          { ...state[key] },
          { ...actions[key] }
        );
      }
    });
  }

  // get state in the path
  function getPartialState(path, state) {
    let result = state;
    path.map(key => {
      result = result ? result[key] : null;
    });
    return result;
  }

  function setPartialState(path, value, source) {
    let target = {};
    if (path.length) {
      target[path[0]] =
        path.length > 1
          ? setPartialState(path.slice(1), value, source[path[0]])
          : value;
      return { ...source, ...target };
    }
    return value;
  }

  function renderOnNextTick() {
    setTimeout(render);
  }

  // return actions so you can call actions from the outside.
  return actions;
}
