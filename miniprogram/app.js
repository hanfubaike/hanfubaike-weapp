//app.js
const VERSION = "1.0.0"
const config = require('config.js')
var nowTime = new Date().getTime()

var systemInfo = wx.getSystemInfoSync()
var isPC = false
//判断是否是PC版
if(systemInfo.platform=="windows" || systemInfo.platform=="mac" || systemInfo.platform=="devtools"){
  console.log("PC环境")
  isPC = true
}
console.log(systemInfo)
App({
  onLaunch: function () {
    Promise.prototype.finally = function (callback) {
      let P = this.constructor;
      return this.then(
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason })
      );
    };
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        env:config.env_id,
        traceUser: true,
      })
    }
    var self = this
    self.envVersion = 'formal'
    if (typeof __wxConfig =="object"){
      let version = __wxConfig.envVersion;
      console.log("当前环境:" + version)
      if (version =="develop"){
        //工具或者真机 开发环境
        self.envVersion = 'developer'
    
      }else if (version =="trial"){
        //测试环境(体验版)
        self.envVersion = 'trial'
    
      }else if (version =="release"){
        //正式环境
        self.envVersion = 'formal'
    
      }
    }

    this.globalData = wx.getStorageSync('globalData') || this.globalData
    this.globalData.userInfo = {isManager:false}
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
    this.getUserInfo()
  },

  globalData:{
    lastUptime: 0,
    userInfo:{isManager:false},
    isGetUserInfo:false,
    isGetOpenid:false,
    catList:[],
    VERSION: VERSION,
    isLogin:false
    
  },
  cropperImg:{},

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
  templateId :"k-NuZiPt5DP1bMDO2REFkfuhz1C907aDm3wJAVJdScw",

  setUserInfo(userInfo,page=""){
    if(userInfo.isAdmin){
      userInfo.isManager = true
    }
    this.globalData.userInfo = userInfo
    if (page){
      page.setData({
        userInfo: this.globalData.userInfo,
        isLogin:true
      })
    }else{
      this.globalData.isLogin = true
    }

    wx.setStorage({
      key:"globalData",
      data:this.globalData
    })
  },
  getUserInfo_old(){
    const self = this
    wx.getSetting({
      success (res){
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function(res) {
              console.log(res.userInfo)
              self.setUserInfo(res.userInfo)
            }
          })
        }else{
          wx.showModal({
            title: '提示',
            content: '请先登录！',
            showCancel:false,
            success (res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/me/me',
                })
              }
            }
          })
        }
      }
    })
  },
  getUserInfo: async function(page="",isTips=false) {
    let self = this
    // 调用云函数
    try{
      const userResult = await wx.cloud.callFunction({
        name: 'getUserInfo',
        data: {}})

      console.log('[云函数] [getUserInfo]: ', userResult.result)
      let userInfo = userResult.result.userInfo
      if(userInfo.status!=1){
        if(isTips){
          wx.showModal({
            title: '提示',
            content: '没有权限。',
            showCancel:false,
            success (res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/map/map',
                })
              }
            }
          })
        }
        //wx.showModal({
          //showCancel:false,
          //title:"登录失败",
          //content:"汉服百科目前仅开放邀请注册，请联系已注册的组织或用户获取邀请链接。"
        //})
        return false
        }
        else{
          self.setUserInfo(userInfo,page)
          return true
        }
    } 
    catch{
          console.error('[云函数] [login] 调用失败', err)
        }
  },
  checkManager(){
    if (!this.checkLogin()){
      return false
    }
    if (!this.globalData.userInfo.isManager){
      wx.showModal({
        title: '提示',
        content: '没有权限。',
        showCancel:false,
        success (res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/map/map',
            })
          }
        }
      })
      return false
    }else{
      return true
    }
  }
  ,
  checkLogin(page="",isTips=true){
    if (this.globalData.userInfo.status!=1){
      return this.getUserInfo(page,isTips)
    }else{
      if(page){
        page.setData({
          isLogin:true
        })
      }
      return true
    }
  },
  compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)
  
    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }
  
    for (let i = 0; i < len; i++) {
      const num1 = parseInt(v1[i])
      const num2 = parseInt(v2[i])
  
      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }
  
    return 0
  },
  getMsgSetting(callback){
    let tmplid = this.templateId
    wx.requestSubscribeMessage({
      tmplIds: [tmplid],
      success (res) { 
        if (res[tmplid]=='accept'){
          console.log("订阅成功！")
          callback()
        }else{
          console.log("用户拒绝或没有权限")
          wx.getSetting({
            withSubscriptions: true,
            success (res){
              console.log(res)
              if (res.subscriptionsSetting && (!res.subscriptionsSetting.mainSwitch || (res.subscriptionsSetting.itemSettings &&res.subscriptionsSetting.itemSettings[tmplid]!="accept"))){
                wx.showModal({
                  title: '温馨提示',
                  content: '请点击确定按钮打开订阅消息开关，以便接收审核消息。',
                  success (res) {
                    if (res.confirm) {
                      console.log('用户点击确定')
                      wx.openSetting({
                        success (res) {
                          console.log(res.authSetting)
                          // res.authSetting = {
                          //   "scope.userInfo": true,
                          //   "scope.userLocation": true
                          // }
                        }
                      })
                    } else if (res.cancel) {
                      console.log('用户点击取消')
                    }
                  }
                })
              }
            }
           })
          }
      },
      fail(res){
        console.log(res)
      }
    })
  },
  version : systemInfo.SDKVersion,
  systemInfo:systemInfo,
  isPC:isPC
  
})
