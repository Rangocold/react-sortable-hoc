/* eslint-disable */
import * as React from 'react';
import { findDOMNode } from 'react-dom';

import { getEdgeOffset, setTransitionDuration } from './utils';
import { RefsContext } from './SortableContainer';

export default function sortableElement(WrappedComponent) {
  return class WithSortableElement extends React.Component {
    static contextType = RefsContext;

    componentDidMount() {
      this.register();
    }

    componentDidUpdate(prevProps) {
      if (this.node) {
        if (prevProps.index !== this.props.index) {
          this.node.sortableInfo.index = this.props.index;
          this.unregister();
          this.register();
        }
      }
      /* 
      if (prevProps.collection !== this.props.collection) {
        this.unregister(prevProps.collection);
        this.register();
      } */
    }

    componentWillUnmount() {
      this.unregister();
    }

    register() {
      const { disabled, index } = this.props;
      const node = findDOMNode(this);
      setTransitionDuration(node, 300);
      node.sortableInfo = {
        disabled,
        index,
        refs: this.context.refs,
      };

      if (this.context.containerRef.current) {
        node.absoluteOffset = getEdgeOffset(
          node,
          this.context.containerRef.current
        );
      }

      this.node = node;
      this.ref = { node };

      this.context.refs?.current.push(this.ref);
    }

    unregister() {
      this.context.refs?.current.splice(this.index, 1);
    }

    render() {
      const { index, ..._props } = this.props;
      return <WrappedComponent {..._props} />;
    }
  };
}
