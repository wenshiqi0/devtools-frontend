Ant = {};

Ant.makeProxyPromiseOnce = (method, payload, callback) =>
  new Promise((resolve, reject) => {
    window.listenToHostOnce(`render-${method}`, (event, args) => {
      const { payload } = args;
      if (callback && (typeof callback) === 'function')
        resolve(callback(payload));
      else
        resolve(payload);
    });
    window.sendToHost('render', {
      method,
      payload,
    });
  });

Ant.makePromiseHostOnce = (method, payload, callback) =>
  new Promise((resolve, reject) => {
    window.listenToHostOnce('main', (event, args) => {
      if (callback && (typeof callback) === 'function')
        resolve(callback(args));
      else
        resolve(args);
    });
    window.sendToHost('main', {
      method,
      payload,
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

  async addNewTarget(path, ws) {
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

    await this.enableEmulation(target);

    const tinyModel = new Ant.TinyModel(target);

    this._targets.set(path, { target, model: tinyModel });
    this.setCurrent(path);

    return { target, model: tinyModel };
  }

  async enableEmulation(target) {
    const { width, height } = await Ant.makePromiseHostOnce('getWebviewWidthHeight');
    const pageAgent = target.pageAgent();
    await pageAgent.enable();
    const emulationAgent = target.emulationAgent();
    emulationAgent.setTouchEmulationEnabled(true, 'mobile');

    // so sad, we have to try again to override.
    await emulationAgent.setDeviceMetricsOverride(width, height + 1, 0, true, false);
    emulationAgent.setDeviceMetricsOverride(width, height, 0, true, false);
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
    await Ant.targetManager.addNewTarget(path, ws);
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
