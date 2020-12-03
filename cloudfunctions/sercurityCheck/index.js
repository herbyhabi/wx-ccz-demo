// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event,context) => {
  try {
      var res = ''
      //内容安全检测传入的文本
      res = await cloud.openapi.security.msgSecCheck({
        content: event.content
      })
      if (res.errCode == '87014') {
        return res;
      }
      return res;
  } catch (err) {
    return err;
  }
}
