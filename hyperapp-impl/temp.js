
const oldKeyedChildNodeMap = {};
const oldChildElements = [];
// perform the reuse here.
const { children: oldChildren } = oldNode;
const { children: newChildren } = newNode;
oldChildren.map((child, index) => {
  const key = getKey(child);
  if (key != null) {
    oldKeyedChildNodeMap[key] = child;
  }
  oldChildElements[index] = rootElement.childNodes[index];
});

let oldChildPtr = 0;
let newChildPtr = 0;
while (oldChildren[oldChildPtr] && newChildren[newChildPtr]) {
  const newChild = newChildren[newChildPtr];
  const newChildKey = getKey(newChild);
  while (
    oldChildren[oldChildPtr] &&
    newChildren[newChildPtr] &&
    (newChildKey !== getKey(oldChildren[oldChildPtr]) &&
      newChild.nodeName !== oldChildren[oldChildPtr].nodeName)
    ) {
    renderChunk(rootElement, null, null, newChildren[newChildPtr]);
    newChildPtr++;
  }
  // now both ptr pointing the same keyed node
  renderChunk(
    rootElement,
    oldChildElements[oldChildPtr],
    oldChildren[oldChildPtr],
    newChild
  );
  oldChildPtr++;
  newChildPtr++;
}
// mount the rest new child
while (newChildren[newChildPtr]) {
  renderChunk(rootElement, null, null, newChildren[newChildPtr]);
  newChildPtr++;
}
// remove the rest
while (oldChildren[oldChildPtr]) {
  removeElement(
    rootElement,
    oldChildElements[oldChildPtr],
    oldChildren[oldChildPtr]
  );
  oldChildPtr++;
}