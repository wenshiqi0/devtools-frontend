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

      if (node._localName === 'swiper' || node._localName === 'picker-view-column')
        return this._updateChildren(parentTreeElement);

      if (node._localName === 'picker-view') {
        await agent.requestChildNodes(node.id, 3);
        for (const i in node._children) {
          node._children[i]._attributes = [];
          node._children[i]._attributesMap = {};
          node._children[i]._localName = 'picker-view-column';
          node._children[i]._nodeName = 'picker-view-column'.toUpperCase();
          node._children[i]._children = node._children[i]._children[2]._children;
          node._children[i]._children.forEach(child => {
            child._attributes = [];
            child._attributesMap = {};
            child._localName = 'picker-view-item';
            child._nodeName = 'picker-view-item'.toUpperCase();
          });
        }
        return this._updateChildren(parentTreeElement);
      }

      for (const i in node._children) {
        let child = node._children[i];
        if (!child) continue;
        if (data && data[j] && !child._nodeValue) {
          child = Ant.combineNativeAndReactDom(child, data[j++]);

          // swiper view is much more special,
          // some no meaning wrapper we need to remove it from tree.
          // and add swiper-item to the div with no atttributions.
          if (child._localName === 'swiper') {
            await agent.requestChildNodes(child.id, 4);
            child._children.forEach(child => {
              child._attributes = [];
              child._attributesMap = {};
              child._localName = 'swiper-item';
              child._nodeName = 'swiper-item'.toUpperCase();
            });
          }

          if (child._localName === 'picker-view') {
            await agent.requestChildNodes(child.id, 2);
            child._children.forEach(child => {
              child._attributes = [];
              child._attributesMap = {};
              child._localName = 'picker-view-column';
              child._nodeName = 'picker-view-column'.toUpperCase();
            });
          }

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
          Ant.makeProxyPromiseOnce('setChildNodeIdOnce', { parentId: node.id, nodeType: node._localName, payloads: getData(children) }, callback.bind(self));
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
