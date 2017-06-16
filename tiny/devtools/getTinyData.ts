const normalize = (children) => {
  if (Array.isArray(children)) {
    return children;
  }
  return [children];
};

export default (element, mapping) => {
  const props = {};
  if (!element || !element.props) return element;
  let name = element.props.$tag;
  let realReactElement = mapping.get(element);
  const children = normalize(element.props.children);
  Object.keys(element.props).forEach((prop) => {
    if (!(typeof element.props[prop] === 'function' || prop === 'children' || prop === '$tag')) {
      props[prop] = element.props[prop];
    }
  });

  if (!name) {
    if (realReactElement && realReactElement._renderedComponent && realReactElement._renderedComponent._renderedComponent) {
      const _currentElement = realReactElement._renderedComponent._renderedComponent._currentElement;
      if (_currentElement.ref === 'root') {
        name = 'root-wrapper';
      }
    }
  }

  return {
    name,
    props,
    children,
    real: realReactElement,
  };
};
