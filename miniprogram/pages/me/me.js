const ctr = require('./controller.js') 
const config = require('../../config.js')
const util = require('../../utils/util.js')
const app = getApp()

// pages/me/me.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: {
      images: config.Theme.Image,
      color: config.Theme.MainColor,
      gradeColor: util.lightenColor(config.Theme.MainColor, 0),
    },
    expLabel: '',
    copyright: "",
    support: true,
    metadata: {
      user_mode: 0, // 0, 1, 2
    },
    readLogs: [],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tab: '1',
    showerror: "none",
    shownodata: "none",
    subscription: "",
    userInfo: app.globalData.userInfo,
    isLoginPopup: false,
    showCheck:false,
    expLabel:'',
    isDialog:false,
    isLogin:false
  },


  onLoad: function (options) {
    var self = this;
    wx.hideShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    })
    this.checkLogin(true)

  },
  agreeGetUser: function (e) {
    var userInfo = e.detail.userInfo;
    var self = this;
    console.log(userInfo)
    if (userInfo) {
      setTimeout(function () {
        self.setData({ isLoginPopup: false })
      }, 1000);
      app.setUserInfo(userInfo,self)
    }
  }
  ,
  closeLoginPopup(){
    this.setData({
      isLoginPopup:false
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
              app.setUserInfo(res.userInfo,self)
            }
          })
        }else{
          //self.setData({isLoginPopup:true})
          //app.showToast("请点击头像登录！")
        }
      }
    })
  }  
  ,
  checkLogin(onLoad=false){
    if (!app.globalData.userInfo.name){
      this.getUserInfo(onLoad)
      return false
    }else{
      this.setData({
        isLogin:true
      })
      return true
    }
  }
  ,
  getUserInfo: function(onLoad=false) {
    let self = this
    // 调用云函数
    wx.cloud.callFunction({
      name: 'getUserInfo',
      data: {},
      success: res => {
        console.log('[云函数] [getUserInfo]: ', res.result)
        let userInfo = res.result.userInfo
        if(!userInfo.name){
          if(!onLoad){
            wx.showModal({
              showCancel:false,
              title:"登录失败",
              content:"汉服百科正在内测中，目前仅开放邀请注册，请联系已注册的组织或用户获取邀请链接。"
            })
          }

        }else{
          app.setUserInfo(userInfo,self)
        }
        
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  getOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        let openid = res.result.openid
        app.globalData.userInfo.openid = openid
        this.setData({
          "userInfo.openid":openid
        })
        wx.setStorageSync('globalData', app.globalData)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  onShow: function () {
    //console.log('onShow')
    //if (app.globalData.userInfo.isManager){
      //this.setData({showCheck:true})
    //}
    
  },

  onUnload: function () {
    console.log('onUnload')
    this.setData({
      isDialog:false
    })
  },


  myOrg(e) {
    //var url = '../webpage/webpage';
    //wx.navigateTo({
     // url: url + '?url=' + app.WEBVIEWURL + '/publish_activity.html'
    //})
    //this.getmyOrgList()
    var self = this
    if (!self.data.logged){
      console.log('没有登陆,跳转登陆');
      wx.navigateTo({
        url: "openAuth?openWeb=true&backPage=" + encodeURIComponent(self.route)
      })
    }
    wx.navigateTo({
      url: 'myOrg'
    })
  },
  checkOrg:function(){
    if (this.checkLogin()){
      wx.navigateTo({
        url: '/pages/check/check',
      })
    }else{
      //app.showToast("请先登录！")
    }
  },
  about: function (e) {
    wx.navigateTo({
      url: '/pages/webpage/webpage?url=https://mp.weixin.qq.com/s/KFIWjE8kWDNburB2paUBIA',
    })
   },
  previewImg: function () {
    wx.previewImage({
      current: this.data.imgUrl,
      urls: [this.data.imgUrl]
    })
  },
  onShareAppMessage: function (res) {

  },
  addOrg(e){
    if (this.checkLogin()){
      wx.navigateTo({
        url: '/pages/addOrg/addOrg',
      })
    }else{
      //app.showToast("请先登录！")
    }

  },

  onOk: function(e) {
    const user = e.detail
    this.setData({ user: user })
  },
  feedback(e){
    this.setData({
      isDialog:true
    })
  },
  closeDialog: function (e) {
    this.setData({
      isDialog: false
    })
  },
  stopEvent:function(){

  },
  buttonClick(e){
    setTimeout(() => {
      this.closeDialog()
    }, 500);
  },
  updateLog(){
    wx.navigateTo({
      url: '/pages/webpage/webpage?url=https://mp.weixin.qq.com/s/I4A1BjfMYboKNoTK1IwWew',
    })
  },
  inviteUser(e){
    if (this.checkLogin()){
      wx.navigateTo({
        url: '/pages/invite/invite',
      })
    }
  },
  loginBt(e){
    this.getUserInfo()
  },
  questionBt(e){
    wx.navigateTo({
      url: '/pages/webpage/webpage?url=https://mp.weixin.qq.com/s/kRp3CifJk0np028R7WPdXQ',
    })
  },
  managerBt(e){
    wx.navigateTo({
      url: '/pages/user-manager/user-manager',
    })
  }

})