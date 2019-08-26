import React from 'react';

import Layout from './layout';
import GitHubButton from './providers/github';

const LoginButton = (props) => {
  const { type, name, url } = props;

  if (type === 'github') {
    return <GitHubButton name={name} url={url} />;
  }

  return <div />;
};

const AuthorizationPage = (props) => {
  const { providerInfos } = props;
  return <Layout>
    <section className="tc">
      <h1 className="f1 helvetica">Log in</h1>
      {providerInfos.map(p => (<LoginButton key={p.id} {...p} />))}
    </section>
  </Layout>;
};

export default AuthorizationPage;
