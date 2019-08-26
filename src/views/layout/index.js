import React from 'react';

const Layout = props => (
  <html>
    <head>
      <title>{props.title}</title>
      <link rel="stylesheet" href="/css/tachyons.min.css" />
    </head>
    <body>
      <main className="w-100 bg-white">
        {props.children}
      </main>
    </body>
  </html>
);

export default Layout;
