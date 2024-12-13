import PropTypes from 'prop-types';
import React from 'react';
import PageLoading from '../components/PageLoading';
import NotFound from './NotFound';

const PageNotLoaded = ({ loading }) => {
  switch (loading) {
    case 'loading':
      return <PageLoading text='' />;
    case 'notfound':
      return <NotFound />;
  }
  return <PageLoading text='' />;
};

PageNotLoaded.propTypes = {
  loading: PropTypes.string.isRequired,
};

export default PageNotLoaded;
