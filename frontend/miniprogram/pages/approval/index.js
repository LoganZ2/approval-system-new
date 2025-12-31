// pages/approval/index.js
Page({
  data: {
    approvals: [
      { id: 1, title: '请假申请', status: 'pending', date: '2025-12-31', applicant: '张三' },
      { id: 2, title: '报销申请', status: 'approved', date: '2025-12-30', applicant: '李四' },
      { id: 3, title: '采购申请', status: 'rejected', date: '2025-12-29', applicant: '王五' }
    ]
  },

  onLoad() {
    // 页面加载时获取审批列表
    this.getApprovalList()
  },

  getApprovalList() {
    // 这里可以调用API获取审批列表
    // 暂时使用模拟数据
    console.log('获取审批列表')
  },

  viewApprovalDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../approval-detail/index?id=${id}`
    })
  },

  createApproval() {
    wx.navigateTo({
      url: '../create-approval/index'
    })
  }
})