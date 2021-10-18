export function arrayMove(array, from, to) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);

  return array;
}

export function setInlineStyles(node, styles) {
  Object.keys(styles).forEach((key) => {
    node.style[key] = styles[key];
  });
}

export function setTranslate3d(node, translate) {
  node.style[`transform`] =
    translate == null ? '' : `translate3d(${translate.x}px,${translate.y}px,0)`;
}

export function setTransitionDuration(node, duration) {
  node.style[`transitionDuration`] = duration == null ? '' : `${duration}ms`;
}

export function closest(el, fn) {
  while (el) {
    if (fn(el)) {
      return el;
    }

    el = el.parentNode;
  }

  return null;
}

export function limit(min, max, value) {
  return Math.max(min, Math.min(value, max));
}

function getPixelValue(stringValue) {
  if (stringValue.substr(-2) === 'px') {
    return parseFloat(stringValue);
  }

  return 0;
}

export function getElementMargin(element) {
  const style = window.getComputedStyle(element);

  return {
    bottom: getPixelValue(style.marginBottom),
    left: getPixelValue(style.marginLeft),
    right: getPixelValue(style.marginRight),
    top: getPixelValue(style.marginTop),
  };
}

export function getScrollAdjustedBoundingClientRect(node, scrollDelta) {
  // 返回元素的大小及其相对于视口的位置。
  const boundingClientRect = node.getBoundingClientRect();

  return {
    top: boundingClientRect.top + scrollDelta.top,
    left: boundingClientRect.left + scrollDelta.left,
  };
}

export function getPosition(event) {
  if (event.touches && event.touches.length) {
    return {
      x: event.touches[0].pageX,
      y: event.touches[0].pageY,
    };
  } else if (event.changedTouches && event.changedTouches.length) {
    return {
      x: event.changedTouches[0].pageX,
      y: event.changedTouches[0].pageY,
    };
  } else {
    return {
      x: event.pageX,
      y: event.pageY,
    };
  }
}

export function isTouchEvent(event) {
  return (
    (event.touches && event.touches.length) ||
    (event.changedTouches && event.changedTouches.length)
  );
}

// 转绝对定位
export function getEdgeOffset(node, parent, offset = { left: 0, top: 0 }) {
  if (!node) {
    return undefined;
  }

  // Get the actual offsetTop / offsetLeft value, no matter how deep the node is nested
  const nodeOffset = {
    left: offset.left + node.offsetLeft,
    top: offset.top + node.offsetTop,
  };

  if (node.parentNode === parent) {
    return nodeOffset;
  }

  // 递归拿left 和 top
  return getEdgeOffset(node.parentNode, parent, nodeOffset);
}

export function getTargetIndex(newIndex, prevIndex, oldIndex) {
  if (newIndex < oldIndex && newIndex > prevIndex) {
    return newIndex - 1;
  } else if (newIndex > oldIndex && newIndex < prevIndex) {
    return newIndex + 1;
  } else {
    return newIndex;
  }
}

export function cloneNode(node) {
  const clonedNode = node.cloneNode(true);
  return clonedNode;
}
