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
  const command = db.command
  let userInfo = event.userInfo
  let id = event.id
  let isManager = false
  let nickName = ""
  userInfo.updateTime = db.serverDate()
  //const wxContext = cloud.getWXContext()
  try {
    const userQeue = await db.collection('user').where({
      openid: wxContext.OPENID
    }).get()

    if (userQeue.data.length > 0) {

      const checkNameResult = await db.collection('user').field({
      }).where({
        name:userInfo.name,
        openid:command.neq(wxContext.OPENID)
      }).get()
      if (checkNameResult.data.length > 0){
        console.log("雅号已被占用!")
        return {status:false,msg:"雅号已被占用!",exists:true}
      }


      isManager = userQeue.data[0].isManager
      nickName =  userQeue.data[0].nickName
      id = id || userQeue.data[0]._id
      if(isManager || !nickName){
        let result = ""
        if(id){
          result = await db.collection('user').doc(id).update(
            {data:userInfo})
        }else{
          result = await db.collection('user').doc(id).update(
            {data:userInfo})
        }
        if(result.errMsg == "document.update:ok"){
          return {status:true,msg:"更新用户信息成功！",result:result}
        }else{
          return {status:false,msg:"更新用户信息失败！",result:result}
        }
      }

    }else{
      
    }
    return {status:false,msg:"更新用户信息失败：没有权限！",result:result}

    
  } catch (err) {
    console.log(err)
    return err
  }
}