'use strict';

const { Controller } = require('egg');
const utility = require('utility');
const { createErrorResponse, createSuccessResponse } = require(
  '../utils/createResponse');
const default_signature = '生而平凡';
const default_avatar = 'https://img1.baidu.com/it/u=1244677718,3581533383&fm=253&fmt=auto&app=138&f=PNG?w=500&h=546';

class HomeController extends Controller {
  // 注册
  async registry() {
    const { ctx } = this;
    try {
      const { user_name, password, signature, avatar } = ctx.request.body;
      if (!user_name || !password) {
        ctx.body = {
          code: 500,
          message: '账号或密码不能为空',
          data: null,
        };
        return;
      }
      const user_info = await ctx.service.user.get({ user_name });
      if (user_info) {
        ctx.body = {
          code: 500,
          message: '用户名已存在',
          data: null,
        };
        return;
      }
      await ctx.service.user.insert({
        user_name,
        password: utility.md5(password),
        signature: signature || default_signature,
        avatar: avatar || default_avatar,
        create_time: Date.now(),
      });
      ctx.body = {
        code: 200,
        message: '成功',
        data: null,
      };
    } catch (err) {
      console.log(err);
      ctx.body = {
        code: 500,
        message: '系统异常',
        data: null,
      };
    }
  }

  // 登录
  async login() {
    const { ctx, app } = this;
    const { user_name, password } = ctx.request.body;
    try {
      const userInfo = await ctx.service.user.get({ user_name });
      if (!userInfo) {
        ctx.body = createErrorResponse(500, '用户不存在');
        return;
      }
      if (userInfo.password !== password) {
        ctx.body = createErrorResponse(500, '密码不正确');
        return;
      }
      const token = app.jwt.sign({
        id: userInfo.id,
        user_name: userInfo.user_name,
        exp: Math.floor(Date.now() / 1000 + (24 * 60 * 60 * 365)),
      }, app.config.jwt.secret);
      ctx.body = createSuccessResponse({ token });
    } catch (err) {
      this.logger.error(err);
      ctx.body = createErrorResponse();
    }
  }

  // 获取用户信息
  async getUserInfo() {
    const { ctx, app } = this;
    try {
      const token = ctx.request.headers.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      const userInfo = await ctx.service.user.get({ id: decode.id });
      ctx.body = {
        code: 200,
        message: '请求成功',
        data: userInfo,
      };
    } catch (err) {
      ctx.body = {
        code: 500,
        message: '系统异常',
        data: null,
      };
    }
  }

  // 更新用户信息
  async updateUserInfo() {
    const { ctx, app } = this;
    try {
      const body = ctx.request.body;
      const token = ctx.request.headers.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      const data = JSON.parse(JSON.stringify({
        signature: body.signature,
        avatar: body.avatar,
        id: decode.id,
      }));

      await ctx.service.user.update(data);
      ctx.body = {
        code: 200,
        message: '更新成功',
        data: null,
      };
    } catch (err) {
      console.log(err);
      ctx.body = {
        code: 500,
        message: '系统异常',
        data: null,
      };
    }
  }

  // 重置密码
  async resetPassword() {
    const { ctx, app } = this;
    const { old_pass, new_pass, confirm_newpass } = ctx.request.body;
    try {
      if (new_pass !== confirm_newpass) {
        ctx.body = createErrorResponse(500, '新密码与确认密码不一致');
        return;
      }
      const token = ctx.request.headers.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      const userInfo = await ctx.service.user.get({ id: decode.id });
      if (old_pass !== userInfo.password) {
        ctx.body = createErrorResponse(500, '原密码错误');
        return;
      }
      if (new_pass === userInfo.password) {
        ctx.body = createErrorResponse(500, '新密码与旧密码不能一致');
        return;
      }
      await ctx.service.user.update({
        password: new_pass,
        id: decode.id,
      });
      ctx.body = createSuccessResponse();
    } catch (err) {
      this.logger.error(err);
      ctx.body = createErrorResponse();
    }
  }
}

module.exports = HomeController;
