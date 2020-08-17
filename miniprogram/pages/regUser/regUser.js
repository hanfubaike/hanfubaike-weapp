// miniprogram/pages/me/inviteUser/inviteUser.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    copyright:app.copyright
    
  },
  name:"",

  /** 
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let self = this
    console.log(options)
    let inviter = options.inviter || ''
    let inviteCode = options.inviteCode
    this.setData({
      inviter
    })
    this.inviteCode = inviteCode
    let isLogin = await app.checkLogin(self,false)
    if(isLogin && self.data.userInfo.nickName){
      wx.showModal({
        showCancel:true,
        title: '提示',
        content: '你已经注册过啦，点击确定进入下一页',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.navigateTo({
              url: '/pages/regUser/regSuccess',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
  ,
  agreeGetUser: function (e) {

    let checkResult = app.checkName(this.name)
    if(checkResult === true){

    }else{
      let errorMessage = checkResult
      //wx.showToast({
        //title:errorMessage,
        //icon:"none"
      //})
      this.setData({
        errorMessage:errorMessage
      })
      return
    }
    let userInfo = e.detail.userInfo;
    userInfo.inviteCode = this.inviteCode
    if (!userInfo.inviteCode){
      wx.showModal({
        showCancel:false,
        title: '提示',
        content: '邀请码不能为空！',
        success (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.reLaunch({
              url: '/pages/map/map',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    let self = this;
    console.log(userInfo)
    if (userInfo) {
      setTimeout(function () {
        self.setData({ isLoginPopup: false })
      }, 1000);
      //app.setUserInfo(userInfo,self)
      self.addUser(userInfo)
    }
  },
  addUser: function (userInfo) {
    //访问网络
    let tips = ""
    let nameExists = false
    let status = false
    userInfo.name = this.name
    //wx.showNavigationBarLoading()
    let self = this
    //var alluserList = []
    wx.showLoading({
      title: '正在提交...',
      mask:true
    })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'addUser',
      // 传给云函数的参数
      data: {userInfo:userInfo
      },
    })
    .then(res => {
      console.log(res.result)
      if(res.result.status==true){
        tips = res.result.msg
        status = true
        if(res.result.result && res.result.result._id){
          userInfo._id = res.result.result._id
        }
        console.log(tips)
      }else{
        if(res.result.exists){
          nameExists = true
        }
        tips = "注册失败，"+ res.result.msg
        console.error(tips)
      }
    })
    .catch(error =>{
      tips = "注册失败，"+error
      console.error(tips)
    })
    .finally(function(){
      setTimeout(function(){
        wx.hideNavigationBarLoading()
        wx.hideLoading()},10)
      wx.showModal({
        showCancel:false,
        title: '提示',
        content: tips,
        success (res) {
          if (res.confirm && !nameExists) {
            console.log('用户点击确定')
            if(status){
              let newUserInfo = Object.assign(userInfo,app.globalData.userInfo)
              console.log("注册成功！",newUserInfo)
              app.setUserInfo(userInfo)
              wx.redirectTo({
                url: '/pages/regUser/regSuccess',
              })
            }else{
              wx.reLaunch({
                url: '/pages/map/map',
              })
            }

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })   
    })
  },
  inputChage(e){
    console.log(e)
    if(this.data.errorMessage){
      this.setData({
        errorMessage:""
      })
    }
    let value = e.detail
    this.name = value
  }
})