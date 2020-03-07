//app.js
const VERSION = "1.0.0"
var nowTime = new Date().getTime()

App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    var self = this
    this.globalData = wx.getStorageSync('globalData') || this.globalData
    if (this.globalData.VERSION != VERSION){
      this.globalData.userInfo = {}
      this.globalData.VERSION = VERSION
    }else{
      //self.userAuthorization()
    }
    //if (!self.globalData.userInfo.openid){
      //self.getOpenId()
    //}
    if (nowTime - this.globalData.lastUptime > 1000*60*60*24*7){
      //self.userAuthorization()
    }
    //var logs = wx.getStorageSync('logs') || []
    //logs.unshift(Date.now())
    //wx.setStorageSync('logs', logs)
    if (wx.getUpdateManager) {
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        //console.log(res.hasUpdate)
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })

      })

      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
      })

    }
  },
  globalData:{
    lastUptime: 0,
    userInfo:{},
    isGetUserInfo:false,
    isGetOpenid:false,
    catList:[],
    VERSION: VERSION
  },
  adminList : {oyuGH5Ey1vWJlbfKjHJQhiHNcPLs:'与非','oyuGH5La5_Ey4XEdiWK-IreSU8PM':'非与','oyuGH5Oy-A7dQoSfOx6yJE3RtPpc':'海螺'},
  isAdmin(_openid=""){
    let openid
    if(!_openid){
      openid = this.globalData.userInfo.openid
    }else{
      openid = _openid
    }
    if (openid in this.adminList){
      return true
    }else{
      return false
    }
  },
   formatTime(date) {
    function formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
  
    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
  
  
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  },
  showToast(title="",icon="none",duration=2000){
    wx.showToast({
      title: title,
      icon: icon,
      duration: duration,
      complete(){
        //setTimeout(function(){
          //wx.hideToast()
        //},3000)
        
      }
    })
  },
  cropperImgUrl:"",
  copyright :"Copyright © 2020-2021 hanfubaike",
  templateId :"k-NuZiPt5DP1bMDO2REFkfuhz1C907aDm3wJAVJdScw"
})
