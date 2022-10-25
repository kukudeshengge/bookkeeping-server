'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/user/registry', controller.user.registry);
  router.post('/user/login', controller.user.login);
  router.get('/user/getUserInfo', controller.user.getUserInfo);
  router.post('/user/updateUserInfo', controller.user.updateUserInfo);
  router.post('/user/resetPassword', controller.user.resetPassword);
  router.post('/upload', controller.upload.upload);

  router.post('/bill/add', controller.bill.add);
  router.get('/bill/queryBillList', controller.bill.list);
  router.get('/bill/detail', controller.bill.detail);
  router.get('/bill/monthStatistics', controller.bill.monthStatistics);
  router.get('/bill/delete', controller.bill.delete);
  router.post('/bill/update', controller.bill.updateInfo);

  router.get('/tag/list', controller.tag.list);
};
