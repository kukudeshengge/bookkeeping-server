'use strict';

const { createErrorResponse, createSuccessResponse } = require(
  '../utils/createResponse');
const Controller = require('egg').Controller;

class TagController extends Controller {
  async list() {
    try {
      const list = await this.ctx.service.tag.list();
      this.ctx.body = createSuccessResponse(list);
    } catch (err) {
      this.logger.info(err);
      this.ctx.body = createErrorResponse();
    }
  }
}

module.exports = TagController;
