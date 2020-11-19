//index.js
import util from '../../utils/util.js'

const app = getApp()
const db = wx.cloud.database()
var user_openid = ''
const goods_collection = db.collection('goods')

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    hiddenmodalput: true,
    goods_name: "",
    goods_list:[],
    his_list: [],
    focue_value: false,
    hiddenemptypart: true
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
    this.onGetOpenid()
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        this.setData({
          user_openid: res.result.openid
        })
        user_openid = res.result.openid
        // wx.navigateTo({
        //   url: '../userConsole/userConsole',
        // })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {
    var that = this;
 
    db.collection('goods').get({
      success: function(res){
        that.setData({
          'goods_list': res.data
        })
        if(res.data.length==0){
          that.setData({
            hiddenemptypart: false
          })
        }
      }
    })
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

    // var item = {
    //   _openid: this.data.user_openid,
    //   name: this.data.goods_name,
    //   num: 1,
    //   create_time:  util.getNowTimestamp()
    // }

    // var that = this
    try {
      // db.collection('goods').get({
      //   success: function(res){
      //     if(res.data){
      //       that.setData({
      //         his_list: res.data
      //       })
      //     }
      //   }
      // })

      db.collection('goods').add({
      data: {
        _openid: this.data.openid,
        name: this.data.goods_name,
        num: 1,
        create_time: util.getNowTimestamp()
      },
      success: function(res){
          console.log(res)
      }
      })

    db.collection('goods').get({
      success: function(res){
        this.setData({
          goods_list: res.data
        })
      console.log("test"+res.data)
      }
    })
      
      // var value = wx.getStorageSync('goods_list')
      // if (value) {
      //   that.setData({
      //     his_list: value    
      //   })
      // }
    } catch (e) {
      // Do something when catch error
    }

    // this.data.his_list.push(item)
    
    // try {
    //   this.setData({
    //     goods_list: this.data.his_list    
    //   })


    //   wx.setStorageSync('goods_list', this.data.his_list)
    // } catch (e) { }

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
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },




})
