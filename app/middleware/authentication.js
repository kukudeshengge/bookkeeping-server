'use strict';
const url = require('url');
const { createSuccessResponse } = require('../utils/createResponse');

// 鉴权
module.exports = options => {
  return async function jwt(ctx, next) {
    if (options.enable === false) {
      await next();
      return;
    }
    const requestPath = url.parse(ctx.request.url);
    if (options.whiteList.includes(requestPath.pathname)) {
      await next();
      return;
    }
    const token = ctx.request.headers.authorization;
    try {
      ctx.app.jwt.verify(token, ctx.app.config.jwt.secret);
      await next();
    } catch (err) {
      ctx.status = 200;
      ctx.body = createSuccessResponse(null, 'token验证失败', 401);
    }
  };
};
