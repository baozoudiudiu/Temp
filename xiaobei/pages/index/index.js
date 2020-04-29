//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    animationTimeinterval: 2000, // 动画时间
    firstDisplay: 'block',  // 加载页一
    secondDisplay: 'none', // 加载页二
    thirdDisplay: 'none', // pageScroll模块
    left_top_icon_display: 'none',
    animating: false, // 是否处于动画中, 用于屏蔽交互
    current_swiper_index: 0,  // 当前展示的pageScroll的页面下标
    pre_swiper_index: 0,  // 前一个展示的pageScroll的页面下标
    pageCount: 4, // pageScroll页面数量
    pageY: 0, // 记录屏幕滑动触发点
    edge: 589,  // 杭州壹号院的便宜
    yipinTop: 739,  // 一品的上部偏移
    houfuTop: 806,  // 候潮府的上部偏移
    left_bottom_icon_opacity: 0.0, //屏幕左下角按钮透明度
    showTopMenu: false,
  },
  
  onLoad: function() {
    let screenHeight = wx.getSystemInfoSync().windowHeight;
    if (screenHeight <= 672) {
      this.setData({edge: 509});
    }else {
      this.setData({
        yipinTop: 739 + 100,
        houfuTop: 806 + 100,
      });
    }
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
        pre_swiper_index: currentIndex,
        current_swiper_index: currentIndex + sender,
        animating: false,
      });
      if (this.data.left_top_icon_display == 'none')
      {
        this.setData({
          left_top_icon_display: 'block',
          left_bottom_icon_opacity: 1.0,
        });
        this.showTopMenu();
        this.showBottomMenu();
      }
      this.swiperItemOrigin(this.data.pre_swiper_index);
      // 开始执行swiper-item的动画
      this.swiperItemAnimation(this.data.current_swiper_index);
    }.bind(this));
  },

  swiperItemOrigin: function(index) {
    if (index == 1)
    {
      this.clearAnimation('.swiper_second_bgView', {translateY: true});
      this.clearAnimation('.swiper_second_bgView_frontImg', {opacity: true});
      this.clearAnimation('.swiper_second_titles', {translateY: true, opacity: true});
    }
    else if (index == 2)
    {
      this.clearAnimation('.swiper_third_bgView', {translateY: true});
      this.clearAnimation('.swiper_third_bgView_frontImg', {opacity: true});
      this.clearAnimation('.swiper_third_titles', {translateY: true, opacity: true});
    }
  },

  swiperItemAnimation: function(index) {
    let during = 1000;
    let that = this;
    if (index == 1)
    { 
      this.setData({animating: true});
      this.animate('.swiper_second_bgView', [
        {translateY: 150},
        {translateY: 0}
      ], during);
      this.animate('.swiper_second_bgView_frontImg', [
        {opacity: 0.0},{opacity: 1.0}
      ], during);
      this.animate('.swiper_second_titles', [{translateY: 100, opacity: 0.0}, {translateY: 0, opacity: 1.0}], during, function(){
        that.setData({animating: false});
      }.bind(this));
    }
    else if (index == 2)
    {
      this.setData({animating: true});
      this.animate('.swiper_third_bgView', [
        {translateY: 150},
        {translateY: 0}
      ], during);
      this.animate('.swiper_third_bgView_frontImg', [
        {opacity: 0.0},{opacity: 1.0}
      ], during);
      this.animate('.swiper_third_titles', [{translateY: 100, opacity: 0.0}, {translateY: 0, opacity: 1.0}], during, function(){
        that.setData({animating: false});
      }.bind(this));
    }
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
  },

  swiperClick: function() {
    if (this.data.animating) {return;}
    if (this.data.current_swiper_index == 0) {return;}
    if (this.data.showTopMenu == false) {return;}
    this.dismissTopMenu();
  },

  // 左上角头像点击
  iconClick: function() {
    this.showTopMenu();
  },

  // 左下角按钮点击
  menuClick: function() {
    console.log("左下角menu按钮被点击啦!!!");
    
  },

  // 展示顶部的菜单栏
  showTopMenu: function() {
    if (this.data.showTopMenu){return;}
    this.setData({animating: true});
    this.animate("#top_menu",[
      {translateY: 0},
      {translateY: 45},
    ], 500, function(){
      this.setData({
        animating: false,
        showTopMenu: true,
      });
    }.bind(this));
  },

  // 隐藏顶部的菜单
  dismissTopMenu: function() {
    if (this.data.showTopMenu == false) {return;}
    this.setData({animating: true});
    this.animate("#top_menu",[
      {translateY: 40},
      {translateY: 0},
    ], 500, function(){
      this.setData({
        animating: false,
        showTopMenu: false,
      });
    }.bind(this));
  },

  // 展示底部菜单
  showBottomMenu: function() {
    this.animate("#bottom_menu", [
      {translateY: 0},
      {translateY: -125},
    ], 500, function(){

    }.bind(this));
  },

  // 隐藏底部菜单
  dismissBottomMenu: function() {
    this.animate("#bottom_menu", [
      {translateY: -125},
      {translateY: 0},
    ], 500, function(){

    }.bind(this));
  }
})
