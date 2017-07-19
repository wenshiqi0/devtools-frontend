Ant = {};

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

Ant.TargetManager = class extends Common.Object {
  constructor() {
    super();
    this._targets = new Map();
    this._currentPath = null;
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
      SDK.Target.Capability.DOM | SDK.Target.Capability.Target | SDK.Target.Capability.Browser | SDK.Target.Capability.DeviceEmulation,
      createMainConnection.bind(this, ws), null);

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
    this._currentPath = path;
    this._currentTarget = target;
    this._currentModel = model;
  }

  getCurrentTarget() {
    return this._currentTarget;
  }

  getCurrentModel() {
    return this._currentModel;
  }

  getCurrentPath() {
    return this._currentPath;
  }

  getCurrent() {
    return {
      path: this._currentPath,
      model: this._currentModel,
      target: this._currentTarget,
    };
  }

  async switchTarget() {
    const { ws, path } = await Ant.makeProxyPromiseOnce('initOnce');
    Ant.targetManager.addNewTarget(path, ws);
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
