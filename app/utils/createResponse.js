exports.createSuccessResponse = (
  data = null, message = '请求成功', code = 200) => {
  return {
    code,
    message,
    data,
  };
};

exports.createErrorResponse = (
  code = 500, message = '系统异常', data = null) => {
  return {
    code,
    message,
    data,
  };
};
