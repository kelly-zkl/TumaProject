import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import Login from '@/components/Login'
import Platforms from '@/components/Platforms'
import PageError from "@/components/404";

import DataHome from '@/components/overview/DataHome'
import DataOverview from '@/components/overview/DataOverview'

import WarningHome from '@/components/warning/WarningHome'
import ImsiWarnings from '@/components/warning/ImsiWarnings'
import CatchWarnings from '@/components/warning/CatchWarnings'
import FaceWarningDetail from '@/components/warning/FaceWarningDetail'
import ImsiWarningDetail from '@/components/warning/ImsiWarningDetail'

import FileHome from '@/components/profiles/FileHome'
import VipHome from '@/components/profiles/VipHome'
import ImsiRecords from '@/components/profiles/ImsiRecords'
import CatchRecords from '@/components/profiles/CatchRecords'
import ImportPersons from '@/components/profiles/ImportPersons'
import ListManage from '@/components/profiles/ListManage'
import VipDetail from '@/components/profiles/VipDetail'
import PersonnelFiles from '@/components/profiles/PersonnelFiles'
import ImsiDetail from '@/components/profiles/ImsiDetail'
import FaceDetail from '@/components/profiles/FaceDetail'
import PathLine from '@/components/profiles/PathLine'
import CarRecords from '@/components/profiles/CarRecords'
import CarDetail from '@/components/profiles/CarDetail'

import AnalysisHome from '@/components/analysis/AnalysisHome'
import CaseList from '@/components/analysis/case/CaseList'
import CaseDetail from '@/components/analysis/case/CaseDetail'
import CollisionAnalysis from '@/components/analysis/collision/CollisionAnalysis'
import AddCollision from '@/components/analysis/collision/AddCollision'
import TaskDetail from '@/components/analysis/collision/TaskDetail'
import CollisionImageRecords from '@/components/analysis/collision/CollisionImageRecords'
import CollisionImsiRecords from '@/components/analysis/collision/CollisionImsiRecords'
import FollowAnalysis from '@/components/analysis/follow/FollowAnalysis'
import AddFollow from '@/components/analysis/follow/AddFollow'
import FollowResult from '@/components/analysis/follow/FollowResult'
import FollowIMSIDetail from '@/components/analysis/follow/FollowIMSIDetail'
import FollowImageDetail from '@/components/analysis/follow/FollowImageDetail'
import PersonControl from '@/components/analysis/control/PersonControl'
import AddControl from '@/components/analysis/control/AddControl'
import AddCarTask from '@/components/analysis/cartask/AddCarTask'
import CarTaskList from '@/components/analysis/cartask/CarTaskList'
import CarTaskDetail from '@/components/analysis/cartask/CarTaskDetail'
import ControlDetail from '@/components/analysis/control/ControlDetail'
import CompareTool from '@/components/analysis/CompareTool'

import ApprovalIndex from '@/components/approval/ApprovalIndex'
import MyApply from '@/components/approval/MyApply'
import MyReview from '@/components/approval/MyReview'
import MyApproval from '@/components/approval/MyApproval'
import ImsiConver from '@/components/approval/ImsiConver'
import ApprovalApply from '@/components/approval/ApprovalApply'
import ApprovalDetail from '@/components/approval/ApprovalDetail'

import DeviceHome from '@/components/device/DeviceHome'
import DeviceMap from '@/components/device/DeviceMap'
import CameraDevice from '@/components/device/CameraDevice'
import CodeDevice from '@/components/device/CodeDevice'
import PlaceManager from '@/components/device/PlaceManager'
import PlaceDetail from '@/components/device/deviceSet/PlaceDetail'

