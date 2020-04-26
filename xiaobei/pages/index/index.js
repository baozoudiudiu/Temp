//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    animationTimeinterval: 2000, // 动画时间
    firstDisplay: 'block',  // 加载页一
    secondDisplay: 'none', // 加载页二
    thirdDisplay: 'none', // pageScroll模块
    animating: false, // 是否处于动画中, 用于屏蔽交互
    current_swiper_index: 0,  // 当前展示的pageScroll的页面下标
    pageCount: 4, // pageScroll页面数量
    pageY: 0, // 记录屏幕滑动触发点
  },
  
  onLoad: function() {
    let that = this;
    // 1.展示第一个加载页
    this.setData({animating: true,})
    this.showView('.center_image_view');
    this.showView('.bottom_image', function(){
      that.setData({
        secondDisplay: 'block'
      });
      // 2.隐藏第一个加载页,展示第二个加载页
      that.hiddenView('#first', function(){
        that.setData({
          firstDisplay: 'none'
        });
        // 3.放大背景图, 第二个加载页动画
        that.animate('.second_bg', [
          {scale: [1.0, 1.0]},
          {scale: [1.8, 1.8]}
        ], 1000, function(){
          that.setData({animating: false,})
        }.bind(that));
      })
    });
  },

  // 展示视图
  showView: function(className, completion) {
    let that = this;
    this.animate(className, [
      {opacity: 0}, 
      {opacity: 1}
    ], 
    3000, 
    function(){
      if (completion) {completion();}
    }.bind(this));
  },
 
  // 隐藏视图
  hiddenView: function(selector, completion) {
    this.animate(selector,[
      {opacity: 1.0},
      {opacity: 0.0}
    ], 250, function() {
      if (completion) {completion();}
    }.bind(this));
  },

  // 加载页点击
  homepageTap: function(event) {
    // 动画完成才让点击
    if (this.data.animating == true) {return;}
    // 第二个加载页点击, 进入主页面(即第三个页面), 一共有4个.通过上下滑动切换.
    let that = this;
    this.setData({
      thirdDisplay: 'block',
    });
    this.hiddenView('#second', function(){
      that.setData({
        secondDisplay: 'none'
      });
      that.showView('.swiper_first_center', function(){});
      that.showView(".swiper_first_bottom",function(){
        that.pageDown();
      });
    });
  },

  // 滑动页面
  pageScroll: function(sender) {
    if (this.data.animating) {return;}
    this.setData({animating: true});
    // 总共多少个
    let count = this.data.pageCount;
    // 当前下标
    let currentIndex = this.data.current_swiper_index;
    // 屏幕高度
    let height = wx.getSystemInfoSync().windowHeight;
    // 动画起始偏移
    let originHeight = currentIndex * height;
    // 动画最终偏移
    let targetHeight = originHeight + sender * height;
    this.animate('#third', [
      {translateY: -originHeight},
      {translateY: -targetHeight}
    ],1500, function(){
      this.setData({
        current_swiper_index: currentIndex + sender,
        animating: false,
      });
    }.bind(this));
  },

  // 上一个
  pageUp: function() {
    if (this.data.current_swiper_index == 1 || this.data.current_swiper_index == 0) {return;}
    this.pageScroll(-1);
  },

  // 下一个
  pageDown: function() {
    if (this.data.current_swiper_index == this.data.pageCount - 1) {return;}
    this.pageScroll(1);
  },

  // 滑动监听-开始
  swiperStartMove: function(e) {
    if (this.data.animating == true) {return;}
    let touch = e.touches[0];
    let value = touch["pageY"];
    this.setData({pageY: value});
  },

  // 滑动监听-结束
  swiperEndMove: function(e) {
    if (this.data.animating == true) {return;}
    let touch = e.changedTouches[0];
    let value = touch["pageY"];
    if (this.data.pageY - value >= 10) {
      if (this.data.current_swiper_index == 0) {return;}
      this.pageDown();
      this.setData({pageY: 0})
    }else if (value - this.data.pageY >= 10) {
      this.pageUp();
      this.setData({pageY: 0})
    }
  }
})
