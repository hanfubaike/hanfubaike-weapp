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
    function callback(){
      app.showToast("订阅成功","success")
      Notify({type: 'success',message:'正在返回首页...'})
      
      setTimeout(function(){
        wx.reLaunch({
          url: '/pages/map/map',
        })
      },3000)
    }
    if (this.option.SubscribeMessage){   
      app.getMsgSetting(callback)
    }

  },


});