Ant.makeProxyPromiseOnce = (method, payload, callback) => {
  return new Promise((resolve, reject) => {
    window.sendToHost('render', {
      method,
      payload,
    });
    window.listenToHostOnce(`render-${method}`, (event, args) => {
      const { payload } = args;
      resolve(callback(payload));
    });
  });
};

const makeProxyPromiseOnce = Ant.makeProxyPromiseOnce;

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
        self, node, inlinePayload || null, attributesPayload || null, matchedPayload || [], pseudoPayload || [],
        inheritedPayload || [], animationsPayload || []);
    }
    return makeProxyPromiseOnce('styleOnce', { nodeId }, payload => callback(null, payload.inlineStyle, null, payload.matchedStyle));
  }

  inlineStylesPromise(nodeId) {
    /**
     * @param {?Protocol.Error} error
     * @param {?Protocol.CSS.CSSStyle=} inlinePayload
     * @param {?Protocol.CSS.CSSStyle=} attributesStylePayload
     * @return {?SDK.CSSModel.InlineStyleResult}
     * @this {SDK.CSSModel}
     */
    const self = this;
    function callback(error, inlinePayload) {
      if (error || !inlinePayload)
        return null;
      var inlineStyle = inlinePayload ?
          new SDK.CSSStyleDeclaration(self, null, inlinePayload, SDK.CSSStyleDeclaration.Type.Inline) :
          null;
      return new SDK.CSSModel.InlineStyleResult(inlineStyle, null);
    }
    return makeProxyPromiseOnce('inlineStyleOnce', { nodeId }, payload => callback(null, payload));
  }

  _innerSetStyleTexts(styleSheetIds, ranges, texts, majorChange) {
    const self = this;

    function callback(error, stylePayloads) {
      if (error || !stylePayloads || stylePayloads.length !== ranges.length)
        return false;

      if (majorChange)
        self._domModel.markUndoableState();
      for (var i = 0; i < ranges.length; ++i) {
        var edit = new SDK.CSSModel.Edit(styleSheetIds[i], ranges[i], texts[i], stylePayloads[i]);
        self._fireStyleSheetChanged(styleSheetIds[i], edit);
      }
      return true;
    }

    return Promise.all([])
      .then(() => {
        return makeProxyPromiseOnce('setStyleTextsOnce', {
          styleSheetIds, ranges, texts, majorChange
        }, payload => callback(null, payload));
      });
  }

  computedStylePromise(nodeId) {
    function callback(error, computedPayload) {
      if (error || !computedPayload || !computedPayload.length)
        return null;
      var result = new Map();
      for (var property of computedPayload)
        result.set(property.name, property.value);
      return result;
    }
    return makeProxyPromiseOnce('computedStyleOnce', { nodeId }, payload => callback(null, payload));
  }

  getStyleSheetText(styleSheetId) {
    return makeProxyPromiseOnce('getStyleSheetTextOnce', { styleSheetId }, payload => payload);
  }
};

class SheetHeader {
  constructor(model) {
    this._model = model;
  }

  resourceURL() {
    return 'style.source';
  }

  cssModel() {
    return this._model;
  }
}

SDK.SDKModel.register(Ant.AcssModel, SDK.Target.Capability.DOM, true);
