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
  let userInfo = event.userInfo
  let id = event.id
  userInfo.updateTime = db.serverDate()
  //const wxContext = cloud.getWXContext()
  try {
    const userQeue = await db.collection('user').where({
      openid: wxContext.OPENID,
      isManager:true,
    }).get()
    if (userQeue.data.length > 0){
      let result = await db.collection('user').doc(id).update(
        {data:userInfo})
      if(result.errMsg == "document.update:ok"){
        return {status:true,msg:"更新用户信息成功！",result:result}
      }else{
        return {status:false,msg:"更新用户信息失败！",result:result}
      }
    }else{
      return {status:false,msg:"更新用户信息失败：没有权限！",result:result}
    }


    
  } catch (err) {
    console.log(err)
    return err
  }
}