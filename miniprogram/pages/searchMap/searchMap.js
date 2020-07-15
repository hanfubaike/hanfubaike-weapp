// map.js
var WxSearch = require('../../wxSearchView/wxSearchView.js');
var util = require('../../utils/util.js');
var app = getApp();
var orgType = [{ name: "其它组织", img: "/res/collection.png" },
{ name: "社会组织", img: "/res/shehuizuzhi.png" },
{ name: "高校社团", img: "/res/gaoxiaoshetuan.png" },
{ name: "中学社团", img: "/res/zhongxueshetuan.png" },
{ name: "文化平台", img: "/res/wenhuapingtai.png" },
{ name: "汉服商家", img: "/res/hanfushangjia.png" }]

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
  },


  onLoad: function (options) {
    let self = this
    this.searchMapCtx = wx.createMapContext('searchMap')
    self.initData()
    let points = app.points
    this.mapCtx = wx.createMapContext('map')
    let tipKeys = app.tipKeys
    self.orgList = tipKeys
    self.points = points
    console.log(tipKeys, points)
    if (tipKeys && points){
      self.setMarkers(tipKeys, true)
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
  isEquals: function (a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  },
  setMarkers: function (orgList, isSearch = false) {
    let self = this
    //wx.showLoading({
    //title: '正在加载',
    //mask: true
    //})

    let data = orgList
    let markers = []
    let width_height = isSearch ? 26 : 20
    //let calloutDisplay = isSearch ? "ALWAYS" : "BYCLICK"
    let calloutDisplay = "ALWAYS"
    for (var x in data) {
      let markeJson = {}
      //var org_type = data[x].org_type > 5 ? 0 : data[x].org_type

      //markeJson.iconPath = orgType[org_type].img
      markeJson.iconPath = "/res/defaultMarker.png"
      markeJson.width = width_height
      markeJson.height = width_height
      markeJson.alpha = 0.9

      markeJson.id = x
     // markeJson._id = data[x]._id
      markeJson.longitude = data[x].longitude
      markeJson.latitude = data[x].latitude
      //markeJson.anchor = { x: -20, y: 3 }
      markeJson.orgName = data[x].orgName
      markeJson.callout = {
        content: data[x].orgName,
        fontSize: 12,
        borderWidth: 2,
        color: "#000000",
        borderColor: "#ddeef8",
        borderRadius: 6,
        bgColor: "#fafafa",
        padding: 6,
        display: calloutDisplay
      }
      markers.push(markeJson)
    }
    if (self.isEquals(markers, self.data.markers)) {
      console.log('数据一致，不刷新。')
      //return
    }
    else {
      self.setData({
        circles: [],
        markers: markers,
        map_text_hidden: true,
      }
        ,
        function () {
          self.Updated = true
          if (!isSearch) {
            return
          }
          var points = self.points
          var _points = []
          if (self.mapCtx) {
            if (self.points.length != 0) {
              setTimeout(function () {
                self.mapCtx.includePoints({
                  points: points,
                  padding: [50]
                })
              }, 100);

            }

          }
        })
    }
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
    let markerID = e.markerId
    var _markersData = {}
    if (markerID.indexOf("c") > -1) {
      console.log("聚合图标,不处理")
      return
    }
    let orgName = this.data.markers[e.markerId].orgName
    for(let x in this.orgList){
      if (this.orgList[x].orgName == orgName){
        let id = this.orgList[x]._id
        let longitude = this.orgList[x].longitude
        let latitude = this.orgList[x].latitude
        wx.navigateTo({
          url: "/pages/orgPage/orgPage?id=" + id + "&longitude=" + longitude + "&latitude=" + latitude ,
        })
        return
      }
    }
    console.log("名字不匹配！！")
    return
    //this.setData({
     // textData:{
       // logoImage:"/res/defaultLogo.png",
       // orgName:orgName,
     //   orgType:"获取中...",
      //  locationName:"获取中..."
     // }
    //})


  },
  locationMe () {
    let self = this
    self.getLocation()
    //self.moveToLocation()
    //self.setData({
    //scale: 15
    //})
    },

  plus () {
    let self = this
    self.mapCtx.getCenterLocation({
      success: function (ress) {
        self.mapCtx.getScale({
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
  },
  zoom () {
    let self = this
    self.mapCtx.getCenterLocation({
      success: function (ress) {
        console.log(ress)
        self.mapCtx.getScale({
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
  },
  getLocation: function (scale=15) {
    let self = this
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        self.setData({
          scale: scale,
          latitude: res.latitude,
          longitude: res.longitude,
        })
        //self.loadingMark(true)
      },
      fail: function () {
        console.log("获取初始位置失败，使用默认位置")
        self.setData({
          latitude: 23.099994,
          longitude: 113.324520,
        })
      }
      ,
      complete: function () {
      }
    })
  },
})