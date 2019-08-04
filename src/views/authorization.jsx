import React from 'react';

class AuthorizationPage extends React.Component {
  render() {
    const { providerInfos } = this.props;
    return <div>
      <h1>Log in</h1>
      {providerInfos.map(p => (<div key={p.id}><a href={p.url}>Log in with {p.name}</a></div>))}
    </div>;
  }
}

export default AuthorizationPage;
