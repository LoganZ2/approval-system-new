// pages/profile/index.js
Page({
  data: {
    userInfo: {
      name: '张三',
      department: '技术部',
      avatar: ''
    },
    menuItems: [
      { title: '我的申请', icon: 'form', url: '../my-approvals/index' },
      { title: '待我审批', icon: 'check-circle', url: '../pending-approvals/index' },
      { title: '设置', icon: 'setting', url: '../settings/index' }
    ]
  },

  onLoad() {
    // 获取用户信息
    this.getUserInfo()
  },

  getUserInfo() {
    // 这里可以调用API获取用户信息
    console.log('获取用户信息')
  },

  navigateToPage(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },

  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录状态
          wx.removeStorageSync('token')
          wx.reLaunch({
            url: '../index/index'
          })
        }
      }
    })
  }
})