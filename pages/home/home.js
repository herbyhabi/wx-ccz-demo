// pages/home/home.js
const util = require('../../utils/util.js')

Page({

  /**
   * Page initial data
   */
  data: {
    hiddenmodalput: true,
    goods_name: "",
    goods_list:[],
    his_list: []

  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },

  modalinput: function(){
    this.setData({
      //注意到模态框的取消按钮也是绑定的这个函数，
      //所以这里直接取反hiddenmodalput，也是没有毛病
      hiddenmodalput: !this.data.hiddenmodalput
    })
  },
  cancel: function(){
    this.setData({
      hiddenmodalput: true
     });
  },
  confirm: function(e){
    this.setData({
        hiddenmodalput: true
       })
   
    var item = {
      id: util.getNowTimestamp(),
      name: this.data.goods_name,
      num: 1
    }
    var that = this
    try {
      var value = wx.getStorageSync('goods_list')
      if (value) {
        that.setData({
          his_list: value    
        })
      }
    } catch (e) {
      // Do something when catch error
    }

    console.log("get  ",this.data.his_list)

    this.data.his_list.push(item)
    console.log("get after addd", this.data.his_list)
    
    try {
      this.setData({
        goods_list: this.data.his_list    
      })
      wx.setStorageSync('goods_list', this.data.his_list)
    } catch (e) { }
    
   },

  obtain_name: function(e){
    this.setData({
      goods_name: e.detail.value
    })
  },

  /**读取缓存 */
  onShow: function() {
    var that = this;
    wx.getStorage({
      key: 'goods_list',
      success(res) {
        that.setData({
          "goods_list": res.data
        })
      }
    })
  },

  /**增加库存*/
  addCount(e){
    const index = e.currentTarget.dataset.index
    let list = this.data.goods_list
    let num = list[index].num
    num = num + 1 
    list[index].num = num
    this.setData({
      goods_list: list
    })

    wx.setStorageSync('goods_list', this.data.goods_list)

  },

   /**减少库存*/
  decreaseCount(e){
    const index = e.currentTarget.dataset.index
    let list = this.data.goods_list
    let num = list[index].num
    num = num - 1
    list[index].num = num
    if (num==0){
      list.splice(index,1)
    }

    this.setData({
      goods_list: list
    })
    wx.setStorageSync('goods_list', this.data.goods_list)
  }

   
})