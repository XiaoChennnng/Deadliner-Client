const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // 禁用 ForkTsCheckerWebpackPlugin 以节省内存
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ForkTsCheckerWebpackPlugin'
      );

      // 禁用 ESLintWebpackPlugin 以节省内存
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ESLintWebpackPlugin'
      );

      return webpackConfig;
    },
  },
};
