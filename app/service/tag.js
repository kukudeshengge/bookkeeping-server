'use strict';

const Service = require('egg').Service;

class TagService extends Service {

  async list() {
    return await this.app.mysql.select('tag');
  }
}

module.exports = TagService;
