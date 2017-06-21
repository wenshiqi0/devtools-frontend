const win = window;

Ant.AxmlPanel = class extends Elements.ElementsPanel {
  constructor() {
    super('axml');

    this.registerRequiredCSS('elements/elementsTreeOutline.css');

    SDK.targetManager.observeModels(Ant.TinyModel, this);
    SDK.targetManager.addModelListener(
      Ant.TinyModel, SDK.DOMModel.Events.DocumentUpdated, this._documentUpdatedEvent, this);
  }

  modelAdded(domModel) {
    if (this._treeOutlines[0]) return;

    var treeOutline = new Elements.ElementsTreeOutline(domModel, true, true);
    treeOutline.setWordWrap(Common.moduleSetting('domWordWrap').get());
    treeOutline.wireToDOMModel();
    treeOutline.addEventListener(
        Elements.ElementsTreeOutline.Events.SelectedNodeChanged, this._selectedNodeChanged, this);
    treeOutline.addEventListener(
        Elements.ElementsTreeOutline.Events.ElementsTreeUpdated, this._updateBreadcrumbIfNeeded, this);
    new Elements.ElementsTreeElementHighlighter(treeOutline);
    this._treeOutlines.push(treeOutline);
    if (domModel.target().parentTarget()) {
      this._treeOutlineHeaders.set(treeOutline, createElementWithClass('div', 'elements-tree-header'));
      this._targetNameChanged(domModel.target());
    }

    // Perform attach if necessary.
    if (this.isShowing())
      this.wasShown();
  }
};

/**
 * @implements {Common.Revealer}
 * @unrestricted
 */
Ant.AxmlPanel.CSSPropertyRevealer = class {
  /**
   * @override
   * @param {!Object} property
   * @return {!Promise}
   */
  reveal(property) {
    var panel = Ant.AxmlPanel.instance();
    return panel._revealProperty(/** @type {!SDK.CSSProperty} */ (property));
  }
};

Ant.AxmlPanel.DOMNodeRevealer = class {
  /**
   * @override
   * @param {!Object} node
   * @return {!Promise}
   */
  reveal(node) {
    var panel = Elements.ElementsPanel.instance();
    panel._pendingNodeReveal = true;

    return new Promise(revealPromise);

    /**
     * @param {function(undefined)} resolve
     * @param {function(!Error)} reject
     */
    function revealPromise(resolve, reject) {
      if (node instanceof SDK.DOMNode) {
        onNodeResolved(/** @type {!SDK.DOMNode} */ (node));
      } else if (node instanceof SDK.DeferredDOMNode) {
        (/** @type {!SDK.DeferredDOMNode} */ (node)).resolve(onNodeResolved);
      } else if (node instanceof SDK.RemoteObject) {
        var domModel = /** @type {!SDK.RemoteObject} */ (node).runtimeModel().target().model(Ant.TinyModel);
        if (domModel)
          domModel.pushObjectAsNodeToFrontend(node).then(onNodeResolved);
        else
          reject(new Error('Could not resolve a node to reveal.'));
      } else {
        reject(new Error('Can\'t reveal a non-node.'));
        panel._pendingNodeReveal = false;
      }

      /**
       * @param {?SDK.DOMNode} resolvedNode
       */
      function onNodeResolved(resolvedNode) {
        panel._pendingNodeReveal = false;

        if (resolvedNode) {
          panel.revealAndSelectNode(resolvedNode).then(resolve);
          return;
        }
        reject(new Error('Could not resolve node to reveal.'));
      }
    }
  }
};
