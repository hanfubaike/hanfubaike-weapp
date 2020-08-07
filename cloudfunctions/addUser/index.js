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
  let inviterOpenid = ""
  const command = db.command
  let userInfo = event.userInfo
  userInfo.openid = wxContext.OPENID
  userInfo.addTime = db.serverDate()
  userInfo.status = 1
  let result = ""
  let msg = ""
  //const wxContext = cloud.getWXContext()
  try {
    let inviteCode = userInfo.inviteCode
    if (!inviteCode){
      return {status:false,msg:"邀请码不能为空！"}
    }
    const qeueResult = await db.collection('inviteCode').field({
    }).where({
      status: 0,
      _id:inviteCode
    }).get()
    console.log(qeueResult)
    if (qeueResult.data.length < 1) {
      inviteList = qeueResult.data
      return {status:false,msg:"邀请码已被使用！"}
    }else{
      inviterOpenid = qeueResult.data[0].inviter
      userInfo.inviterOpenid = inviterOpenid
    }
    


    const checkNameResult = await db.collection('user').field({
    }).where({
      name:userInfo.name,
      openid:command.neq(wxContext.OPENID)
    }).get()
    if (checkNameResult.data.length > 0){
      console.log("雅号已被占用!")
      return {status:false,msg:"雅号已被占用!",exists:true}
    }
    const checkResult = await db.collection('user').field({
    }).where({
      openid: wxContext.OPENID
    }).get()
    if (checkResult.data.length > 0) {
      console.log("用户已存在")
      return {status:false,msg:"你已经注册过啦！"}
      //return {status:false,msg:"用户已存在！"}
      //console.log("用户已存在，更新用户信息")
      //let id = checkResult.data[0]._id
      //const addResult = await db.collection('user').doc(id).update(
        //{data:userInfo}
      //)
      //console.log(addResult)
      //msg = "成功更新个人资料"
      //result = addResult
    }else{
      const addResult = await db.collection('user').add(
        {data:userInfo}
      )
      console.log(addResult)
      msg = "注册成功"
      result = addResult
    }
    console.log(qeueResult)

    await db.collection('inviteCode').doc(inviteCode).update(
      {data:{
        status:1,
        updateTime:db.serverDate()

      }})


    return {status:true,msg:msg,result:result}
  } catch (err) {
    console.log(err)
    return err
  }
}