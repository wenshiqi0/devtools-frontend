Ant.TinyConnection = class {
  constructor(target, dispatcher) {
    this._target = target;

    this._agent = target.tinyAgent();
    this._dispatcher = dispatcher;

    window.listenToHost('render', (event, args) => {
      const messageObject = args;

      this._dispatcher[messageObject.method](messageObject);
    });
  }
}