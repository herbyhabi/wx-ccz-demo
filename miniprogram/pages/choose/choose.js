
// pages/choose/choose.js
import util from '../../utils/util.js'

const db = wx.cloud.database()
const FOODS_COLLECTION = 'foods'

Page({

  /**
   * Page initial data
   */
  data: {
    v_foods: '',
    m_foods: '',
    foods_list:[]
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var nowTime = util.getNowTimestamp()
    var value = wx.getStorageSync('foods')
    if(value){
        if((nowTime - value.getTime)/(24*60*60) > 3){
          this.getFoodsFromDB()
        }
    }else{
      this.getFoodsFromDB()
    }
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

   /**
   * 从数据库中获取集合foods的数据
   */
  getFoodsFromDB: function(){
    console.log('获取数据')
    var that = this
    db.collection(FOODS_COLLECTION).get({
      success: function(res){
        var cache_foods = {
          foods: that.data.foods_list,
          getTime: util.getNowTimestamp()
        }
        wx.setStorageSync('foods', cache_foods)

      }
    })
  },

  /**
   * 点击选择按钮则会运行该函数
   * 从集合中随机选择食物
   */

  bindtap_choose: function(){
    var v_l = []
    var m_l = []
    var value = wx.getStorageSync('foods')
    if(value){
      this.setData({
        foods_list: value.foods
      })
    }
    var list = this.data.foods_list
    for(var i=0; i<list.length; i++){
      if(list[i].type=="0"){
        v_l.push(list[i])
      }else{
        m_l.push(list[i])
      }
    }
    this.setData({
      v_foods: this.getItemRandom(v_l).name,
      m_foods: this.getItemRandom(m_l).name
    })
   
  },

  /**
   * 从列表中随机抽取一个元素
   */
  getItemRandom: function(list){
    var index = Math.floor((Math.random()*list.length))
    return list[index]
  }


})