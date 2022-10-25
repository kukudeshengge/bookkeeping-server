'use strict';

const moment = require('moment');
const path = require('path');
const fs = require('fs');
const { Controller } = require('egg');
const { createErrorResponse } = require('../utils/createResponse');

class UploadController extends Controller {
  async upload() {
    const { ctx } = this;
    const files = ctx.request.files;
    if (!files) {
      this.ctx.body = createErrorResponse(500, 'file不能为空');
      return;
    }
    try {
      const { filepath, filename } = files[0];
      const day = moment(new Date()).format('YYYY-MM-DD');
      const dir = path.join(this.config.uploadImageDir, day);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      const name = Date.now() + path.extname(filename);
      const fileContent = fs.readFileSync(filepath);
      const targetFilePath = path.join(dir, name);
      fs.writeFileSync(targetFilePath, fileContent);
      ctx.body = {
        code: 200,
        message: '上传成功',
        data: `/public/${day}/${name}`,
      };
    } catch (err) {
      this.logger.error(err);
      ctx.body = {
        code: 500,
        message: '系统异常',
        data: null,
      };
    } finally {
      await ctx.cleanupRequestFiles();
    }
  }
}

module.exports = UploadController;
