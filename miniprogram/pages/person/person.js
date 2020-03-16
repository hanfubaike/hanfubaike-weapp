//index.js
var util = require('../../utils/util.js');
var app = getApp();
var nowTime = new Date().getTime()

Page({
  data: {
    readLogs: [],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tab: '1',
    showerror: "none",
    shownodata: "none",
    subscription: "",
    userInfo: app.globalData.userInfo,
    isLoginPopup: false,
    showCheck:false
  },


  onLoad: function (options) {
    var self = this;
    this.checkLogin(this)

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
  getUserInfo(){
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
          self.setData({isLoginPopup:true})
        }
      }
    })
  }  
  ,
  checkLogin(){
    if (!app.globalData.userInfo.nickName){
      this.getUserInfo()
      return false
    }else{
      return true
    }
  }
  ,
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
        this.isAdmin()
        wx.setStorageSync('globalData', app.globalData)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  onShow: function () {
    //console.log('onShow')
    if (app.globalData.isAdmin){
      this.setData({showCheck:true})
    }
    
  },

  onUnload: function () {
    console.log('onUnload')
    //this.onLoad()
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
  tongzhi:function(){
    wx.navigateTo({
      url: '',
    })
  },
  modify_personinfo: function (e) {

   },
  previewImg: function () {
    wx.previewImage({
      current: this.data.imgUrl,
      urls: [this.data.imgUrl]
    })
  },
  onShareAppMessage: function () {
    return {
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  addOrg(e){
    if (this.checkLogin()){
      wx.navigateTo({
        url: '/pages/addOrg/addOrg',
      })
    }

  }
})
