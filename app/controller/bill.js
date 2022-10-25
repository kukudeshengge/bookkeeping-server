'use strict';

const Controller = require('egg').Controller;
const { createErrorResponse, createSuccessResponse } = require(
  '../utils/createResponse');
const { calculateAdd } = require('../utils/calculate');
const moment = require('moment');

class BillController extends Controller {
  async add() {
    try {
      const body = this.ctx.request.body || {};
      if (!(body.pay_type || body.amount || body.date || body.type_id)) {
        this.ctx.body = createErrorResponse(500, '参数有误');
        return;
      }
      if (Number(body.amount) <= 0) {
        this.ctx.body = createErrorResponse(500, '参数有误');
        return;
      }
      const tagList = await this.ctx.service.tag.list();
      const type_name = tagList.find(
        item => item.id === body.type_id)?.name;
      if (!type_name) {
        this.ctx.body = createSuccessResponse(200, 'type_id没有匹配项');
        return;
      }
      const token = this.ctx.request.headers.authorization;
      const decode = this.app.jwt.verify(token,
        this.app.config.jwt.secret);
      await this.ctx.service.bill.insert({
        pay_type: body.pay_type,
        amount: body.amount,
        date: body.date,
        type_id: body.type_id,
        type_name,
        remark: body.remark || '',
        user_id: decode.id,
      });
      this.ctx.body = createSuccessResponse();
    } catch (err) {
      this.logger.info(err);
      this.ctx.body = createErrorResponse();
    }
  }

  async list() {
    try {
      const {
        page = 1,
        pageSize = 10,
        date: filter_date,
        type_id,
      } = this.ctx.request.query;
      const token = this.ctx.request.headers.authorization;
      const decode = this.app.jwt.verify(token, this.app.config.jwt.secret);
      const mineList = await this.ctx.service.bill.list({
        where: { user_id: decode.id },
        orders: [['date', 'desc']],
      });
      let result = [];
      if (type_id === 'all') {
        result = mineList.filter(
          item => moment(new Date(+item.date)).format('YYYY') === filter_date);
      } else {
        result = mineList.filter(
          item => moment(new Date(+item.date)).format('YYYY') === filter_date &&
            item.type_id == type_id);
      }
      const pageList = result.slice((page - 1) * pageSize, page * pageSize);
      const dateList = [];
      pageList.forEach(item => {
        const date = moment(new Date(+item.date)).format('YYYY-MM');
        if (!dateList.includes(date)) dateList.push(date);
      });

      const billList = dateList.map(item => {
        return {
          date: item,
          bills: pageList.filter(
            value => moment(new Date(+value.date)).format('YYYY-MM') === item),
          expenseMoney: calculateAdd(pageList, 'amount', value => {
            return moment(new Date(+value.date)).format('YYYY-MM') === item &&
              value.pay_type === '1';
          }),
          incomeMoney: calculateAdd(pageList, 'amount', value => {
            return moment(new Date(+value.date)).format('YYYY-MM') === item &&
              value.pay_type === '2';
          }),
        };
      });
      this.ctx.body = createSuccessResponse({
        list: billList,
        totalPage: Math.ceil(result.length / pageSize),
        totalExpenseMoney: calculateAdd(result, 'amount',
          item => item.pay_type === '1'),
        totalIncomeMoney: calculateAdd(result, 'amount',
          item => item.pay_type === '2'),
      });
    } catch (err) {
      this.logger.error(err);
      this.ctx.body = createErrorResponse();
    }
  }

  async detail() {
    const { id } = this.ctx.request.query;
    try {
      if (!id) {
        this.ctx.body = createSuccessResponse(200, 'id不能为空');
        return;
      }
      const billInfo = await this.ctx.service.bill.get({ id });
      this.ctx.body = createSuccessResponse(billInfo);
    } catch (err) {
      this.logger.info(err);
      this.ctx.body = createErrorResponse();
    }
  }

  // 根据月份查询当月收入和支出
  async monthStatistics() {
    try {
      const { date } = this.ctx.request.query;
      if (!date) {
        this.ctx.body = createSuccessResponse(200, 'date不能为空');
        return;
      }
      const token = this.ctx.request.headers.authorization;
      const decode = this.app.jwt.verify(token, this.app.config.jwt.secret);
      const list = await this.ctx.service.bill.list({
        where: { user_id: decode.id },
      });
      const result = [];
      const incomeList = [];
      const spendingList = [];
      list.forEach(item => {
        if (moment(new Date(+item.date)).format('YYYY-MM') !== date) return;
        const queryItem = result.find(
          value => value.type_name === item.type_name);
        if (queryItem) {
          queryItem.number = (queryItem.number * 1 + item.amount * 1).toFixed(
            2);
        } else {
          result.push({
            number: item.amount,
            pay_type: item.pay_type,
            type_id: item.type_id,
            type_name: item.type_name,
          });
        }
        if (item.pay_type === '1') {
          spendingList.push(item);
        }
        if (item.pay_type === '2') {
          incomeList.push(item);
        }
      });
      this.ctx.body = createSuccessResponse({
        list: result,
        total_expense: calculateAdd(spendingList, 'amount'),
        total_income: calculateAdd(incomeList, 'amount'),
      });
    } catch (err) {
      this.logger.error(err);
      this.ctx.body = createErrorResponse();
    }
  }

  // 删除
  async delete() {
    try {
      const { id } = this.ctx.request.query;
      if (!id) {
        this.ctx.body = createSuccessResponse(null, 'id不能为空');
        return;
      }
      await this.ctx.service.bill.delete({ id });
      this.ctx.body = createSuccessResponse(null, '删除成功');
    } catch (err) {
      this.logger.error(err);
      this.ctx.body = createErrorResponse();
    }
  }

  // 更新
  async updateInfo() {
    const { ctx, app } = this;
    try {
      const body = ctx.request.body;
      if (!(body.pay_type || body.amount || body.date || body.type_id)) {
        this.ctx.body = createErrorResponse(500, '参数有误');
        return;
      }
      if (Number(body.amount) <= 0) {
        this.ctx.body = createErrorResponse(500, '参数有误');
        return;
      }
      const tagList = await ctx.service.tag.list();
      const type_name = tagList.find(
        item => item.id === body.type_id)?.name;
      if (!type_name) {
        this.ctx.body = createSuccessResponse(200, 'type_id没有匹配项');
        return;
      }
      await ctx.service.bill.update({
        pay_type: body.pay_type,
        amount: body.amount,
        date: body.date,
        type_id: body.type_id,
        type_name,
        remark: body.remark || '',
        id: body.id,
      });
      ctx.body = createSuccessResponse();
    } catch (err) {
      this.logger.error(err.message);
      ctx.body = createErrorResponse();
    }
  }
}

module.exports = BillController;
