// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  //let inviteInfo = event.inviteInfo
  let inviteInfo = {
    updateTime:db.serverDate(),
    addTime:db.serverDate(),
    inviter:wxContext.OPENID,
    status:0
  }

  //const wxContext = cloud.getWXContext()
  try {

    /*const qeueResult = await db.collection('inviteCode').field({
    }).where({
      status: 0,
      inviter:wxContext.OPENID
    }).get()
    if (qeueResult.data.length > 0) {
      inviteList = qeueResult.data
      return inviteList[0]
    }
    console.log(qeueResult)
    */

    const result = await db.collection('inviteCode').add(
      {data:inviteInfo}
    )


    console.log(result)
    return result
  } catch (err) {
    console.log(err)
    return err
  }
}