Component({
  properties: {
    color: {
      type: String,
      value: "white"
    },
    delta: {
      type: String,
      optionalTypes: [Number],
      value: 1
    }
  },

  data: {
    bounding: wx.getMenuButtonBoundingClientRect()
  },

  methods: {
    onButtonTap: function(e) {
      if (getCurrentPages().length == 1){
        wx.switchTab({
          url: "/pages/map/map"
        });
      }else{
        wx.navigateBack({
          delta: this.data.delta
        });
      }

    }
  }
});
