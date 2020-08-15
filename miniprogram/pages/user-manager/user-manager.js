// miniprogram/pages/me/user-manager/user-manager.js

const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowStats:true,
    userList:[],
    show:false
  },
  dbName:"user",

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!app.checkManager()){
      return
    }
    this.getUserList()
    wx.hideShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      let name = app.globalData.userInfo.name
      let nickName = app.globalData.userInfo.nickName
      name = name?`『${name}』` : nickName ?`『${nickName}』`:''
      console.log(res.target)
      return {
        title: name+'邀请你加入汉服百科第一期计划',
        path: `/pages/regUser/regUser?inviter=${name}&inviteCode=${this.inviteCode}`,
        imageUrl:"/res/map.jpg"
      }
    }
  },
  dbQuery:function () {
    console.log("正在查询数据库..")
    wx.showLoading({
      title: '正在读取',
      mask:true
    })
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    return db.collection("user").orderBy('addTime', 'desc').get()
  },
  getUsers:async function(){
    let dbres = {}
    try{
      dbres = await this.dbQuery()
      console.log('[数据库] [查询记录] 成功: ', dbres)
      
    }catch (err) {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
      return
    }
    wx.hideLoading()
    if (dbres.data.length!=0){
      this.setData({
        userList:dbres.data
      })
      return
    }
  },


  getUserList: function () {
    //访问网络
    //wx.showNavigationBarLoading()
    let self = this
    //var alluserList = []
    wx.showLoading({
      title: '正在获取...',
      mask:true
    })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'userList',
      // 传给云函数的参数
      data: {
      },
    })
    .then(res => {
      console.log(res.result)
      console.log("成功获取用户列表！")
      //app.showToast("已向管理员发送通知！","success")

      self.userList = res.result["userList"]
      self.setData({
        userList:self.userList
      })
      app.globalData.isAdmin = res.result.isAdmin
      wx.setStorage({
        data: app.globalData,
        key: 'globalData',
      })
    })
    .catch(error =>{
      console.error(error)
      console.log("获取用户列表失败！")
      //app.showToast("向管理员发送通知失败！")
    })
    .finally(function(){
      setTimeout(function(){
        wx.hideNavigationBarLoading()
        wx.hideLoading()},500)
      if (self.userList.length == 0){
        return
      }

    })
  },
    inviteUser(){
      wx.showNavigationBarLoading()
      let self = this
      //var alluserList = []
      wx.showLoading({
        title: '正在生成邀请码...',
        mask:true
      })
      wx.cloud.callFunction({
        // 云函数名称
        name: 'inviteUser',
        // 传给云函数的参数
        data: {
        },
      })
      .then(res => {
        wx.hideLoading()
        console.log(res.result)
        let inviteCode = res.result['_id']
        self.inviteCode = inviteCode
        console.log("成功生成邀请码 ",inviteCode)
        self.setData({
          show:true
        })
      })
      .catch(error =>{
        console.error(error)
        console.log("生成邀请码失败！")
        //app.showToast("向管理员发送通知失败！")
      })
      .finally(function(){
        setTimeout(function(){
          wx.hideNavigationBarLoading()
          wx.hideLoading()},500)
      })
      
  },
  updateUser: function (userInfo,id) {
    //访问网络
    //wx.showNavigationBarLoading()
    let self = this
    //var alluserList = []
    wx.showLoading({
      title: '',
      mask:true
    })
    wx.cloud.callFunction({
      // 云函数名称
      name: 'updateUser',
      // 传给云函数的参数
      data: {userInfo,id
      },
    })
    .then(res => {
      console.log(res.result)
      console.log("成功更新用户信息！")
      self.onLoad()
    })
    .catch(error =>{
      console.error(error)
      console.log("更新用户信息失败！")
      wx.showToast({
        title: '更新用户信息失败！',
        icon: 'none',
        duration: 2000
      })
    })
    .finally(function(){
      setTimeout(function(){
        wx.hideNavigationBarLoading()
        wx.hideLoading()},500)
    })
  }
  ,

  inviteButton(){
    this.setData({
      show:false
    })
  },
  userClick(e){
    let self = this
    console.log(e)
    let item = e.currentTarget.dataset.item
    console.log(item)
    let id = item._id
    let status = item.status
    let isAdmin = item.isAdmin
    if(isAdmin){
      wx.showToast({
        title: '不允许操作超级管理员',
        icon: 'none',
        duration: 2000
      })
      return
    }
    console.log(id)
    let userInfo = {}
    let status_text = "禁用"
    if (status == -1){
      status_text = "启用"
    }
    wx.showActionSheet({
      itemList: ['设为管理员', '设为普通用户',status_text],
      success (res) {
        console.log(res.tapIndex)
        if (res.tapIndex==0){
          userInfo.isManager = true
        }else if(res.tapIndex==1){
          userInfo.isManager = false
        }else if(res.tapIndex==2){
          if (status != -1){
            userInfo.status = -1
          }else{
            userInfo.status = 1
          }
          
        }
        self.updateUser(userInfo,id)
      },
      fail (res) {
        console.log(res.errMsg)
      }
    })
  }




})