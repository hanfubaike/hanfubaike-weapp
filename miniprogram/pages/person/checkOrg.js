import Toast from '../../vant-weapp/toast/toast';
import Notify from '../../vant-weapp/notify/notify';

const app = getApp()

Page({
  data: {
    value: '',
    postImageList: [],
    logoImageList:[],
    show: false,
    orgName:"",
    orgType: "",
    locationName: '',
    address: '',
    latitude: '',
    longitude: '',
    status:0,
    src: '',
    openid: '',
    dbName:'org',
    locationInfo:'',
    srcName:'',
 
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  onLoad(option){
    const self = this
    this.option = option
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    }

  },
  onShow(option){
    const id = this.option.id
    if (id){
      this.dbQuery(id,this.update)
    }
    
  },

  dbAdd: function (data) {
    const db = wx.cloud.database()

    data['updateTime'] = db.serverDate()
    db.collection(this.data.dbName).add({
      data: data,
      success: res => {
        wx.hideLoading()
        //在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: res._id,
          count: 1
        })
        wx.showModal({
          title: '提示',
          content: '提交成功，请等待管理员审核，点击确定按钮返回首页',
          success(res) {
            if (res.confirm) {
              wx.redirectTo({
                url: 'map'
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '提交失败！'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },
  dbQuery: function (id,func) {
    wx.showLoading({
      title: '加载中...',
      mask:true
    })
    const db = wx.cloud.database()
    //查询当前用户所有的 counters
    db.collection(this.data.dbName).doc(id).field({
      status:false,
      postTime:false

    }).get({
      success: res => { 
        if (res.data){
          func(res.data)
        }else{
          
        }
        console.log('[数据库] [查询记录] 成功: ', res)
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
  },
  dbUpdate(id,status){
    wx.showLoading({
      title: '提交中...',
      mask:true
    })
    const db = wx.cloud.database()
    db.collection(this.data.dbName).doc(id).update({
      // data 传入需要局部更新的数据
      data: {
        status: status,
        updateTime:db.serverDate(),
        checkOpenid:'{openid}'
      },
      success: function(res) {
        console.log(res)
        wx.showModal({
          title: '提示',
          content: '审核成功，点击确定按钮返回上一页',
          success(res) {
            if (res.confirm) {
              wx.navigateBack()
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '更新记录失败'
        })
        console.error('[数据库] [更新记录] 失败：', err)
      },
      complete:res => {
        setTimeout(function () {
          wx.hideLoading()
        }, 200)
      }
    })
  },
  update(dataList){
    const data = dataList
    //console.log(data)
    let listData = []
    let listData2 = []
    for (let x in data.logoImageList){
      listData.push({url:data.logoImageList[x]})
    }
    data.logoImageList = listData
    
    
    for (let x in data.postImageList){
      listData2.push({url:data.postImageList[x]})
    }
    data.postImageList = listData2
    this.setData(
      data
    )
  },
  passed(){
    const self = this
    wx.showModal({
      title: '审核确认',
      content: '确认【通过】吗？',
      success(res) {
        if (res.confirm) {
          self.dbUpdate(self.data._id, 1)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
    
  },

  noPassed(){
    const self = this
    wx.showModal({
      title: '审核确认',
      content: '确认【拒绝】吗？',
      success(res) {
        if (res.confirm) {
          self.dbUpdate(self.data._id, -1)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }

});