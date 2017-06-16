import { ReactRenderer, Helpers } from './types';

const getData = require('./getData');
const getTinyData = require('./getTinyData');

let nodeId = 1;
let reactRootElement = null;
let elementMapping = null;

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
    const root = reactRootElement;
    const map = new WeakMap();

    if (root) {
      makeMapping(map, root);
      return map;
    }

    return false;
  };

  // 这里是根据compoennt的props来生成树的
  // 由于component不含有任何的react runtime api，所以我们需要上面的映射
  extras.rebuildTinyTree = function (ids, mapping) {
    const root = reactRootElement;
    const tree = [];

    if (root) {
      scanNode.bind({ mapping })(tree, root._currentElement.props.children, ids, [0]);
      return tree;
    }

    return false;
  };

  // 这个函数用于找到 page 的 dom
  extras.initRoots = function initRoots() {
    const roots = renderer.Mount._instancesByReactRootID;
    nodeId = 1;
    for (let i in roots) {
      const root = roots[i];
      if (root && root._hostContainerInfo && root._hostContainerInfo._node) {
        if (root._hostContainerInfo._node.id === '__react-content') {
          if (root._renderedComponent && root._renderedComponent._renderedComponent)
            reactRootElement = root._renderedComponent._renderedComponent;
        }
      }
    }
  }

  return extras;
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
  elementMapping = map;
}

// 遍历component的props.children，生成实际显示的dom tree
function scanNode(tree, element, ids, guids) {
  const data = getTinyData(element, elementMapping);
  if (!data) return;
  const length = guids.length;

  const node = newNode({
    name: data.name,
    props: data.props,
    nodeType: 1,
    nodeValue: '',
  })

  if (node.localName === 'root-wrapper') {
    const realReactElement = data.real;
    const reactRootElement = realReactElement._renderedComponent._currentElement;
    scanNode(tree, reactRootElement, ids, guids);
  } else if (Array.isArray(element)) {
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

function handleTemplateTag() {

}

module.exports = attachRenderer;
