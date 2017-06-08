import { ReactRenderer, Helpers } from './types';

const getData = require('./getData');
const getTinyData = require('./getTinyData');

let nodeId = 1;

function attachRenderer(bridge, rid: string, renderer: ReactRenderer): Helpers {
  const extras = {};

  // only support React Dom 15+
  // 由于我们不需要向下兼容，所以只需要考虑15+的api
  if (renderer.ComponentTree) {
    extras.getNativeFromReactElement = (component) => {
      return renderer.ComponentTree.getNodeFromInstance(component);
    };

    extras.getReactElementFromNative = (node) => {
      return renderer.ComponentTree.getClosestInstanceFromNode(node);
    };
  }

  // currentComponent到react dom instance的映射
  extras.mapCurrentComponentToElement = function () {
    const roots = renderer.Mount._instancesByReactRootID;
    let ret = [];
    const map = new WeakMap();
    for (const i in roots) {
      ret = initRoots(roots[i], ret);
    }
    for (const i in ret) {
      window.reactRootElement = ret[i];
      makeMapping(map, ret[i]);
    }
    return map;
  };

  // 这里是根据compoennt的props来生成树的
  // 由于component不含有任何的react runtime api，所以我们需要上面的映射
  extras.rebuildTinyTree = function (ids) {
    const roots = renderer.Mount._instancesByReactRootID;
    let ret = [];
    const tree = [];
    for (const i in roots) {
      ret = initRoots(roots[i], ret);
    }
    for (const i in ret) {
      window.reactRootElement = ret[i];
      scanNode(tree, ret[i]._currentElement.props.children, ids, [0]);
    }
    return tree;
  };

  extras.buildStylesContext = function (styleMap) {
    const $styles = document.styleSheets;
    for (let i = $styles.length - 1; i > -1; --i) {
      const rules = $styles[i].cssRules || $styles[i].rules;
      for (let j = 0; j < rules.length; ++j) {
        const styleObject = textToStyleObject(rules[j].cssText);
        styleMap[styleObject.name] = {
          style: styleObject.style,
          cssRule: rules[j],
        };
      }
    }
  };

  extras.buildElementStyles = function (styleMap, reactElements) {
    Object.keys(reactElements).forEach((key) => {
      styleMap[key] = {
        style: contentToStyleObject(reactElements[key].data.props.style || ''),
        element: reactElements[key].element,
      };
    });
  };

  return extras;
}

// 这个函数用于过滤react dom tree上面的一些无用的wrapper
function initRoots(root, ret) {
  nodeId = 1;
  if (root._renderedComponent._tag === 'div') {
    return [root._renderedComponent];
  } else {
    return initRoots(root._renderedComponent, ret);
  }
}

// 将object和string都normalize成数组的形势
const normalize = (children) => {
  if (!children) return null;
  if (Array.isArray(children)) {
    return children;
  }
  return [children];
};

// 遍历生成component -> instance的weakmap
// key: compoennt; value: instance
function makeMapping(map, element) {
  const data = getData(element);
  const normalized = normalize(data.children);
  if (normalized) {
    if (data.nodeType === 'Composite') {
      map.set(element._currentElement, element);
    }
    normalized.forEach((child) => {
      makeMapping(map, child);
    });
  }
}

// 遍历component的props.children，生成实际显示的dom tree
function scanNode(tree, element, ids, guids) {
  const data = getTinyData(element);
  if (!data) return;
  const length = guids.length;

  /*
  const node = {
    props: data.props,
    name: data.name,
    guid: guids.join('-'),
    parent: length === 0 ? null : guids.slice(0, length - 1).join('-'),
    children: [],
  };
  */

  const node = newNode({
    name: data.name,
    props: data.props,
    nodeType: 1,
    nodeValue: '',
  })

  if (Array.isArray(element)) {
    element.forEach((el, i) => {
      scanNode(tree, el, ids, guids.concat([i]));
    });
  } else if (data.children) {
    data.children.forEach((child, i) => {
      if (typeof child !== 'string') {
        scanNode(node.children, child, ids, guids.concat([i]));
      }
    });
    ids[node.nodeId] = {
      element,
      node,
    };
    const completeNode = setChildren(node, data.children);
    tree.push(completeNode);
  }
}

function newNode({ name, nodeType, nodeValue, props }) {
  const attributes = [];

  Object.keys(props || {}).forEach((key) => {
    attributes.push(key);
    attributes.push(typeof props[key] === 'string' ? props[key] : `{{${String(props[key])}}}`);
  });

  return {
    attributes,
    nodeName: ((name as string) || '').toUpperCase(),
    localName: ((name as string) || '').toLowerCase(),
    nodeType,
    nodeId: nodeId,
    backendNodeId: ++nodeId,
    nodeValue,
    children: [],
  }
}

function setChildren(node, children) {
  return Object.assign({}, node, {
    childNodeCount: children.length,
  })
}

function textToStyleObject(text) {
  const styleArray = text.split('{');
  const name = styleArray[0];
  const stylesText = styleArray[1].replace('}', '').replace(/\s*$/, '');
  const styleObject = contentToStyleObject(stylesText);
  return {
    name: name.replace(/\s*$/, ''),
    style: styleObject,
  };
}

function contentToStyleObject(stylesText) {
  if (!stylesText) return {};
  const styleObject = {};
  stylesText.split(';').forEach((style) => {
    const splitStyle = style.split(':');
    if (splitStyle.length > 1) {
      styleObject[splitStyle[0].replace(/^\s*/, '')] = splitStyle[1].replace(/^\s*/, '');
    }
  });
  return styleObject;
}

module.exports = attachRenderer;
