// init.js
const hd = require("../../core/wallet");

Page({
  data: {
    scene: "",
    tips: "❌ 目前仅支持扫描二维码登录",
    isLogin: false,
    webviewUrl: "https://cryptoloot.sidcloud.cn/",
    sidePart: "wallet?n=m",
    pin: "",
    supportMode: [],    // 支持的生物认证方式
    authResult: '',     // 认证结果
    isSupported: false  // 是否支持生物认证
  },

  onLoad(option) {
    console.log(option);
    if (option) {
      if (option.scene) {
        this.setData({
          sidePart: `action?action=${option.scene}`,
          scene: option.scene || ""
        });
      }
      for (const key in option) {
        console.log("option keys ::", key);
        if (key !== "scene" && key.length > 10) {
          console.log("🔥New Action ::", key);
          this.setData({
            sidePart: `action?action=${key}`
          });
        }
      }
    }

    this.login();
    // this.checkSoterSupport();
    // Model keypair test
    console.log(hd.resotreSeed(239102331231, "wdnmd123"));
  },

  bindKeyInput(e) {
    this.setData({
      pin: e.detail.value
    });
  },

  sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  },

  login() {
    let that = this;
    // 支付宝小程序使用 getAuthCode 获取授权码
    my.getAuthCode({
      scopes: 'auth_user',
      success: (res) => {
        my.showLoading({
          content: "初始化中"
        });
        console.log("🍺Auth code ::",res.authCode)
        my.request({
          url: "https://mpcapi.sidcloud.cn/alipay/login",
          method: "POST",
          data: {
            code: res.authCode
          },
          success: async function (res) {
            await that.sleep(500);
            console.log(res.data);
            if (res.data.code === 200) {
              that.setData({
                isInit: true,
                uid: res.data.uid
              });
              my.hideLoading();
            } else {
              my.hideLoading();
              my.showToast({
                content: res.data.msg || '初始化失败',
                type: 'fail'
              });
            }
          }
        });
      },
      fail: (err) => {
        console.error('getAuthCode失败', err);
      }
    });
  },

  pinLogin() {
    const seed = hd.resotreSeed(this.data.uid, this.data.pin);
    console.log(seed);
    this.setData({
      isLogin: true,
      webviewUrl: `https://cryptoloot.sidcloud.cn/${this.data.sidePart}&tk=${seed}&randomSeed=${Date.now()}`
    });
  },

  bioLogin() {
    this.startSoterAuth();
  },

  checkSoterSupport() {
    const that = this;
    my.showToast({
      content: '检测设备指纹认证功能...',
      duration: 1000
    });
    my.checkIsSupportIfaaAuthentication ({
      checkAuthMode: 'fingerPrint', // 'facial'
      success: (res) => {
        if (res.isEnrolled) {

          setTimeout(() => {
            that.setData({
              isSupported: true,
              supportMode: ['fingerPrint']
            });
          }, 1000);
        } else {
          my.alert({
            title: '提示',
            content: '您尚未录入生物识别信息，请先到系统设置中录入',
          });
        }
      },
      fail: (err) => {
        console.error('检测生物识别失败：', err);
      }
    });
    my.showToast({
      content: '检测设备人脸认证功能...',
      duration: 1000
    });
    my.checkIsSupportIfaaAuthentication ({
      checkAuthMode: 'facial',
      success: (res) => {
        if (res.isEnrolled) {

          setTimeout(() => {
            that.setData({
              isSupported: true,
              supportMode: ['fingerPrint']
            });
          }, 1000);
        } else {
          my.alert({
            title: '提示',
            content: '您尚未录入生物识别信息，请先到系统设置中录入',
          });
        }
      },
      fail: (err) => {
        console.error('检测生物识别失败：', err);
      }
    });

  },

  startSoterAuth() {
    const that = this;
    if (my.canIUse('checkIsSupportIfaaAuthentication')) {
      my.checkIsSupportIfaaAuthentication({
        success(res) {
          console.log("support mode",res.supportMode);

          if(res.supportMode.length>0)
          {
            my.startIfaaAuthentication({
              requestAuthModes: [res.supportMode[0]],
              challenge : that.data.uid,
              success: function(re) {
                console.log("auth result",re);
                const seed = hd.resotreSeed(that.data.uid, res.supportMode[0]);
                console.log("auth seed",res);
                console.log(seed);
                that.setData({
                  isLogin: true,
                  webviewUrl: `https://cryptoloot.sidcloud.cn/${that.data.sidePart}&tk=${seed}&randomSeed=${Date.now()}`
                });
              },
              fail: function(err) {
                console.log("auth error",err);
              }
            });
          }
        },
        fail(res) {
          console.error("checkissupport failed",res);
          my.alert({
            title: '提示',
            content: '您尚未录入生物识别信息，请先到系统设置中录入',
          });
        }
      }) 
    }
  }
});
