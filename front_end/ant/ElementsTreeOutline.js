Ant.ElementsTreeOutline = class extends Elements.ElementsTreeOutline {
  _updateModifiedParentNode(node) {
    const self = this;

    var parentTreeElement = this.findTreeElement(node);

    function getData(children) {
      return children.map(child => (
        {
          backendNodeId: child._backendNodeId,
          nodeId: child.id,
        }
      ));
    }

    async function callback({ data }) {
      let j = 0;
      const agent = Ant.targetManager.getCurrentTarget().domAgent();
      for (const i in node._children) {
        let child = node._children[i];
        if (!child) continue;
        if (data && data[j] && !child._nodeValue) {
          child = Ant.combineNativeAndReactDom(child, data[j++]);

          // `text` and `button` has span text inside.
          // and we want to display it as inline text.
          if (Ant.spanTags.has(child._localName) || (child._localName === 'label' && child._textChildren)) {
            let textNode;
            if (child._localName === 'text' || (child._localName === 'label' && child._textChildren)) {
              await agent.requestChildNodes(child.id, 1);
              textNode = child.children()[1];
            } else {
              const id = await agent.querySelector(child.id, 'span');
              textNode = Ant.DOMNode.create(Ant.targetManager.getCurrentModel(), child._document, false, {
                nodeId: id + 1,
                backendNodeId: id,
                nodeValue: child._textValue,
                nodeType: 3,
                childNodeCount: 0,
                localName: '',
                nodeName: '#text',
              });
            }
            if (textNode) {
              child.firstChild = textNode;
              child._children = [ textNode ];
              child.lastChild = textNode;
            }
          }
        }
      }
      this._updateChildren(parentTreeElement);
    }

    if (parentTreeElement) {
      parentTreeElement.setExpandable(this._hasVisibleChildren(node));
      parentTreeElement.updateTitle(this._updateRecordForHighlight(node));
      if (parentTreeElement.populated) {
        node.getChildNodes(children => {
          if (!children) return;
          Ant.makeProxyPromiseOnce('setChildNodeIdOnce', { parentId: node.id, payloads: getData(children) }, callback.bind(self));
        });
      }
    }
  }

  _updateChildren(treeElement) {
    if (!treeElement.isExpandable()) {
      var selectedTreeElement = treeElement.treeOutline.selectedTreeElement;
      if (selectedTreeElement && selectedTreeElement.hasAncestor(treeElement))
        treeElement.select(true);
      treeElement.removeChildren();
      return;
    }

    console.assert(!treeElement.isClosingTag());
    this._innerUpdateChildren(treeElement);
  }
};

Ant.combineNativeAndReactDom = (dom, data) => {
  const obj = [];
  const objMap = {};
  dom._localName = data.name;
  dom._nodeName = data.name.toUpperCase();
  Object.keys(data.props || {}).forEach(key => {
    let value = data.props[key];
    const keyValue = {};
    keyValue.value = '';
    keyValue.name = key;
    if (key.match(/^_/)) {
      dom[key] = value;
      return;
    }
    if (typeof value === 'string') {
      keyValue.value = value;
    } else if (typeof value === 'object') {
      Object.keys(value).forEach(property => {
        keyValue.value += `${property}: ${value[property]};`;
      });
    } else {
      keyValue.value += `${String(value)}`;
    }
    keyValue._node = dom;
    obj.push(keyValue);
    objMap[key] = keyValue;
  });
  dom._attributes = obj;
  dom._attributesMap = objMap;
  return dom;
};

Ant.spanTags = new Set([ 'button', 'text' ]);
