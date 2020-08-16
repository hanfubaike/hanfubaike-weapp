// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  let isManager = false
  let orgList = []
  let userInfo = {}
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
    if(wxContext.OPENID){
      const userQeue = await db.collection('user').where({
        openid: wxContext.OPENID
      }).get()
      console.log(userQeue)
      if (userQeue.data.length > 0) {
        userInfo = userQeue.data[0]
        if(userInfo.isAdmin){
          userInfo.isManager = true
        }
      }
    }
    
    return {
      orgList: orgList,
      userInfo:userInfo
    }
  } catch (err) {
    console.log(err)
    return err
  }
}