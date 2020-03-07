const app = getApp()
import Notify from '../../vant-weapp/notify/notify';

Page({
  data:{
    //title:"操作成功",
    //msg:"内容详情，可根据实际需要安排，如果换行则不超过规定长度，居中展现",
   // msgLink:"文字链接",
    //btText:"确定",
   // msgTips:"内容详情，可根据实际需要安排，如果换行则不超过规定长度，居中展现",
    //tipsLink:"文字链接",
    //footerLink:"底部链接文本",
    copyright:app.copyright
  },
  onLoad(option){
    console.log(option)
    this.option = option
    this.setData(option)
  },
  button(){
    if (this.option.SubscribeMessage){   
      this.getMsgSetting()
    }

  },
  getMsgSetting(){
    let tmplid = app.templateId
    wx.requestSubscribeMessage({
      tmplIds: [tmplid],
      success (res) { 
        if (res[tmplid]=='accept'){
          app.showToast("订阅成功","success")
          Notify({type: 'success',message:'正在返回首页...'})
          
          setTimeout(function(){
            wx.reLaunch({
              url: '/pages/index/map',
            })
          },3000)
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
  }

});