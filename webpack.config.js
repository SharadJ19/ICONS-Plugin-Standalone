
    const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

    module.exports = withModuleFederationPlugin({
    
      name: 'icons-plugin-standalone',
    
      exposes: {
        './AppModule': './src/app/app.module.ts'
      },
    
      shared: {
        ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
      },
    });
