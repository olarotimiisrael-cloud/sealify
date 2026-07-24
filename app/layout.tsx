import React from 'react';

  const RootLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>My Application</title>
          <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        </head>
        <body>{children}</body>
      </html>
    );
  };

  export default RootLayout;