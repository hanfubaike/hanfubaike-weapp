//detail.js

const app = getApp();

Page({
  data: {
    marker: {},
    logoUrl: "",
    cloudRoot: app.globalData.cloudRoot,
    enablePanorama:false,
    imgUrls: [],
    name:"",
    orgInfo:{},
    isManager:false
  },
  previewImage(e) {
    wx.previewImage({
      current: this.data.orgImageList[e.target.dataset.id],
      urls: this.data.orgImageList
    });
  },
  previewLogo(e) {
    wx.previewImage({
      current: this.data.logoImage,
      urls: [this.data.logoImage]
    });
  },
  navigateTo(e) {
    switch (e.target.id) {
      //case "address":
      case "navigate":
        wx.openLocation({
          latitude: Number(this.data.latitude),
          longitude: Number(this.data.longitude),
          name: this.data.orgName,
          address:this.data.locationAddress,
          scale: 15
        });
        break;
      case "phone":
        wx.makePhoneCall({
          phoneNumber: this.data.marker.contact.phone
        });
        break;
      case "modify":
        wx.navigateTo({
          url: `/pages/addOrg/addOrg?mod=modify&id=${this.data.id}`
        });
        break;
      default:
        break;
    }
  },
  onLoad(options) {
    console.log(options);
    this.options = options
    wx.showLoading({
      title:"加载中"
    })
    let marker
    const imgUrls = [];
    this.setData({orgid:options.id})
    switch (options.type) {
      default:
        this.getOrgInfo(options.id, options.longitude,options.latitude)
        break;
    }

  },
  onShow(){

  },
  getOrgInfo(id,longitude,latitude){
    let orgInfo = {}
    let isManager = false
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
      if (res.result.orgInfo.orgType.length < 1){
        console.log("获取组织信息失败！")
      }else{
        console.log("成功获取组织信息！")
      }
      orgInfo = res.result.orgInfo
      isManager = res.result.isManager
      orgInfo.logoImage = orgInfo.logoList.length>0 ? orgInfo.logoList[0] : "/res/defaultLogo.png"
      //orgInfo.orgImageList = orgInfo.orgImageList.length>0 ? orgInfo.orgImageList:["/res/backImage.png"]
    })
    .catch(error =>{
      console.error(error)
      console.log("获取组织信息失败！")
      app.showToast("获取组织信息失败！")
    })
    .finally(function(){
      setTimeout(function(){
        wx.hideNavigationBarLoading()
        wx.hideLoading()},500)
      if (JSON.stringify(orgInfo) == "{}"){
        console.log("数据为空")
        return
      }

    orgInfo.id = id
    orgInfo.longitude = longitude
    orgInfo.latitude = latitude
    orgInfo.isManager = isManager
    wx.setNavigationBarTitle({
      title: "【" + orgInfo.orgName + "】的主页"
    }) 
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
      path:  getCurrentPages().slice(-1).route,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
});