import SystemHome from '@/components/system/SystemHome'
import UserList from '@/components/system/UserList'
import RoleList from '@/components/system/RoleList'
import MenuManager from '@/components/system/MenuManager'
import OrganizationManager from '@/components/system/OrganizationManager'
import SystemLog from '@/components/system/SystemLog'
import SystemParams from '@/components/system/SystemParams'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/dataOverview',
      name: '',
      component: Index,
      children: [
        {
          path: '/dataOverview',
          component: DataHome,
          name: '概览',
          children: [
            {path: '/dataOverview', component: DataOverview, name: '概览'},
          ]
        },
        {
          path: '/listManage',
          component: VipHome,
          name: '重点人员',
          children: [
            {path: '/listManage', component: ListManage, name: '重点人员列表'},
          ]
        },
        {
          path: '/imsiWarnings',
          component: WarningHome,
          name: '告警',
          children: [
            {path: '/imsiWarnings', component: ImsiWarnings, name: 'IMSI告警'},
            {path: '/catchWarnings', component: CatchWarnings, name: '图像告警'}
          ]
        },
        {
          path: '/importPersons',
          component: FileHome,
          name: '档案',
          children: [
            {path: '/importPersons', component: ImportPersons, name: '人员档案'},
            {path: '/imsiRecords', component: ImsiRecords, name: 'IMSI记录'},
            {path: '/catchRecords', component: CatchRecords, name: '图像记录'},
            {path: '/carRecords', component: CarRecords, name: '车牌记录'}
          ]
        },
        {
          path: '/caseList',
          component: AnalysisHome,
          name: '侦查',
          children: [
            {path: '/caseList', component: CaseList, name: '案件管理'},
            {path: '/collisionAnalysis', component: CollisionAnalysis, name: '碰撞分析'},
            {path: '/followAnalysis', component: FollowAnalysis, name: '伴随分析'},
            {path: '/personControl', component: PersonControl, name: '人员布控'},
            {path: '/carTaskList', component: CarTaskList, name: '车码碰撞'},
            {path: '/compareTool', component: CompareTool, name: '对比工具'}
          ]
        },
        {
          path: '/myApply',
          component: ApprovalIndex,
          name: '翻码',
          children: [
            {path: '/myApply', component: MyApply, name: 'IMSI翻码（我申请的）'},
            {path: '/myApproval', component: MyApproval, name: 'IMSI翻码（我审批的）'},
            {path: '/myReview', component: MyReview, name: 'IMSI翻码（我审阅的）'},
            {path: '/imsiConver', component: ImsiConver, name: 'IMSI翻码（翻码返回）'},
            {path: '/approvalApply', component: ApprovalApply, name: '发起申请'},
            {path: '/approvalDetail', component: ApprovalDetail, name: '详情'}
          ]
        },
        {
          path: '/deviceMap',
          component: DeviceHome,
          name: '设备',
          children: [
            {path: '/deviceMap', component: DeviceMap, name: '设备地图'},
            {path: '/cameraDevice', component: CameraDevice, name: '相机设备'},
            {path: '/codeDevice', component: CodeDevice, name: '侦码设备'},
            {path: '/placeManager', component: PlaceManager, name: '场所管理'}
          ]
        },
        {
          path: '/systemLog',
          component: SystemHome,
          name: '系统',
          children: [
            {path: '/systemLog', component: SystemLog, name: '系统日志'},
            {path: '/userList', component: UserList, name: '用户管理'},
            {path: '/roleList', component: RoleList, name: '角色管理'},
            {path: '/menuManager', component: MenuManager, name: '菜单管理'},
            {path: '/organizationManager', component: OrganizationManager, name: '组织管理'},
            {path: '/systemParams', component: SystemParams, name: '系统参数配置'}
          ]
        }
      ]
    },
    {
      path: '/listManage',
      name: '重点人员',
      component: Index,
      children: [
        {
          path: '/listManage',
          component: VipHome,
          name: '重点人员列表',
          children: [
            {path: '/vipDetail', component: VipDetail, name: '重点人员详情'}
          ]
        }
      ]
    },
    {
      path: '/imsiWarnings',
      name: '告警',
      component: Index,
      children: [
        {
          path: '/catchWarnings',
          component: WarningHome,
          name: '图像告警',
          children: [
            {path: '/faceWarningDetail', component: FaceWarningDetail, name: '图像告警详情'}
          ]
        }
      ]
    },
    {
      path: '/imsiWarnings',
      name: '告警',
      component: Index,
      children: [
        {
          path: '/imsiWarnings',
          component: WarningHome,
          name: 'IMSI告警',
          children: [
            {path: '/imsiWarningDetail', component: ImsiWarningDetail, name: 'IMSI告警详情'}
          ]
        }
      ]
    },
    {
      path: '/importPersons',
      name: '档案',
      component: Index,
      children: [
        {
          path: '/importPersons',
          component: FileHome,
          name: '人员档案',
          children: [
            {path: '/personnelFiles', component: PersonnelFiles, name: '档案信息'}
          ]
        }
      ]
    },
    {
      path: '/importPersons',
      name: '人员档案',
      component: Index,
      children: [
        {
          path: '/PersonnelFiles',
          component: FileHome,
          name: '档案信息',
          children: [
            {path: '/pathLine', component: PathLine, name: '轨迹跟踪'}
          ]
        }
      ]
    },
    {
      path: '/importPersons',
      name: '档案',
      component: Index,
      children: [
        {
          path: '/imsiRecords',
          component: FileHome,
          name: 'IMSI记录',
          children: [
            {path: '/imsiDetail', component: ImsiDetail, name: 'IMSI详情'}
          ]
        }
      ]
    },
    {
      path: '/importPersons',
      name: '档案',
      component: Index,
      children: [
        {
          path: '/catchRecords',
          component: FileHome,
          name: '图像记录',
          children: [
            {path: '/faceDetail', component: FaceDetail, name: '图像详情'}
          ]
        }
      ]
    },
    {
      path: '/importPersons',
      name: '档案',
      component: Index,
      children: [
        {
          path: '/carRecords',
          component: FileHome,
          name: '车牌记录',
          children: [
            {path: '/carDetail', component: CarDetail, name: '车牌详情'}
          ]
        }
      ]
    },
    {
      path: '/caseList',
      name: '侦查',
      component: Index,
      children: [
        {
          path: '/caseList',
          component: AnalysisHome,
          name: '案件管理',
          children: [
            {path: '/caseDetail', component: CaseDetail, name: '案件详情'}
          ]
        }
      ]
    },
    {
      path: '/caseList',
      name: '侦查',
      component: Index,
      children: [
        {
          path: '/collisionAnalysis',
          component: AnalysisHome,
          name: '碰撞分析',
          children: [
            {path: '/addCollision', component: AddCollision, name: '新建碰撞任务'},
            {path: '/taskDetail', component: TaskDetail, name: '任务详情'},
            {path: '/collisionImsiRecords', component: CollisionImsiRecords, name: 'IMSI详情'},
            {path: '/collisionImageRecords', component: CollisionImageRecords, name: '图像详情'}
          ]
        }
      ]
    },
    {
      path: '/caseList',
      name: '侦查',
      component: Index,
      children: [
        {
          path: '/followAnalysis',
          component: AnalysisHome,
          name: '伴随分析',
          children: [
            {path: '/addFollow', component: AddFollow, name: '新建伴随任务'},
            {path: '/followResult', component: FollowResult, name: '任务详情'},
            {path: '/followIMSIDetail', component: FollowIMSIDetail, name: 'IMSI详情'},
            {path: '/followImageDetail', component: FollowImageDetail, name: '图像详情'}
          ]
        }
      ]
    },
    {
      path: '/caseList',
      name: '侦查',
      component: Index,
      children: [
        {
          path: '/personControl',
          component: AnalysisHome,
          name: '人员布控',
          children: [
            {path: '/addControl', component: AddControl, name: '新建/修改布控任务'},
            {path: '/controlDetail', component: ControlDetail, name: '布控告警详情'}
          ]
        }
      ]
    },
    {
      path: '/caseList',
      name: '侦查',
      component: Index,
      children: [
        {
          path: '/carTaskList',
          component: AnalysisHome,
          name: '车码碰撞',
          children: [
            {path: '/addCarTask', component: AddCarTask, name: '新建车码碰撞任务'},
            {path: '/carTaskDetail', component: CarTaskDetail, name: '车码碰撞分析结果'}
          ]
        }
      ]
    },
    {
      path: '/deviceMap',
      name: '设备',
      component: Index,
      children: [
        {
          path: '/placeManager',
          component: DeviceHome,
          name: '场所管理',
          children: [
            {path: '/placeDetail', component: PlaceDetail, name: '场所详情'}
          ]
        }
      ]
    },
    {
      path: '/login',
      name: "登录",
      hidden: true,
      component: Login
    },
    {
      path: '/platforms',
      name: "切换平台",
      hidden: true,
      component: Platforms
    },
    {
      path: '/404',
      name: '',
      hidden: true,
      component: PageError
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
