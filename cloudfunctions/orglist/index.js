// 云函数入口文件
const cloud = require('wx-server-sdk')
const dbName = 'baike'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  db.collection(dbName).field({
    orgName: true
  }).where({
    orgName: this.data.formData.orgName
  }).get({
    success: res => { 
      if (res.data.length!=0){
        Notify("组织名称已存在，请重新输入")
      }else{
        func()
      }
      console.log('[数据库] [查询记录] 成功: ', res)
    },
    fail: err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
    }
  })
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}