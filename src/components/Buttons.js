import React from 'react';

const ArrowButtons = () => {
  const handleLeftButtonClick = () => {
    // Handle left button click
    console.log('Left button clicked');
  };

  const handleRightButtonClick = () => {
    // Handle right button click
    console.log('Right button clicked');
  };

  return (
    <div>
      <button onClick={handleLeftButtonClick}>{'<'}</button>
      <button onClick={handleRightButtonClick}>{'>'}</button>
    </div>
  );
};

export default ArrowButtons;
