// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  let isAdmin = false
  let userList = []
  const wxContext = cloud.getWXContext()
  try {

    const userQeue = await db.collection('user').where({
      openid: wxContext.OPENID,
      isAdmin:true,
    }).get()
    if (userQeue.data.length > 0) {
      isAdmin = true
      const qeueResult = await db.collection('user').orderBy('addTime', 'desc').field({
      }).where({}).get()
      if (qeueResult.data.length > 0) {
        userList = qeueResult.data
      }
      console.log(qeueResult)
    }
    console.log(userQeue)
    


    return {
      userList: userList
    }
  } catch (err) {
    console.log(err)
    return err
  }
}