Ant.TinyModel = class extends SDK.DOMModel {
  constructor(target) {
    super(target);
    const dispatcher = new Ant.TinyDispatcher(this);
    this._tinyConnection = new Ant.TinyConnection(target, dispatcher);
    // this._agent = target.tinyAgent();
    target.registerDOMDispatcher(dispatcher);
    this._agent = target.domAgent();
    this._idToDOMNode = {};
    this._document = null;
    this._attributeLoadNodeIds = new Set();
    this._runtimeModel = /** @type {!SDK.RuntimeModel} */ (Ant.targetManager.getWorkerTarget().model(SDK.RuntimeModel));
  }

  cssModel() {
    if (!this._cssModel)
      this._cssModel = new SDK.CSSModel(this._target, this);
    return this._cssModel;
  }

  requestDocument(node) {
    this._agent.getDocument();
  }

  markUndoableState() {
    this._agent.markUndoableState();
  }

  _setDocument(payload) {
    this._idToDOMNode = {};
    if (payload && 'nodeId' in payload)
      this._document = new SDK.DOMDocument(this, payload);
    else
      this._document = null;
    this.dispatchEventToListeners(SDK.DOMModel.Events.DocumentUpdated, this);
  }
};

Ant.TinyModel.Events = {
  AttrModified: Symbol('tiny-AttrModified'),
  AttrRemoved: Symbol('tiny-AttrRemoved'),
  CharacterDataModified: Symbol('tiny-CharacterDataModified'),
  DOMMutated: Symbol('tiny-DOMMutated'),
  NodeInserted: Symbol('tiny-NodeInserted'),
  NodeRemoved: Symbol('tiny-NodeRemoved'),
  DocumentUpdated: Symbol('tiny-DocumentUpdated'),
  ChildNodeCountUpdated: Symbol('tiny-ChildNodeCountUpdated'),
  DistributedNodesChanged: Symbol('tiny-DistributedNodesChanged'),
  MarkersChanged: Symbol('tiny-MarkersChanged')
};

Ant.TinyDispatcher = class extends SDK.DOMDispatcher {
  constructor(tinyModel) {
    super(tinyModel);
  }

  documentUpdated() {
    // get the document from a new webview.
    this._domModel._documentUpdated();
  }
};

// SDK.SDKModel.register(Ant.TinyModel, SDK.Target.Capability.DOM, false);
