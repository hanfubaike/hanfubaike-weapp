// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()

  let orgInfo = {}
  //const wxContext = cloud.getWXContext()
  try {
    const qeueResult = await db.collection('org').doc(event.id).field({
      "orgType":true,
      "orgDesc":true,
      "logoList":true,
      "QQGroup":true,
      "wxmp":true,
      "orgImageList":true,
      "locationAddress":true,
      "locationName":true,
      "updateTime":true
    }).get()

    orgInfo = qeueResult.data
    console.log(orgInfo)
    return orgInfo
  } catch (err) {
    console.log(err)
    return err
  }
}