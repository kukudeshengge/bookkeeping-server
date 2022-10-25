'use strict';

const Service = require('egg').Service;

class BillService extends Service {

  async list(query) {
    return await this.app.mysql.select('bill', query);
  }

  async insert(value) {
    return await this.app.mysql.insert('bill', value);
  }

  async update(value) {
    return await this.app.mysql.update('bill', value, { id: value.id });
  }

  async get(value) {
    return await this.app.mysql.get('bill', value);
  }

  async delete(value) {
    return await this.app.mysql.delete('bill', value);
  }
}

module.exports = BillService;
