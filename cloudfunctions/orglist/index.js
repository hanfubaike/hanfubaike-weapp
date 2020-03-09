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
  let orgList = []
  const wxContext = cloud.getWXContext()
  try {
    const qeueResult = await db.collection('org').field({
      orgName: true,
      longLatiute: true
    }).where({
      status: 1
    }).get()
    if (qeueResult.data.length > 0) {
      orgList = qeueResult.data
    }
    console.log(qeueResult)
    const adminQeue = await db.collection('adminList').where({
      openid: wxContext.OPENID
    }).get()
    if (adminQeue.data.length > 0) {
      isAdmin = true
    }
    console.log(adminQeue)
    return {
      orgList: orgList,
      isAdmin: isAdmin,
    }
  } catch (err) {
    console.log(err)
    return err
  }
}