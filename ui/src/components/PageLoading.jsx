import React from 'react';
import Spinner from './Spinner';

const PageLoading = ({ text }) => {
  return (
    <div className="page-content page-full page-spinner">
      <Spinner text={text} />
    </div>
  );
};

export default PageLoading;
