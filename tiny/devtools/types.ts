var {Record} = require('immutable');

export type Dir = 'up' | 'down' | 'left' | 'right';
export type Dest = 'firstChild' | 'lastChild' | 'prevSibling' | 'nextSibling' | 'collapse' | 'uncollapse' | 'parent' | 'parentBottom';

export type ElementID = string;

export interface Global extends Window {
  NProgress: any,
  sendToHost: Function,
  listenToHost: Function,
  callElectron: Function,
}

export type DOMNode = {
  appendChild: (child: DOMNode) => void,
  childNodes: Array<DOMNode>,
  getBoundingClientRect: () => {
    top: number,
    left: number,
    width: number,
    height: number,
    bottom: number,
    right: number,
  },
  innerHTML: string,
  innerText: string,
  nodeName: string,
  nodeType: number,
  offsetHeight: number,
  offsetLeft: number,
  offsetParent: DOMNode,
  offsetTop: number,
  offsetWidth: number,
  onclick?: (evt: DOMEvent) => void,
  parentNode: DOMNode,
  removeChild: (child: DOMNode) => void,
  removeListener: (evt: string, fn: () => void) => void,
  selectionStart: number,
  selectionEnd: number,
  scrollLeft: number,
  scrollTop: number,
  style: Object,
  textContent: string,
  value: string,
};

export type DOMEvent = {
  cancelBubble: boolean,
  key: string,
  keyCode: number,
  pageX: number,
  pageY: number,
  preventDefault: () => void,
  stopPropagation: () => void,
  target: DOMNode,
};

export type ControlState = {
  enabled: boolean,
};