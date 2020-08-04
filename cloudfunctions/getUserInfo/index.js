// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  let userInfo = {}
  const wxContext = cloud.getWXContext()
  try {

    const userQeue = await db.collection('user').where({
      openid: wxContext.OPENID,
      status:1
    }).get()
    if (userQeue.data.length > 0) {
      userInfo = userQeue.data[0]
      if(userInfo.isAdmin){
        userInfo.isManager = true
      }
    }
    console.log(userQeue)
    return {
      userInfo:userInfo
    }
  } catch (err) {
    console.log(err)
    return err
  }
}