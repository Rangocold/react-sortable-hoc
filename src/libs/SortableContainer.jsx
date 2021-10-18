/* eslint-disable */
import React, {
  useCallback,
  useEffect,
  useRef,
  createContext,
  useState,
} from 'react';
import {
  closest,
  getEdgeOffset,
  setInlineStyles,
  cloneNode,
  getPosition,
  setTranslate3d,
  setTransitionDuration,
} from './utils';

const defaultDuration = 300;

export const RefsContext = createContext({
  refs: [],
  containerRef: null,
});

//et isDragging = false;

export default function SortableContainer(props) {
  const { children } = props;
  const refs = useRef([]);
  const [newIndex, setNewIndex] = useState(NaN);
  const dragHelper = useRef(null);
  const containerRef = useRef(null);
  const [draggedIndex, setDraggedIndex] = useState(NaN);
  const [initialOffset, setInitialOffset] = useState();
  const [isDragging, setIsDragging] = useState(false);

  const onTouchStart = useCallback(
    (e) => {
      setInitialOffset(getPosition(e));
      setIsDragging(true);
      //isDragging = true;
      // TODO 用e.target计算index
      const draggedNode = closest(e.target, (el) => el.sortableInfo);

      if (draggedNode) {
        setDraggedIndex(draggedNode.sortableInfo.index);

        setInlineStyles(refs.current[draggedNode.sortableInfo.index].node, {
          visibility: 'hidden',
        });

        if (!draggedNode.absoluteOffset) {
          draggedNode.absoluteOffset = getEdgeOffset(
            draggedNode,
            containerRef.current
          );
        }

        dragHelper.current = document.body.appendChild(cloneNode(draggedNode));
        setTransitionDuration(dragHelper.current, defaultDuration);
        setInlineStyles(dragHelper.current, {
          visibility: 'visible',
          zIndex: 1000,
          boxSizing: 'border-box',
          position: 'fixed',
          pointerEvents: 'none',
          width: `${draggedNode.getBoundingClientRect().width}px`,
          height: `${draggedNode.getBoundingClientRect().height}px`,
          left: `${getPosition(e).x}px`,
          top: `${getPosition(e).y}px`,
        });
      }
    },
    [dragHelper, containerRef, refs]
  );
  const onTouchMove = useCallback(
    (e) => {
      if (!isDragging) {
        return;
      }
      const { x, y } = getPosition(e);
      const translate = {
        x: x - initialOffset.x,
        y: y - initialOffset.y,
      };
      setTranslate3d(dragHelper.current, translate);

      const draggedNode = refs.current[draggedIndex].node;

      const sortingOffset = {
        left: draggedNode.absoluteOffset.left + translate.x,
        top: draggedNode.absoluteOffset.top + translate.y,
      };

      // TODO 去算哪些node要动
      for (let i = 0; i < refs.current.length; ++i) {
        const node = refs.current[i].node;
        if (!node.absoluteOffset) {
          node.absoluteOffset = getEdgeOffset(node, containerRef.current);
        }
        const width = node.offsetWidth;
        const height = node.offsetHeight;
        const offset = {
          height:
            draggedNode.offsetHeight > height
              ? height / 2
              : draggedNode.offsetHeight / 2,
          width:
            draggedNode.offsetWidth > width
              ? width / 2
              : draggedNode.offsetWidth / 2,
        };

        const translate = { x: 0, y: 0 };
        const nextNode =
          i < refs.current.length - 1 && refs.current[i + 1].node;
        const prevNode = i > 0 && refs.current[i - 1].node;
        if (
          i < draggedIndex &&
          ((sortingOffset.left <= node.absoluteOffset.left &&
            sortingOffset.top <= node.absoluteOffset.top + offset.height) ||
            sortingOffset.top + offset.height <= node.absoluteOffset.top)
        ) {
          translate.x = draggedNode.offsetWidth;
          if (
            node.absoluteOffset.left + translate.x >
            containerRef.current.getBoundingClientRect().width -
              offset.width * 2
          ) {
            if (nextNode) {
              translate.x =
                getEdgeOffset(nextNode, containerRef.current).left -
                node.absoluteOffset.left;
              translate.y =
                getEdgeOffset(nextNode, containerRef.current).top -
                node.absoluteOffset.top;
            }
          }
          setNewIndex(i);
        } else if (
          i > draggedIndex &&
          ((sortingOffset.left + offset.width >= node.absoluteOffset.left &&
            sortingOffset.top + offset.height >= node.absoluteOffset.top) ||
            sortingOffset.top + offset.height >=
              node.absoluteOffset.top + height)
        ) {
          // If the current node is to the right on the same row, or below the node that's being dragged
          // then move it to the left
          translate.x = -draggedNode.offsetWidth;
          if (
            node.absoluteOffset.left + translate.x <
            containerRef.current.getBoundingClientRect().left + offset.width
          ) {
            // If it moves passed the left bounds, then animate it to the last position of the previous row.
            // We just use the offset of the previous node to calculate where to move, because that node's original position
            // is exactly where we want to go
            if (prevNode) {
              translate.x =
                getEdgeOffset(prevNode, containerRef.current).left -
                node.absoluteOffset.left;
              translate.y =
                getEdgeOffset(prevNode, containerRef.current).top -
                node.absoluteOffset.top;
            }
          }
          setNewIndex(i);
        }

        setTranslate3d(node, translate);
        refs.current[i].translate = translate;
      }
    },
    [isDragging, containerRef, refs, dragHelper]
  );
  const onTouchEnd = useCallback(() => {
    setIsDragging(false);
    document.body.removeChild(dragHelper.current);
    setInlineStyles(refs.current[draggedIndex].node, {
      opacity: '',
      visibility: '',
    });
    props.onSortEnd && props.onSortEnd({ oldIndex: draggedIndex, newIndex });
    dragHelper.current = null;
    setNewIndex(NaN);

    for (let i = 0, len = refs.current.length; i < len; i++) {
      const node = refs.current[i];
      const el = node.node;

      // Clear the cached offset/boundingClientRect
      node.absoluteOffset = null;

      // Remove the transforms / transitions
      setTranslate3d(el, null);
      setTransitionDuration(el, null);
      node.translate = null;
    }
  }, [props, draggedIndex, newIndex, dragHelper, refs]);

  /* useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('mousedown', onTouchStart, false);
      containerRef.current.addEventListener('mousemove', onTouchMove, false);
      containerRef.current.addEventListener('mouseup', onTouchEnd, false);
    }
  }, [containerRef]); */

  /*   useEffect(() => {
    // TODO 变成绝对定位
    for (const ref of refs.current) {
      ref.absoluteOffset = getEdgeOffset(ref, containerRef.current);
    }
  }, [refs]);
 */
  return (
    <RefsContext.Provider value={{ refs, containerRef }}>
      <div
        ref={(c) => (containerRef.current = c)}
        onMouseDown={onTouchStart}
        onMouseMove={onTouchMove}
        onMouseUp={onTouchEnd}
        onmousedown={onTouchStart}
        onmousemove={onTouchMove}
        onmouseup={onTouchEnd}
      >
        {children}
      </div>
    </RefsContext.Provider>
  );
}
