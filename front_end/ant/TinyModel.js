Ant.TinyModel = class extends SDK.DOMModel {
  constructor(target) {
    super(target);

    const dispatcher = new Ant.TinyDispatcher(this);
    this._tinyConnection = new Ant.TinyConnection(target, dispatcher);

    this._agent = target.tinyAgent();
    this._domAgent = target.domAgent();

    this._idToDOMNode = {};

    this._document = null;

    this._attributeLoadNodeIds = {};

    this._runtimeModel = /** @type {!SDK.RuntimeModel} */ (target.model(SDK.RuntimeModel));

    this._agent.enable();
  }

  cssModel() {
    return /** @type {!Ant.AcssModel} */ (this.target().model(Ant.AcssModel));
  }

  requestDocument(node) {
    this._agent.getDocument();
  }

  markUndoableState() {
    this._domAgent.markUndoableState();
  }

  _setDocument(payload) {
    this._idToDOMNode = {};
    if (payload && 'nodeId' in payload)
      this._document = new SDK.DOMDocument(this, payload);
    else
      this._document = null;
    this.dispatchEventToListeners(SDK.DOMModel.Events.DocumentUpdated, this);
  }

  _documentUpdated() {
    this._setDocument(null);
  }

  requestDocumentPromise() {
    return Ant.makeProxyPromiseOnce('getDocumentOnce', {},
      payload => {
        const root = payload.root;
        if (root)
          this._setDocument(root);
        delete this._pendingDocumentRequestPromise;
        if (!this._document)
          console.error('No document');
        return this._document;
      }
    );
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

SDK.SDKModel.register(Ant.TinyModel, SDK.Target.Capability.DOM, true);
