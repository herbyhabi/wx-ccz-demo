//index.js
import util from '../../utils/util.js'

const app = getApp()
const db = wx.cloud.database()
const GOODS_COLLECTION = 'goods'

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
    hiddenemptypart: true,
    user_openid: ''
  },

  onLoad: function() {
    var that = this
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

    //获取缓存数据，如果缓存有用户openid，则无需调用云函数去获取，节省流量
    var value = wx.getStorageSync('user_openid')
    if(value){
      that.setData({
        "user_openid": value
      })
    }
    else{
      //调用云函数获取openid
      this.onGetOpenid()
    }

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
        
        //将获取的openid缓存到本地
        wx.setStorageSync('user_openid', res.result.openid)
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
    //调用数据库，获取集合的数据
    db.collection(GOODS_COLLECTION).get({
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

  //封装获取数据库数据的方法
  customizeGetDB: function(col){

    var that = this;
    //调用数据库，获取集合的数据
    db.collection(GOODS_COLLECTION).get({
      success: function(res){
        console.log(res.data)
        that.setData({
          'goods_list': res.data
        })
      }
    })


  },

  bindmodalinput: function(){
    this.setData({
      //注意到模态框的取消按钮也是绑定的这个函数，
      //所以这里直接取反hiddenmodalput
      hiddenmodalput: !this.data.hiddenmodalput,
     
    })

    setTimeout(()=>{
      this.setData({
        focue_value: true
      })
    },100)
  
  },


  //modal框 cancel
  cancel: function(){
    this.setData({
      hiddenmodalput: true
     });
  },

  //modal框 confirm
  confirm: function(e){
    var that = this

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

    try {

      //添加记录到数据库
      var item={
        _openid: this.data.openid,
        name: this.data.goods_name,
        num: 1,
        create_time: util.getNowTimestamp()
      }
      db.collection(GOODS_COLLECTION).add({
        data: item,
        success: function(res){
          that.data.goods_list.push(item)
          that.setData({
            goods_list: that.data.goods_list
          })
          console.log(that.data.goods_list)
        }
      })
      
    } catch (e) {
      console.log("" +e)
      // Do something when catch error
    }

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


   /**更新物品数量*/
   bindChangNum(e){
    var that = this
    const index = e.currentTarget.dataset.index
    let list = this.data.goods_list
    let num = list[index].num
    
    num = num + Number(e.currentTarget.dataset.value)
    if (num<0){
      // list.splice(index,1)
      return
    }
    list[index].num = num

    this.setData({
      goods_list: list
    })
                          
    db.collection(GOODS_COLLECTION).where({
      name: list[index].name,
      _openid: that.data.user_openid

    }).update({
      data: {
        num: num
      },
    })
  },

  /**删除物品 */
  binddeleteitem(e){

    var that = this
    const index = e.currentTarget.dataset.index
    let list = this.data.goods_list
    let targetName = list[index].name
    list.splice(index, 1)
    this.setData({
      goods_list: list
    })

    //删除对应的数据（根据名称和openid来查找）
    db.collection(GOODS_COLLECTION).where({
      name: targetName,
      _openid: that.data.user_openid
    }).remove({
      success: function(res) {
        wx.showToast({
          icon: 'success',
          title: '删掉了～'
        })
        console.log(res.data)
      }
    })
    
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
