import React from 'react';

class ErrorPage extends React.Component {
  render() {
    const { error } = this.props;
    return <div>{error}</div>;
  }
}

export default ErrorPage;
