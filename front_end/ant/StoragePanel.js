Ant.StoragePanel = class extends UI.VBox {
  constructor() {
    super('storage');
    this.registerRequiredCSS('resources/resourcesPanel.css');

    this._target = SDK.targetManager.mainTarget();

    this.contentElement.classList.add('storage-view');

    const domStorageModel = this._target.model(Resources.DOMStorageModel);

    domStorageModel.enable();
    domStorageModel.storages().forEach(this._addDOMStorage.bind(this));
    domStorageModel.addEventListener(Resources.DOMStorageModel.Events.DOMStorageAdded, this._domStorageAdded, this);
    domStorageModel.addEventListener(Resources.DOMStorageModel.Events.DOMStorageRemoved, this._domStorageRemoved, this);

    this._domStorageView = null;
  }

  _addDOMStorage(domStorage) {
    if (!domStorage._isLocalStorage) return;
    this.showStorage(domStorage);
  }

  _domStorageAdded(event) {
    var domStorage = /** @type {!Resources.DOMStorage} */ (event.data);
    this._addDOMStorage(domStorage);
  }

  _domStorageRemoved(event) {
    var domStorage = /** @type {!Resources.DOMStorage} */ (event.data);
    this._removeDOMStorage(domStorage);
  }

  _removeDOMStorage(domStorage) {
    var treeElement = this._domStorageTreeElements.get(domStorage);
    if (!treeElement)
      return;
    var wasSelected = treeElement.selected;
    var parentListTreeElement = treeElement.parent;
    parentListTreeElement.removeChild(treeElement);
    if (wasSelected)
      parentListTreeElement.select();
    this._domStorageTreeElements.remove(domStorage);
  }

  showView(view) {
    view.show(this.contentElement);
  }

  showStorage(domStorage) {
    if (!domStorage)
      return null;
    if (!this._domStorageView)
      this._domStorageView = new Resources.DOMStorageItemsView(domStorage);
    else
      this._domStorageView.setStorage(domStorage);
    this.showView(this._domStorageView);
  }
};

Ant.StoragePanel.ResourceRevealer = class {
  /**
   * @override
   * @param {!Object} resource
   * @return {!Promise}
   */
  reveal(resource) {
    if (!(resource instanceof SDK.Resource))
      return Promise.reject(new Error('Internal error: not a resource'));
    var panel = Resources.ResourcesPanel._instance()._sidebar;
    return UI.viewManager.showView('resources').then(panel.showResource.bind(panel, resource));
  }
};
