/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1666254646141_5386';

  // add your middleware config here
  config.middleware = [ 'authentication' ];
  config.authentication = {
    enable: true,
    whiteList: [ '/user/login', '/user/registry' ],
  };

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  config.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: 'localhost',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: 'admin123',
      // 数据库名
      database: 'data_base',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };
  config.security = {
    csrf: {
      enable: false,
    },
  };
  config.jwt = {
    secret: 'Nick',
  };
  config.multipart = {
    mode: 'file'
  };
  config.uploadImageDir = '/Users/node/bookkeeping-server/app/public';
  return {
    ...config,
    ...userConfig,
  };
};
