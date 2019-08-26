import React from 'react';

const ErrorPage = (props) => {
  const { error } = props;
  return <div>{error}</div>;
};

export default ErrorPage;
