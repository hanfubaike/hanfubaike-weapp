// miniprogram/pages/person/check.js
import Notify from '../../vant-weapp/notify/notify';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    needChecklist:[
    ],
    isChecklist:[],
    dbName:'org',
    active: 0,
  },
  title:"待审核",

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
      needChecklist:[],
      isChecklist:[]
    })
    if (this.title == "待审核"){
      this.needCheck()
    }else{
      this.isCheck()
    }
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
 
  dbQuery: function (field,where,success) {
    wx.showLoading({
      title: '正在读取',
      mask:true
    })
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    db.collection(this.data.dbName).field(field).where(where).get({
      success: res => { 
        console.log('[数据库] [查询记录] 成功: ', res)
        success(res)  
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
        }, 100)
      }
    })
  },
  needCheck(){
    let self = this
    function success(res){
      if (res.data.length != 0){
        let listData = []
        for (let x in res.data){
          let thisData = res.data[x]
          if (thisData.postTime){
            thisData.postTime = app.formatTime(thisData.postTime)
          }
          listData.push(thisData)
        }
        self.setData({
          needChecklist:listData
        })
      }else{
        console.log('没有需要审核的组织')
        app.showToast("没有需要审核的组织")
      }
    }
    let field = {
      orgName: true,
      poster:true,
      postTime:true,
    }
    let where = {
        status: 0
    }
    this.dbQuery(field,where,success)
  },
  isCheck:function(){
    let self = this
    function success(res){
      if (res.data.length != 0){
        let listData = []
        for (let x in res.data){
          let thisData = res.data[x]
          if (thisData.updateTime){
            thisData.updateTime = app.formatTime(thisData.updateTime)
          }
          listData.push(thisData)
        }
        self.setData({
          isChecklist:listData
        })
      }else{
        console.log('没有已审核的组织')
        app.showToast("没有已审核的组织")
      }
    }
    let field = {
      orgName: true,
      poster:true,
      updateTime:true,
    }
    let where = {
        status: 1
    }
    this.dbQuery(field,where,success)
  },
  onChange(event) {
    console.log(event.detail)
    console.log(`切换到标签 ${event.detail.title}`)
    this.title = event.detail.title
    if(this.title=="已审核"){
      this.isCheck()
    }else{
      this.needCheck()
    }
    //wx.showToast({
     // title: `切换到标签 ${event.detail.name}`,
      //icon: 'none'
   // });
  }

})