// miniprogram/pages/person/check.js
import Notify from '../../vant-weapp/notify/notify';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData:[
    ],
    dbName:'org'

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    app.checkLogin()
    this.setData({
      listData:[]
    })
    this.dbQuery(this.update)
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
  onShareAppMessage: function () {

  },
  update(data){
    let listData = []
    for (let x in data){
      let thisData = data[x]
      if (thisData.postTime){
        thisData.postTime = app.formatTime(thisData.postTime)
      }
      
      listData.push(thisData)
    }
    this.setData({
      listData:listData
    })
  },
  dbQuery: function (func) {
    wx.showLoading({
      title: '正在读取',
      mask:true
    })
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    db.collection(this.data.dbName).field({
      orgName: true,
      poster:true,
      postTime:true,
    }).where({
      status: 0
    }).get({
      success: res => { 
        console.log('[数据库] [查询记录] 成功: ', res)
        if (res.data.length!=0){
          func(res.data)
        }else{
          console.log('没有需要审核的组织')
          app.showToast("没有需要审核的组织")
          
        }
        
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      },
      complete:res => {
        setTimeout(function () {
          wx.hideLoading()
        }, 1000)
      }
    })
  }

})