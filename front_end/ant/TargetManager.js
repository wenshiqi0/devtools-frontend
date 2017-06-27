Ant.TargetManager = class extends Common.Object {
  constructor() {
    super();
    this._targets = new Map();
    this._currentTarget = null;
    this._currentModel = null;
  }

  _webSocketConnectionLostCallback(path) {
    if (path) {
      const { target } = this._targets.get(path);
      SDK.targetManager.removeTarget(target);
      this._targets.delete(path);
    }
  }

  addNewTarget(path, ws) {
    if (this._targets.has(path)) {
      const old = this._targets.get(path);
      this.setCurrent(path);
      return old;
    }

    const createMainConnection = (ws, params) =>
      new SDK.WebSocketConnection(ws, this._webSocketConnectionLostCallback.bind(this, path), params);

    const target = SDK.targetManager.createTarget(path, `tinyPage(${path})`,
      SDK.Target.Capability.DOM | SDK.Target.Capability.Target, createMainConnection.bind(this, ws), null);

    this.enableEmulation(target);

    const tinyModel = new Ant.TinyModel(target);

    this._targets.set(path, { target, model: tinyModel });
    this.setCurrent(path);

    return { target, model: tinyModel };
  }

  enableEmulation(target) {
    const pageAgent = target.pageAgent();
    const emulationAgent = target.emulationAgent();
    pageAgent.enable().then(() => {
      emulationAgent.setTouchEmulationEnabled(true, 'mobile');
    });
  }

  setCurrent(path) {
    const { target, model } = this._targets.get(path);
    this._currentTarget = target;
    this._currentModel = model;
  }

  switchTarget() {
    this.dispatchEventToListeners(Ant.TargetManager.Events.switchTarget);
  }

  addModel(target, modelClass, model) {
    SDK.targetManager.modelAdded(target, modelClass, model);
  }

  getWorkerTarget() {
    return SDK.targetManager.mainTarget();
  }

  has(path) {
    return this._targets.has(path);
  }

  get(path) {
    return this._targets.get(path);
  }
};

Ant.TargetManager.Events = {
  switchTarget: Symbol('ant-switchTarget'),
};

Ant.targetManager = new Ant.TargetManager();
