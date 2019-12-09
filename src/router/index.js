import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/components/Index'
import Home from '@/components/Home'
import DataHome from '@/components/overview/DataHome'
import TvHome from '@/components/overview/TvHome'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/tv',
      component: TvHome,
      name: '大屏首页',
      children: [
        {
          path: '/tv', name: '大屏',
          component: resolve => require(['../components/overview/DataOverview'], resolve)
        }
      ]
    },
    {
      path: '/dataOverview',
      name: '',
      component: Index,
      children: [
        {
          path: '/dataOverview',
          component: DataHome,
          name: '概览2',
          children: [
            {
              path: '/dataOverview', name: '概览',
              component: resolve => require(['../components/overview/DataOverview'], resolve)
            }
          ]
        }
      ]
    }, {
      path: '/importPersons',
      component: Index,
      name: '档案',
      children: [
        {
          path: '/importPersons', name: '人员档案',
          component: resolve => require(['../components/profiles/ImportPersons'], resolve)
        }, {
          path: '/cf', name: '车辆档案',
          component: resolve => require(['../components/carfiles/CarFiles'], resolve)
        }, {
          path: '/imsiRecords', name: 'IMSI记录',
          component: resolve => require(['../components/profiles/ImsiRecords'], resolve)
        }, {
          path: '/catchRecords', name: '人脸记录',
          component: resolve => require(['../components/profiles/CatchRecords'], resolve)
        }, {
          path: '/carRecords', name: '车牌记录',
          component: resolve => require(['../components/profiles/CarRecords'], resolve)
        }, {
          path: '/importPersons', component: Home, name: '人员档案',
          children: [
            {
              path: '/personnelFiles', name: '档案信息',
              component: resolve => require(['../components/profiles/PersonnelFiles'], resolve)
            }, {
              path: '/pathLine', name: '轨迹跟踪',
              component: resolve => require(['../components/profiles/PathLine'], resolve)
            }
          ]
        }, {
          path: '/cf', component: Home, name: '车辆档案',
          children: [
            {
              path: '/cfd', name: '车辆档案详情',
              component: resolve => require(['../components/carfiles/CarFileDetail'], resolve)
            }
          ]
        }, {
          path: '/imsiRecords', component: Home, name: 'IMSI记录',
          children: [
            {
              path: '/imsiDetail', name: 'IMSI详情',
              component: resolve => require(['../components/profiles/ImsiDetail'], resolve)
            }
          ]
        }, {
          path: '/catchRecords', component: Home, name: '人脸记录',
          children: [
            {
              path: '/faceDetail', name: '人脸详情',
              component: resolve => require(['../components/profiles/FaceDetail'], resolve)
            }
          ]
        }, {
          path: '/carRecords', component: Home, name: '车牌记录',
          children: [
            {
              path: '/carDetail', name: '车牌详情',
              component: resolve => require(['../components/profiles/CarDetail'], resolve)
            }
          ]
        }
      ]
    }, {
      path: '/caseList',
      component: Index,
      name: '侦查',
      children: [
        {
          path: '/caseList', name: '案件管理',
          component: resolve => require(['../components/analysis/case/CaseList'], resolve)
        }, {
          path: '/collisionAnalysis', name: '交并分析',
          component: resolve => require(['../components/analysis/collision/CollisionAnalysis'], resolve)
        }, {
          path: '/followAnalysis', name: '伴随分析',
          component: resolve => require(['../components/analysis/follow/FollowAnalysis'], resolve)
        }, {
          path: '/carTaskList', name: '车码碰撞',
          component: resolve => require(['../components/analysis/cartask/CarTaskList'], resolve)
        }, {
          path: '/caseList', component: Home, name: '',
          children: [{
            path: '/compareTool', name: '对比工具',
            component: resolve => require(['../components/analysis/CompareTool'], resolve)
          }]
        }, {
          path: '/caseList', component: Home, name: '案件管理',
          children: [
            {
              path: '/caseDetail', name: '案件详情',
              component: resolve => require(['../components/analysis/case/CaseDetail'], resolve)
            }
          ]
        }, {
          path: '/collisionAnalysis', component: Home, name: '交并分析',
          children: [
            {
              path: '/taskDetail', name: '交并任务详情',
              component: resolve => require(['../components/analysis/collision/TaskDetail'], resolve)
            }
          ]
        }, {
          path: '/followAnalysis', component: Home, name: '伴随分析',
          children: [
            {
              path: '/addFollow', name: '新建/修改伴随任务',
              component: resolve => require(['../components/analysis/follow/AddFollow'], resolve)
            }, {
              path: '/followResult', name: '伴随任务详情',
              component: resolve => require(['../components/analysis/follow/FollowResult'], resolve)
            }, {
              path: '/followIMSIDetail', name: 'IMSI详情',
              component: resolve => require(['../components/analysis/follow/FollowIMSIDetail'], resolve)
            }, {
              path: '/followImageDetail', name: '人脸详情',
              component: resolve => require(['../components/analysis/follow/FollowImageDetail'], resolve)
            }
          ]
        }, {
          path: '/carTaskList', component: Home, name: '车码碰撞',
          children: [
            {
              path: '/addCarTask', name: '新建/修改车码碰撞任务',
              component: resolve => require(['../components/analysis/cartask/AddCarTask'], resolve)
            }, {
              path: '/carTaskDetail', name: '车码碰撞分析结果',
              component: resolve => require(['../components/analysis/cartask/CarTaskDetail'], resolve)
            }
          ]
        }
      ]
    },
    {
      path: '/imsiWarnings',
      component: Index,
      name: '防控',
      children: [
        {
          path: '/imsiWarnings', name: 'IMSI告警',
          component: resolve => require(['../components/warning/ImsiWarnings'], resolve)
        }, {
          path: '/catchWarnings', name: '人脸告警',
          component: resolve => require(['../components/warning/CatchWarnings'], resolve)
        }, {
          path: '/personControl', name: '预警模型',
          component: resolve => require(['../components/analysis/control/PersonControl'], resolve)
        }, {
          path: '/listManage', name: '重点人员',
          component: resolve => require(['../components/profiles/ListManage'], resolve)
        }, {
          path: '/imsiWarnings', component: Home, name: 'IMSI告警',
          children: [
            {
              path: '/imsiWarningDetail', name: 'IMSI告警详情',
              component: resolve => require(['../components/warning/ImsiWarningDetail'], resolve)
            }
          ]
        }, {
          path: '/catchWarnings', component: Home, name: '人脸告警',
          children: [
            {
              path: '/faceWarningDetail', name: '人脸告警详情',
              component: resolve => require(['../components/warning/FaceWarningDetail'], resolve)
            }
          ]
        },
        {
          path: '/personControl', component: Home, name: '预警模型',
          children: [
            {
              path: '/addControl', name: '新建/修改预警模型',
              component: resolve => require(['../components/analysis/control/AddControl'], resolve)
            }, {
              path: '/controlDetail', name: '预警模型详情',
              component: resolve => require(['../components/analysis/control/ControlDetail'], resolve)
            }
          ]
        },
        {
          path: '/listManage', component: Home, name: '重点人员',
          children: [
            {
              path: '/vipDetail', name: '重点人员详情',
              component: resolve => require(['../components/profiles/VipDetail'], resolve)
            }
          ]
        }
      ]
    },
    {
      path: '/myApply',
      component: Index,
      name: '翻码',
      children: [
        {
          path: '/myApply', name: 'IMSI翻码（我申请的）',
          component: resolve => require(['../components/approval/MyApply'], resolve)
        }, {
          path: '/myApproval', name: 'IMSI翻码（我审批的）',
          component: resolve => require(['../components/approval/MyApproval'], resolve)
        }, {
          path: '/myReview', name: 'IMSI翻码（我审阅的）',
          component: resolve => require(['../components/approval/MyReview'], resolve)
        }, {
          path: '/imsiConver', name: 'IMSI翻码（翻码返回）',
          component: resolve => require(['../components/approval/ImsiConver'], resolve)
        }, {
          path: '/revTool', name: "翻码工具",
          component: resolve => require(['../components/approval/RevTool'], resolve)
        }, {
          path: '/codeResult', name: '威慑日报',
          component: resolve => require(['../components/approval/FailImsi'], resolve)
        }, {
          path: '/myApply', component: Home, name: 'IMSI翻码',
          children: [
            {
              path: '/approvalDetail', name: '翻码详情',
              component: resolve => require(['../components/approval/ApprovalDetail'], resolve)
            }, {
              path: '/approvalApply', name: '发起申请',
              component: resolve => require(['../components/approval/ApprovalApply'], resolve)
            }
          ]
        },
      ]
    },
    {
      path: '/deviceMap',
      component: Index,
      name: '设备',
      children: [
        {
          path: '/deviceMap', name: '设备地图',
          component: resolve => require(['../components/device/DeviceMap'], resolve)
        }, {
          path: '/cameraDevice', name: '相机设备',
          component: resolve => require(['../components/device/CameraDevice'], resolve)
        }, {
          path: '/codeDevice', name: '侦码设备',
          component: resolve => require(['../components/device/CodeDevice'], resolve)
        }, {
          path: '/placeManager', name: '场所管理',
          component: resolve => require(['../components/device/PlaceManager'], resolve)
        }, {
          path: '/placeManager', component: Home, name: '场所管理',
          children: [
            {
              path: '/placeDetail', name: '场所详情',
              component: resolve => require(['../components/device/deviceSet/PlaceDetail'], resolve)
            }
          ]
        }
      ]
    },
    {
      path: '/userList',
      component: Index,
      name: '系统',
      children: [
        {
          path: '/userList', name: '用户管理',
          component: resolve => require(['../components/system/UserList'], resolve)
        }, {
          path: '/organizationManager', name: '公安机关管理',
          component: resolve => require(['../components/system/OrganizationManager'], resolve)
        }, {
          path: '/roleList', name: '岗位管理',
          component: resolve => require(['../components/system/RoleList'], resolve)
        }, {
          path: '/userList', component: Home, name: '',
          children: [
            {
              path: '/systemParams', name: '系统参数',
              component: resolve => require(['../components/system/SystemParams'], resolve)
            },
          ]
        }, {
          path: '/systemLog', name: '审计日志',
          component: resolve => require(['../components/system/SystemLog'], resolve)
        }, {
          path: '/menuManager', name: '菜单管理',
          component: resolve => require(['../components/system/MenuManager'], resolve)
        }, {
          path: '/dataChart', name: '数据统计',
          component: resolve => require(['../components/system/DataChart'], resolve)
        }
      ]
    },
    {
      path: '/login',
      name: "登录",
      hidden: true,
      component: resolve => require(['../components/Login'], resolve)
    },
    {
      path: '/404',
      name: '404',
      hidden: true,
      component: resolve => require(['../components/404'], resolve)
    },
    {
      path: '*',
      hidden: true,
      redirect: {path: '/404'}
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  }
})
