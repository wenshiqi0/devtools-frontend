const normalize = (children) => {
  if (Array.isArray(children)) {
    return children;
  }
  return [children];
};

export default (element) => {
  const props = {};
  if (!element || !element.props) return element;
  const name = element.props.$tag;
  const children = normalize(element.props.children);
  Object.keys(element.props).forEach((prop) => {
    if (!(typeof element.props[prop] === 'function' || prop === 'children' || prop === '$tag')) {
      props[prop] = element.props[prop];
    }
  });

  return {
    name,
    props,
    children,
  };
};
