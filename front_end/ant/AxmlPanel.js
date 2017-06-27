const win = window;
let tinyModel;

Ant.makeProxyPromiseOnce = (method, payload, callback) =>
  new Promise((resolve, reject) => {
    window.sendToHost('render', {
      method,
      payload,
    });
    window.listenToHostOnce(`render-${method}`, (event, args) => {
      const { payload } = args;
      if (callback && (typeof callback) === 'function')
        resolve(callback(payload));
      else
        resolve(payload);
    });
  });

Ant.AxmlPanel = class extends Elements.ElementsPanel {
  constructor() {
    super('axml');

    this.registerRequiredCSS('elements/elementsTreeOutline.css');
    Ant.targetManager.addEventListener(
      Ant.TargetManager.Events.switchTarget, this.requestTargetWS, this);
    this.requestTargetWS();
  }

  modelAdded(domModel) {
    if (tinyModel) this.modelRemoved(tinyModel);
    tinyModel = domModel;

    var treeOutline = new Elements.ElementsTreeOutline(domModel, true, true);
    treeOutline.setWordWrap(Common.moduleSetting('domWordWrap').get());
    treeOutline.wireToDOMModel();
    treeOutline.addEventListener(
        Elements.ElementsTreeOutline.Events.SelectedNodeChanged, this._selectedNodeChanged, this);
    treeOutline.addEventListener(
        Elements.ElementsTreeOutline.Events.ElementsTreeUpdated, this._updateBreadcrumbIfNeeded, this);
    new Elements.ElementsTreeElementHighlighter(treeOutline);
    this._treeOutlines = [treeOutline];

    if (domModel.target().parentTarget()) {
      this._treeOutlineHeaders.set(treeOutline, createElementWithClass('div', 'elements-tree-header'));
      this._targetNameChanged(domModel.target());
    }

    // Perform attach if necessary.
    if (this.isShowing())
      this.wasShown();
  }

  async requestTargetWS() {
    const { ws, path } = await Ant.makeProxyPromiseOnce('initOnce');
    const { target, model } = Ant.targetManager.addNewTarget(path, ws);
    this._target = target;
    this._tinyModel = model;
    this.modelAdded(model);
    SDK.targetManager.modelAdded(this._target, Ant.TinyModel, model);
    SDK.targetManager.observeModels(Ant.TinyModel, this);
    SDK.targetManager.addModelListener(
      Ant.TinyModel, SDK.DOMModel.Events.DocumentUpdated, this._documentUpdatedEvent, this);

    await model.requestDocumentPromise();
  }
};
