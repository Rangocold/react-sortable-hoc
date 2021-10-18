import React, { useState } from 'react';
import SortableContainer from './libs/SortableContainer';
import SortableElement from './libs/SortableElement';

const data = ['aaa', 'bbb', 'ccc', 'ddd', 'eee', 'fff', 'ggg']

function arrayMove(array, from, to) {
  array = array.slice();
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);

  return array;
}

const TagItem = SortableElement(({ text, index }) => {
  return (
      <div style={{ width: '100px', height: '100px', textAlign: 'center', lineHeight: '100px', border: '1px solid #000000' }}>{`${text}`}</div>
  );
});

function App() {
  const [array, setArray] = useState(data);
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const new_items = arrayMove(array, oldIndex, newIndex);
    setArray(new_items);
  };
  return (
    <div>
      <SortableContainer
        items={array}
        onSortEnd={onSortEnd}
      >
        <div style={{ display: 'flex', flexDirection: 'row', width: '350px', height: '400px', flexWrap: 'wrap' }}>
          {array.map((text, index) => {
            return (
              <TagItem
                text={text}
                index={index}
              />
            );
          })}
        </div>
      </SortableContainer>
    </div>
  );
}

export default App;
