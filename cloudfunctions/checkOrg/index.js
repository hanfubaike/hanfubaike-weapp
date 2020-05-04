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
  const id = event.id
  try {
    const updateResult = await db.collection('org').doc(id).update({
      // data 传入需要局部更新的数据
        data: {
          checkOpenid:wxContext.OPENID,
          status: event.status,
          updateTime:db.serverDate(),
          checkText:event.value
        }
      }
    )
    return {
      ischeck:true
    }
  } catch (err) {
    console.log(err)
    return err
  }
}