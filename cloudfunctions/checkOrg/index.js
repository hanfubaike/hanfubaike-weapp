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
  let result = {
    ischeck:false,
    msg:'审核失败'
  }
  try {
    const userQeue = await db.collection('user').where({
      openid: wxContext.OPENID,
      isAdmin:true,
    }).get()
    if (userQeue.data.length > 0) {
      const updateResult = await db.collection('org').where({
        _id:id,
        _openid: '{openid}'
      }).update({
        // data 传入需要局部更新的数据
          data: {
            checkOpenid:wxContext.OPENID,
            status: event.status,
            updateTime:db.serverDate(),
            checkText:event.value
          }
        }
      )
      result.ischeck = true
      result.msg = '审核通过！'
    }else{
      result.msg = '审核失败：没有权限！'
    }

    
  } catch (err) {
    console.log(err)
    result.ischeck = false
    result.msg = err
  }finally {
    return result
}
}