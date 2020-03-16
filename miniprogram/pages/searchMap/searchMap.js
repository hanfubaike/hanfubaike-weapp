// map.js
var WxSearch = require('../../wxSearchView/wxSearchView.js');
var util = require('../../utils/util.js');
var app = getApp();
var orgType = [{ name: "其它组织", img: "/images/collection.png" },
{ name: "社会组织", img: "/images/shehuizuzhi.png" },
{ name: "高校社团", img: "/images/gaoxiaoshetuan.png" },
{ name: "中学社团", img: "/images/zhongxueshetuan.png" },
{ name: "文化平台", img: "/images/wenhuapingtai.png" },
{ name: "汉服商家", img: "/images/hanfushangjia.png" }]

Page({
  data: {
    scale: 3,
    markers: [],
    points:[],
    map_container_style: "width: 100%;",
    map_style: "width: 100%; height: 100%;",
    map_text_hidden: true,
    longitude: 116.405568,
    latitude: 39.918397
  },
  allOrgList: [],

  initData: function () {
    var self = this
    wx.getSystemInfo({
      success: function (res) {
        console.log("screenHeight", res.screenHeight)
        self.setData({
          controls: [{
            id: 1,
            iconPath: '/images/locationMe.png',
            position: {
              left: 20,
              top: (res.screenHeight - 20 - 60 - 90) / 1.3,
              width: 30,
              height: 30
            },
            clickable: true
          },
          {
            id: 2,
            iconPath: '/images/plus.png',
            position: {
              left: res.screenWidth - 50,
              top: (res.screenHeight - 20 - 60 - 48 - 90) / 1.3,
              width: 40,
              height: 40
            },
            clickable: true
          },
          {
            id: 3,
            iconPath: '/images/zoom.png',
            position: {
              left: res.screenWidth - 50,
              top: (res.screenHeight - 20 - 60 - 90) / 1.3,
              width: 40,
              height: 40
            },
            clickable: true
          }
          ],
        })
      }
    })
  },


  onLoad: function (options) {
    let self = this
    this.searchMapCtx = wx.createMapContext('searchMap')
    self.initData()
    let points = app.points
    let tipKeys = app.tipKeys
    self.orgList = tipKeys
    console.log(tipKeys, points)
    if (tipKeys && points){
      self.setMarkers(tipKeys, points)
    }
    else{
      console.log("什么也没找到")
      //setTimeout(function () { wx.navigateBack()}, 1000)
    }
    
  },

  onShow: function () {
    let self = this
    
  },
  onUnload:function(){

  },
  setMarkers: function (orgList, points) {
    //wx.showLoading({
    //title: '正在加载',
    //mask: true
    //})
    let self = this
    let data = orgList
    let markers = []

    for (var x in data) {
      let markeJson = {}
      var org_type = data[x].org_type > 5 ? 0 : data[x].org_type

      markeJson.iconPath = orgType[org_type].img
      //markeJson.iconPath = "/images/defaultMarker.png"
      markeJson.width = 25
      markeJson.height = 25
      markeJson.alpha = 0.8

      markeJson.id = x
      markeJson.latitude = data[x].latitude
      markeJson.longitude = data[x].longitude
      //markeJson.anchor = { x: -20, y: 3 }
      markeJson.organizationname = data[x].organizationname

      //markeJson.title = data[x].organizationname
      markeJson.callout = {
        content: data[x].organizationname,
        fontSize: 12,
        borderWidth: 4,
        color: "#000000",
        borderColor: "#ddeef8",
        borderRadius: 6,
        bgColor: "#fafafa",
        padding: 6,
        display: "ALWAYS"
      }
      markers.push(markeJson)
    }


    self.setData({
      points: points,
      markers: markers,
      map_text_hidden: true,
    }
        ,
      function () {
        if (self.searchMapCtx) {
          if (points.length != 0) {
            setTimeout(function () {
              self.searchMapCtx.includePoints({
                points: points,
                padding: [50]
              })
            }, 100);

          }

        }
      })
  },
  mapTap(e) {
    this.setData({
      map_style: "width: 100%; height: 100%;",
      map_text_hidden: true,
      map_text_style: "",
    })
  },

  map_text_tap(e) {
    let self = this
    console.log(e)
    wx.navigateTo({
      url: e.currentTarget.dataset.item.webUrl,
    })
  }
,
  controltap(e) {
    let self = this
    if (e.controlId == 1) {
      self.searchMapCtx.moveToLocation()
      self.setData({
        scale: 15
      })
    }
    else if (e.controlId == 2) {
      self.searchMapCtx.getCenterLocation({
        success: function (ress) {
          self.searchMapCtx.getScale({
            success: function (res) {
              var scale = res.scale
              if (scale <= 19) {
                self.setData({
                  scale: scale + 1,
                  latitude: ress.latitude,
                  longitude: ress.longitude
                })
              }
            }
          })

        }
      })
    }
    else if (e.controlId == 3) {
      // zoom
      self.searchMapCtx.getCenterLocation({
        success: function (ress) {
          self.searchMapCtx.getScale({
            success: function (res) {
              var scale = res.scale
              if (scale >= 4) {
                self.setData({
                  scale: scale - 1,
                  latitude: ress.latitude,
                  longitude: ress.longitude
                })
              }
            }
          })

        }
      })
    }
  },
  markertap(e) {
    let self = this
    let textData = {}
    var _markersData = {}
    var org_type = self.orgList[e.markerId].org_type > 5 ? 0 : self.orgList[e.markerId].org_type 
    //console.log(e.markerId, self.orgList)
    textData.locationName = self.orgList[e.markerId]. locationName
    textData.organizationname = self.orgList[e.markerId].organizationname
    textData.QQGroup = self.orgList[e.markerId].QQGroup
    textData. wxmp = self.orgList[e.markerId]. wxmp
    textData.wbnum = self.orgList[e.markerId].wbnum
    textData.status = self.orgList[e.markerId].status
    textData.orgDesc = self.orgList[e.markerId].orgDesc
    textData.logoList = self.orgList[e.markerId].logoList
    textData.organizationid = self.orgList[e.markerId].organizationid
    textData.orgType = orgType[org_type].name
    if (textData.logoList == "images/defaultLogo.png" || textData.logoList == "") {
      textData.logoList = '/images/defaultLogo.png'
    }
    var webUrl = app.WEBVIEWURL + '/organization_detail.html?organizationid=' + textData.organizationid + "&rand=" + app.VERSION
    textData.webUrl = '/pages/webpage/webpage?url=' + encodeURIComponent(webUrl) + '&title=' + textData.organizationname;
    //textData.logoList = "/images/".concat(self.orgList[e.markerId].organizationname, ".jpg")
    textData.latitude = self.orgList[e.markerId].latitude
    textData.longitude = self.orgList[e.markerId].longitude
    //textData.mode = "aspectFit"
    if (!self.data.markers[e.markerId].callout) {
      _markersData["markers[" + e.markerId + "].callout"] = {
        content: textData.organizationname,
        fontSize: 12,
        borderWidth: 2,
        color: "#000000",
        borderColor: "#DCDCDC",
        borderRadius: 6,
        bgColor: "#FFFFFF",
        padding: 6,
        display: "BYCLICK"
      }
      console.log("不存在callout，添加callout")
    }
    _markersData.textData = textData
    _markersData.map_text_hidden = false
    self.setData(
      _markersData
    )
    //self.updataOneLogo()
    console.log(self.orgList[e.markerId].organizationname)
  },
})