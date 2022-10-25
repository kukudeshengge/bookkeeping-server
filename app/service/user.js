'use strict';

const Service = require('egg').Service;

class UserService extends Service {

  async list() {
    return await this.app.mysql.select('user');
  }

  async get(value) {
    return await this.app.mysql.get('user', value);
  }

  async insert(value) {
    return await this.app.mysql.insert('user', value);
  }

  async update(value) {
    return await this.app.mysql.update('user', value, { id: value.id });
  }
}

module.exports = UserService;
