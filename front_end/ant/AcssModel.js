Ant.AcssModel = class extends SDK.CSSModel {
  constructor(target) {
    super(target);
    this._agent = target.cssAgent();
  }
};