// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const command = db.command
  let id = ""
  let orgname = ""
  if (event.queryStringParameters){
    console.log("event.queryStringParameters",event.queryStringParameters)
    id = event.queryStringParameters.id
    orgname = event.queryStringParameters.orgname
  }else{
    id = event.id 
    orgname = event.orgname
  }

  let orgInfo = {}
  let isManager = false
  const wxContext = cloud.getWXContext()
  let queryStr = {}

  try {
    if(id){
      queryStr = {
        _id:id
      }
    }else if (orgname){
      queryStr = {
        orgName:orgname
      }
    }else{
      return {}
    }
    const qeueResult = await db.collection('org').where(queryStr)
    .field({
      "orgType":true,
      "orgName":true,
      "orgDesc":true,
      "logoList":true,
      "QQGroup":true,
      "wxmp":true,
      "orgImageList":true,
      "locationAddress":true,
      "locationName":true,
      "updateTime":true,
      "_openid":true,
      "telNumble":true
    }).get()

    orgInfo = qeueResult.data[0]
    if(wxContext.OPENID == orgInfo._openid){
      isManager = true
    }
    returnData = {}
    returnData.orgInfo = orgInfo
    returnData.isManager = isManager
    console.log(orgInfo)
    return returnData
  } catch (err) {
    console.log(err)
    return err
  }
}