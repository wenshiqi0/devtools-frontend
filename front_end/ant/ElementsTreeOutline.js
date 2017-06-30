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

    function callback({ data }) {
      let j = 0;
      (node._children || []).forEach(child => {
        if (data && data[j] && child._localName !== 'label' && !child._nodeValue)
          child = Ant.combineNativeAndReactDom(child, data[j++]);
      });
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
    if (typeof value === 'string') {
      keyValue.value = value;
    } else if (typeof value === 'object') {
      Object.keys(value).forEach(property => {
        keyValue.value += `${property}: ${value[property]};`;
      });
    } else {
      keyValue.value += `{{${String(value)}}}`;
    }
    keyValue._node = dom;
    obj.push(keyValue);
    objMap[key] = keyValue;
  });
  dom._attributes = obj;
  dom._attributesMap = objMap;
  return dom;
};
