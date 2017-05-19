Ant.AcssModel = class extends SDK.CSSModel {
  constructor(target) {
    super(target);
    this._domModel = /** @type {!Ant.TinyModel} */ (target.model(Ant.TinyModel));

    this._agent = target.acssAgent();
  }

  matchedStylesPromise(nodeId) {
    /**
     * @param {?Protocol.Error} error
     * @param {?Protocol.CSS.CSSStyle=} inlinePayload
     * @param {?Protocol.CSS.CSSStyle=} attributesPayload
     * @param {!Array.<!Protocol.CSS.RuleMatch>=} matchedPayload
     * @param {!Array.<!Protocol.CSS.PseudoElementMatches>=} pseudoPayload
     * @param {!Array.<!Protocol.CSS.InheritedStyleEntry>=} inheritedPayload
     * @param {!Array.<!Protocol.CSS.CSSKeyframesRule>=} animationsPayload
     * @return {?SDK.CSSMatchedStyles}
     * @this {SDK.CSSModel}
     */
    const self = this;

    function callback(
      error, inlinePayload, attributesPayload, matchedPayload, pseudoPayload, inheritedPayload, animationsPayload) {
      if (error)
        return null;

      var node = self._domModel.nodeForId(nodeId);
      if (!node)
        return null;

      return new SDK.CSSMatchedStyles(
        this, node, inlinePayload || null, attributesPayload || null, matchedPayload || [], pseudoPayload || [],
        inheritedPayload || [], animationsPayload || []);
    }

    return new Promise((resolve, reject) => {
      window.sendToHost('render', {
        method: 'styleOnce',
        payload: {
          nodeId,
        }
      });
      window.listenToHostOnce('render-styleOnce', (event, args) => {
        const { inlineStyle, matchedStyle } = args.payload;
        resolve(callback(null, inlineStyle, null, matchedStyle));
      });
    });
  }

  inlineStylesPromise(nodeId) {
    /**
     * @param {?Protocol.Error} error
     * @param {?Protocol.CSS.CSSStyle=} inlinePayload
     * @param {?Protocol.CSS.CSSStyle=} attributesStylePayload
     * @return {?SDK.CSSModel.InlineStyleResult}
     * @this {SDK.CSSModel}
     */
    function callback(error, inlinePayload) {
      if (error || !inlinePayload)
        return null;
      var inlineStyle = inlinePayload ?
          new SDK.CSSStyleDeclaration(this, null, inlinePayload, SDK.CSSStyleDeclaration.Type.Inline) :
          null;
      return new SDK.CSSModel.InlineStyleResult(inlineStyle, null);
    }

    return new Promise((resolve, reject) => {
      window.sendToHost('render', {
        method: 'inlineStyleOnce',
        payload: {
          nodeId,
        }
      });
      window.listenToHostOnce('render-inlineStyleOnce', (event, args) => {
        const { payload } = args;
        resolve(callback(null, payload));
      });
    });
  }
};

SDK.SDKModel.register(Ant.AcssModel, SDK.Target.Capability.DOM, true);
