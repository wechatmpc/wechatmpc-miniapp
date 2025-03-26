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
    this.checkSoterSupport();
    my.navigateTo({
      url: "bio"
    });
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
    // 支付宝小程序暂无原生 Soter 生物认证接口，此处模拟检测生物认证支持情况
    my.showToast({
      content: '检测设备生物认证功能...',
      duration: 2000
    });
    // 模拟检测：假设设备支持指纹认证
    setTimeout(() => {
      that.setData({
        isSupported: true,
        supportMode: ['fingerPrint']
      });
    }, 1000);
  },

  startSoterAuth() {
    const that = this;
    if (!this.data.isSupported) {
      my.showToast({
        content: '您的设备不支持生物认证',
        type: 'none'
      });
      return;
    }
    const authMode = this.data.supportMode.includes('fingerPrint')
      ? 'fingerPrint'
      : this.data.supportMode.includes('facial')
      ? 'facial'
      : '';
    if (!authMode) {
      my.showToast({
        content: '无可用的生物认证方式',
        type: 'none'
      });
      return;
    }
    const challenge = 'challenge_code_from_server';
    // 模拟生物认证流程，实际业务中可替换为真实接口或自定义逻辑
    my.confirm({
      title: '生物认证',
      content: '请进行生物认证以验证身份',
      confirmButtonText: '认证',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          console.log('生物认证成功');
          // 模拟认证返回结果，包含 uid 属性
          const ret = { uid: 'simulated_uid' };
          const seed = hd.resotreSeed(that.data.uid, ret.uid);
          console.log(seed);
          that.setData({
            isLogin: true,
            webviewUrl: `https://cryptoloot.sidcloud.cn/${that.data.sidePart}&tk=${seed}&randomSeed=${Date.now()}`
          });
        } else {
          console.error('生物认证取消或失败');
          my.showToast({
            content: '认证失败',
            type: 'none'
          });
        }
      }
    });
  }
});
