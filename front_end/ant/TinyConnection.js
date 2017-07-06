Ant.TinyConnection = class {
  constructor(target, dispatcher) {
    this._target = target;

    this._agent = target.tinyAgent();
    this._dispatcher = dispatcher;

    window.listenToHost('render', (event, args) => {
      const messageObject = args;
      const { method, payload } = args;
      if (extraMessageHandler[method])
        extraMessageHandler[method](payload);
      else if (this._dispatcher[messageObject.method])
        this._dispatcher[messageObject.method](messageObject);
    });

    const extraMessageHandler = {
      switchTarget: () => {
        Ant.targetManager.switchTarget();
      },
      propsModified: ({ nodeId, props }) => {
        if (nodeId)
          Ant.targetManager.getCurrentModel().propsModified(nodeId, props);
      }
    };
  }
};
