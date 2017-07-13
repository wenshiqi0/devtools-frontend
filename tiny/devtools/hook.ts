import { ipcRenderer as ipc } from 'electron';
import installGlobalReactHook from './installReactHook';
import componentsMap from './componentsMap.json';

const getData = require('./getData');

installGlobalReactHook();

// check devicePixelRatio
console.log('devicePixelRatio', window.devicePixelRatio);

const disposes = [];

window.ipc = ipc;

let container;
const rootNodeIDMap = new Map()

let updateQueue = [];

// We can not get styles form the context of react component.
// So we make it by ourselves.
const nodeIdForDom = new Map();
const appxForNodeId = new Map();

// React devtools gloabl hook.
// The hook is setupped before the <head> dom ready,
// so it can not be install here.
// See installReactHook.js.
const globalHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

globalHook.on('root', (renderer, internalInstance) => {
});
globalHook.on('unmount', ({ internalInstance }) => {
});
globalHook.on('mount', ({ internalInstance, data }) => {
});
globalHook.on('update', ({ internalInstance, data }) => {
  if (data.props && data.props.$tag && data.nodeType === 'Composite') {
    if (data.props.$tag === 'image' && !data.props.src) return;

    const oldProps = rootNodeIDMap.get(internalInstance);
    let nodeId = appxForNodeId.get(internalInstance);

    // while nodeId is not found, maybe it is the owner of this instance.
    // so we get out of this intance to check once more.
    if (!nodeId)
      nodeId = appxForNodeId.get(internalInstance._currentElement);
    // or maybe a child
    if (!nodeId)
      nodeId = appxForNodeId.get(internalInstance._renderedComponent);
    // or maybe a parent
    if (!nodeId) {
      nodeId = appxForNodeId.get(internalInstance._currentElement._owner);

    if (nodeId) {
      if (!oldProps) {
        sendMessage({
          method: 'propsModified',
          payload: {
            nodeId,
            props: filterProps(data.props.$tag, data.props),
          },
        });
      } else {
        for (const key of Object.keys(oldProps)) {
          if (oldProps[key] !== data.props[key]) {
            sendMessage({
              method: 'propsModified',
              payload: {
                nodeId,
                props: filterProps(data.props.$tag, data.props),
              },
            });
            break;
          }
        }
      }
    }
    rootNodeIDMap.set(internalInstance, data.props);
  }
});

function decorateResult(obj, attr, fn) {
  var old = obj[attr];
  obj[attr] = function (instance: NodeLike) {
    var res = old.apply(this, arguments);
    fn(res);
    return res;
  };
  return old;
}

function decorate(obj, attr, fn) {
  var old = obj[attr];
  obj[attr] = function (instance: NodeLike) {
    var res = old.apply(this, arguments);
    fn.apply(this, arguments);
    return res;
  };
  return old;
}

function decorateMany(source, fns) {
  var olds = {};
  for (var name in fns) {
    olds[name] = decorate(source, name, fns[name]);
  }
  return olds;
}

function setupBackend(hook) {
  if (Object.keys(hook._renderers).length !== 2) {
    setTimeout(() => {
      setupBackend(hook);
    }, 500);
  } else {
    for (var rid in hook._renderers) {
      const renderer = hook._renderers[rid];
      decorateResult(renderer.Mount, '_renderNewRootComponent', (internalInstance) => {
        hook.emit('root', { renderer: rid, internalInstance });
      });
      decorateMany(renderer.Reconciler, {
        mountComponent(internalInstance, rootID, transaction, context) {
          var data = getData(internalInstance);
          rootNodeIDMap.set(internalInstance, data.props);
          hook.emit('mount', { internalInstance, data, renderer: rid });
        },
        performUpdateIfNecessary(internalInstance, nextChild, transaction, context) {
          hook.emit('update', { internalInstance, data: getData(internalInstance), renderer: rid });
        },
        receiveComponent(internalInstance, nextChild, transaction, context) {
          hook.emit('update', { internalInstance, data: getData(internalInstance), renderer: rid });
        },
        unmountComponent(internalInstance) {
          hook.emit('unmount', { internalInstance, renderer: rid });
        },
      });
    }
  }
}

function findOwner(element) {
  if (element.props['$tag']) {
    return element;
  }
  return findOwner(element._owner._currentElement);
}

function handleTinyElemets(dom, getReactElementFromNative) {
  try {
    const reactComponent = getReactElementFromNative(dom);
    let element = reactComponent._currentElement;
    let tag = element.props['$tag'];
    if (element && element.props && tag) return element;
    return findOwner(element);
  } catch (e) {
    throw new Error(e);
  }
}

function handleStringChildren(children) {
  if (!children) return '';
  if (typeof children === 'string')
    return children;
  if (Array.isArray(children) && typeof children[0] === 'string')
    return children.join('');
}

function getTinyData(element) {
  const name = element.props['$tag'];

  if (name === 'image')
    element = element._owner._currentElement._owner._currentElement;

  const props = getProps(element);
  if (!props) return null;

  // 这里需要特殊处理一些 DOM.Node 上面的数据从而使的该节点下面的 child 不被暴露出来
  switch (name) {
    case 'view':
    case 'scroll-view':
    case 'label':
    case 'navigator':
    case 'picker-view':
    case 'picker':
    case 'form':
    case 'radio-group':
    case 'checkbox-group':
    case 'swiper':
      break;
    case 'text':
    case 'button':
      props['_childNodeCount'] = 1;
      props['_textValue'] = handleStringChildren(element.props.children);
      break;
    default:
      props['_childNodeCount'] = 0;
      props['_childNodeValue'] = handleStringChildren(element.props.children);
      break;
  }

  return {
    name,
    props,
  };
};

function filterProps(name, props, noText) {
  const filteredProps = {};
  const allProps = componentsMap[name];
  Object.keys((allProps && allProps.attributions) || []).forEach((index) => {
    const prop = allProps.attributions[index];
    const propKey = (prop.label || '').replace(/\-([a-z])/g, (all, letter) => {
      return letter.toUpperCase();
    })
    if (props[propKey] || props[propKey] !== 'none' || props[propKey] !== false)
      filteredProps[propKey] = props[propKey];
  });

  ['className'].forEach(prop => {
    if (props[prop] && props[prop] !== 'none' && props[prop].trim() !== `a-${name}`)
      filteredProps[prop] = props[prop].replace(`a-${name}`, '').trim();
  });

  if (!noText)
    filteredProps._textChildren = typeof props.children === 'string' ? props.children : '';

  return filteredProps;
}

function getProps(element) {
  const name = element.props['$tag'];
  if (!element || !name) throw new Error('devtools: getProps not found the $tag from', element);
  const allProps = componentsMap[name];
  const props = filterProps(name, element.props);

  try {
    const ariaProps = element.props.$appx.getAriaProps();
    Object.keys(ariaProps).forEach(key => {
      if (key.match(/^aria/))
        props[`${key}`] = ariaProps[key];
      else
        props[`aria-${key}`] = ariaProps[key];
    });
  } catch (e) {}
  return props;
}

const sendMessage = ({ method, payload }) => {
  ipc.sendToHost('devtools', {
    method, payload,
  })
}

function fetchRemoteUrl(callback) {
  const port = 9224;
  const request = new Request(`http://127.0.0.1:${port}/json/list`);
  const path = window.$page.getPagePath();
  fetch(request)
    .then(res => res.json()
      .then(body => {
        const remoteInfo = body.find(item => item.url.indexOf(path) > -1);
        callback({ path, ws: remoteInfo.webSocketDebuggerUrl });
      })
      .catch(e => {
        console.error(e);
        callback({});
      })
}

function mappingDomToNodeId(root, dom) {
  nodeIdForDom.set(root.nodeId, dom);
  if (root.children && root.children.length > 0) {
    root.children.forEach((next, index) => {
      mappingDomToNodeId(next, dom.children[index]);
    })
  }
}

function getInternalInstance(element) {
  return element._owner._instance._reactInternalInstance;
}

function mappingDomToNodeIdChildren(parent, children, getReactElementFromNative, nodeType) {
  if (!parent) return;
  const reactComponents = [];
  if (nodeType === 'swiper') {
    parent = parent.children[0].children[0];
  }
  if (nodeType === 'picker-view-column') {
    parent = parent.children[2];
  }
  if (children && children.length > 0) {
    children.forEach((next, index) => {
      reactComponents.push('');
      nodeIdForDom.set(next.nodeId, parent.children[index]);
      if (nodeType === 'swiper') return reactComponents;
      try {
        const reactComponent = handleTinyElemets(parent.children[index], getReactElementFromNative);
        appxForNodeId.set(getInternalInstance(reactComponent), next.nodeId);
        reactComponents[reactComponents.length - 1] = getTinyData(reactComponent);
      } catch (e) { /* console.log(e); */ }
    });
  }
  return reactComponents;
}

function detectGetReactElementFromNative(dom) {
  for (const rid in globalHook._renderers) {
    const render = globalHook._renderers[rid];
    let reactComponent = null;
    try {
      reactComponent = render.ComponentTree.getClosestInstanceFromNode(dom);
    } catch (e) { console.error('detect', e); }
    if (reactComponent) {
      return {
        getReactElementFromNative: render.ComponentTree.getClosestInstanceFromNode,
        rootReactDom: reactComponent,
      }
    }
  }
}

const messageHandler = {
  initOnce: () => {
    fetchRemoteUrl((payload) => {
      sendMessage({
        method: 'initOnce',
        payload,
      });
    })
  },
  refresh: () => {
    sendMessage({ method: 'switchTarget' });
  },
  setDocumentNodeIdOnce: ({ root }) => {
    const rootDom = document.getElementById('__react-content');
    const { rootReactDom } = detectGetReactElementFromNative(rootDom.children[0].children[0]);
    nodeIdForDom.set(root.nodeId, rootDom.children[0].children[0]);
    updateQueue = [];
    sendMessage({
      method: 'setDocumentNodeIdOnce',
      payload: {
        data: getTinyData(rootReactDom._currentElement._owner._currentElement),
      },
    })
  },
  setChildNodeIdOnce: ({ parentId, payloads, nodeType }) => {
    let reactComponents = null;
    const realDom = nodeIdForDom.get(parentId);
    const rootDom = document.getElementById('__react-content');
    const { getReactElementFromNative } = detectGetReactElementFromNative(realDom || rootDom.children[0].children[0]);
    if (getReactElementFromNative) {
      if (nodeIdForDom.size === 0 || !realDom) {
        nodeIdForDom.set(parentId, rootDom.children[0].children[0]);
        reactComponents = mappingDomToNodeIdChildren(rootDom.children[0].children[0], payloads, getReactElementFromNative);
      } else {
        reactComponents = mappingDomToNodeIdChildren(realDom, payloads, getReactElementFromNative, nodeType);
      }
    }
    sendMessage({
      method: 'setChildNodeIdOnce',
      payload: {
        data: reactComponents,
      },
    })
  }
};

// handle all messages from devtools
ipc.on('devtools', (event, args) => {
  const { method, payload } = args;
  if (messageHandler[method]) {
    messageHandler[method](payload);
  } else {
    throw new Error(`Error: method ${method} is not defined`);
  }
});

setupBackend(globalHook);
