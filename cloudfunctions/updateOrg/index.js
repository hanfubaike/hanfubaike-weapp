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
  const id = event.id
  let result = {
    updated:false,
    msg:'更新失败'
  }
  try {
    const userQeue = await db.collection('org').where({
      _id:id,
      _openid: wxContext.OPENID
    }).get()

    if (userQeue.data.length > 0) {
      let orgData = event.orgData
      let removeList = event.removeList
      let updateTime = db.serverDate()
      orgData.updateTime = updateTime
      orgData.updateLog = command.push({updateTime:updateTime,openid:wxContext.OPENID})
      const updateResult = await db.collection('org').where({
        _id:id
      }).update({
        // data 传入需要局部更新的数据
          data: orgData
        }
      )
      if(removeList.length > 0){
        console.log('删除文件列表：',removeList)
        let delResult = await cloud.deleteFile({
          fileList: removeList
        })
        console.log(delResult)
      }
      console.log(updateResult)
      result.updated = true
      result.msg = '更新成功！'
      result.data = updateResult
    }else{
      result.msg = '更新失败：没有权限！'
    }

    
  } catch (err) {
    console.log(err)
    result.updated = false
    result.msg = err
  }finally {
    return result
}
}