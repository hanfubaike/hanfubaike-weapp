//detail.js

const app = getApp();

Page({
  data: {
    marker: {},
    logoUrl: "",
    cloudRoot: app.globalData.cloudRoot,
    enablePanorama:false,
    imgUrls: [],
    name:""
  },
  previewImage(e) {
    wx.previewImage({
      current: this.data.imageList[e.target.dataset.id],
      urls: this.data.imageList
    });
  },
  navigateTo(e) {
    switch (e.target.id) {
      case "address":
      case "navigate":
        wx.openLocation({
          latitude: Number(this.data.latitude),
          longitude: Number(this.data.longitude),
          name: this.data.orgName,
          address:this.data.locationName,
          scale: 15
        });
        break;
      case "phone":
        wx.makePhoneCall({
          phoneNumber: this.data.marker.contact.phone
        });
        break;
      case "panorama":
        wx.navigateTo({
          url: `/pages/web-view/web-view?id=${this.data.marker.panorama}`
        });
        break;
      default:
        break;
    }
  },
  onLoad(options) {
    console.log(options);
    
    let marker
    const imgUrls = [];
    wx.setNavigationBarTitle({
      title: "【" + options.orgName + "】的主页"
    })
    switch (options.type) {
      case "商家":
        //pass
        break;
      default:
        this.getOrgInfo(options.id,options.orgName, options.longitude,options.latitude)
        break;
    }

  },
  getOrgInfo(id,orgName,longitude,latitude){
    let orgInfo = {}
    const self = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'orgInfo',
      // 传给云函数的参数
      data: {id:id
      },
    })
    .then(res => {
      console.log(res.result)
      if (res.result.orgType.length < 1){
        console.log("获取组织信息失败！")
      }else{
        console.log("成功获取组织信息！")
      }
      orgInfo = res.result
      orgInfo.logoImage = orgInfo.logoList.length>0 ? orgInfo.logoList[0]:"/images/defaultLogo.png"
    })
    .catch(error =>{
      console.error(error)
      console.log("获取组织信息失败！")
      //app.showToast("向管理员发送通知失败！")
    })
    .finally(function(){
      setTimeout(function(){
        wx.hideNavigationBarLoading()
        wx.hideLoading()},1000)
      if (JSON.stringify(orgInfo) == "{}"){
        console.log("数据为空")
        return
      }

    orgInfo.id = id
    orgInfo.orgName = orgName
    orgInfo.longitude = longitude
    orgInfo.latitude = latitude

    self.setData(
      orgInfo
    )
    //self.updataOneLogo()
    console.log(orgInfo.orgName)

    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: "【" + this.data.orgName + "】的主页", 
      path:  this.getCurrentPages()[-1].route,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
});
