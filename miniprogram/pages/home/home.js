// pages/home/home.js

const db = wx.cloud.database({
  env: 'test-8gffoeq515d02c58'
})

Page({
  /**
   * Page initial data
   */
  data: {
    hiddenmodalput: true,
    goods_name: "",
    goods_list:[],
    his_list: [],
    focue_value: false,
    hiddenemptypart: true
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
    onShow: function() {
      var that = this;
      console.log('before')

      
      db.collection('goods').get({
        success: function(res){
          console.log(res)
        }
      })

      console.log('after')
      wx.getStorage({
        key: 'goods_list',
        success(res) {
          that.setData({
            "goods_list": res.data
          })
          if(res.data.length==0){
            that.setData({
              hiddenemptypart: false
            })
          }
        }
      })
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

  bindmodalinput: function(){
    this.setData({
      //注意到模态框的取消按钮也是绑定的这个函数，
      //所以这里直接取反hiddenmodalput，也是没有毛病
      hiddenmodalput: !this.data.hiddenmodalput,
     
    })

    setTimeout(()=>{
      this.setData({
        focue_value: true
      })
    },100)
  
  },
  cancel: function(){
    this.setData({
      hiddenmodalput: true
     });
  },
  confirm: function(e){
    //名字为空，toast提示且不能保存
    if(this.data.goods_name==''){
      wx.showToast({
        title: 'name is required!',
        icon: "none",
        duration: 1000,
        mask:true
      })
      return
    }

    this.setData({
        hiddenmodalput: true,
        focue_value: false,
        hiddenemptypart: true
       })

    var item = {
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

    this.data.his_list.push(item)
    
    try {
      this.setData({
        goods_list: this.data.his_list    
      })
      wx.setStorageSync('goods_list', this.data.his_list)
    } catch (e) { }

    //输入框不保留上一次的输入记录
    this.setData({
      goods_name: ''
     })
   },

  bindobtain_name: function(e){
    this.setData({
      goods_name: e.detail.value
    })
  },



  /**增加物品数量*/
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

   /**减少物品数量*/
  decreaseCount(e){
    const index = e.currentTarget.dataset.index
    let list = this.data.goods_list
    let num = list[index].num
    if (num==0){
      // list.splice(index,1)
      return
    }
    num = num - 1
    list[index].num = num

    this.setData({
      goods_list: list
    })
    wx.setStorageSync('goods_list', this.data.goods_list)
  },

  /**删除物品 */
  binddeleteitem(e){
    const index = e.currentTarget.dataset.index
    let list = this.data.goods_list
    list.splice(index, 1)
    this.setData({
      goods_list: list
    })
    wx.setStorageSync('goods_list', this.data.goods_list)

    //设置缺省页展示
    if(list.length==0){
      this.setData({
        hiddenemptypart: false
      })
    }
  }
   
})