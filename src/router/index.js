import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import Home from '@/components/Home'
import Login from '@/components/Login'
import PageError from "@/components/404";

import DataHome from '@/components/overview/DataHome'
import DataOverview from '@/components/overview/DataOverview'

import ImsiWarnings from '@/components/warning/ImsiWarnings'
import CatchWarnings from '@/components/warning/CatchWarnings'
import FaceWarningDetail from '@/components/warning/FaceWarningDetail'
import ImsiWarningDetail from '@/components/warning/ImsiWarningDetail'

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

import CaseList from '@/components/analysis/case/CaseList'
import CaseDetail from '@/components/analysis/case/CaseDetail'
import CollisionAnalysis from '@/components/analysis/collision/CollisionAnalysis'
import TaskDetail from '@/components/analysis/collision/TaskDetail'
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

import MyApply from '@/components/approval/MyApply'
import MyReview from '@/components/approval/MyReview'
import MyApproval from '@/components/approval/MyApproval'
import ImsiConver from '@/components/approval/ImsiConver'
import ApprovalApply from '@/components/approval/ApprovalApply'
import ApprovalDetail from '@/components/approval/ApprovalDetail'

import DeviceMap from '@/components/device/DeviceMap'
import CameraDevice from '@/components/device/CameraDevice'
import CodeDevice from '@/components/device/CodeDevice'
import PlaceManager from '@/components/device/PlaceManager'
import PlaceDetail from '@/components/device/deviceSet/PlaceDetail'

import UserList from '@/components/system/UserList'
import RoleList from '@/components/system/RoleList'
import MenuManager from '@/components/system/MenuManager'
import OrganizationManager from '@/components/system/OrganizationManager'
import SystemLog from '@/components/system/SystemLog'
import SystemParams from '@/components/system/SystemParams'
import DataChart from '@/components/system/DataChart'

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
          name: '概览2',
          children: [
            {path: '/dataOverview', component: DataOverview, name: '概览'},
          ]
        }
      ]
    },
    {
      path: '/importPersons',
      component: Index,
      name: '档案',
      children: [
        {path: '/importPersons', component: ImportPersons, name: '特征档案'},
        {path: '/imsiRecords', component: ImsiRecords, name: 'IMSI记录'},
        {path: '/catchRecords', component: CatchRecords, name: '人脸记录'},
        {path: '/carRecords', component: CarRecords, name: '车牌记录'},
        {
          path: '/importPersons', component: Home, name: '特征档案',
          children: [
            {path: '/personnelFiles', component: PersonnelFiles, name: '档案信息'},
            {path: '/pathLine', component: PathLine, name: '轨迹跟踪'}
          ]
        },
        {
          path: '/imsiRecords', component: Home, name: 'IMSI记录',
          children: [
            {path: '/imsiDetail', component: ImsiDetail, name: 'IMSI详情'}
          ]
        },
        {
          path: '/catchRecords', component: Home, name: '人脸记录',
          children: [
            {path: '/faceDetail', component: FaceDetail, name: '人脸详情'}
          ]
        },
        {
          path: '/carRecords', component: Home, name: '车牌记录',
          children: [
            {path: '/carDetail', component: CarDetail, name: '车牌详情'}
          ]
        }
      ]
    },
    {
      path: '/caseList',
      component: Index,
      name: '侦查',
      children: [
        {path: '/caseList', component: CaseList, name: '案件管理'},
        {path: '/collisionAnalysis', component: CollisionAnalysis, name: '交并分析'},
        {path: '/followAnalysis', component: FollowAnalysis, name: '伴随分析'},
        {path: '/carTaskList', component: CarTaskList, name: '车码碰撞'},
        {
          path: '/caseList', component: Home, name: '',
          children: [{path: '/compareTool', component: CompareTool, name: '对比工具'}]
        },
        {
          path: '/caseList', component: Home, name: '案件管理',
          children: [
            {path: '/caseDetail', component: CaseDetail, name: '案件详情'}
          ]
        },
        {
          path: '/collisionAnalysis', component: Home, name: '交并分析',
          children: [
            {path: '/taskDetail', component: TaskDetail, name: '交并任务详情'}
          ]
        },
        {
          path: '/followAnalysis', component: Home, name: '伴随分析',
          children: [
            {path: '/addFollow', component: AddFollow, name: '新建/修改伴随任务'},
            {path: '/followResult', component: FollowResult, name: '伴随任务详情'},
            {path: '/followIMSIDetail', component: FollowIMSIDetail, name: 'IMSI详情'},
            {path: '/followImageDetail', component: FollowImageDetail, name: '人脸详情'}
          ]
        },
        {
          path: '/carTaskList', component: Home, name: '车码碰撞',
          children: [
            {path: '/addCarTask', component: AddCarTask, name: '新建/修改车码碰撞任务'},
            {path: '/carTaskDetail', component: CarTaskDetail, name: '车码碰撞分析结果'}
          ]
        }
      ]
    },
    {
      path: '/imsiWarnings',
      component: Index,
      name: '防控',
      children: [
        {path: '/imsiWarnings', component: ImsiWarnings, name: 'IMSI告警'},
        {path: '/catchWarnings', component: CatchWarnings, name: '人脸告警'},
        {path: '/personControl', component: PersonControl, name: '预警模型'},
        {path: '/listManage', component: ListManage, name: '重点人员'},
        {
          path: '/imsiWarnings', component: Home, name: 'IMSI告警',
          children: [
            {path: '/imsiWarningDetail', component: ImsiWarningDetail, name: 'IMSI告警详情'}
          ]
        },
        {
          path: '/catchWarnings', component: Home, name: '人脸告警',
          children: [
            {path: '/faceWarningDetail', component: FaceWarningDetail, name: '人脸告警详情'}
          ]
        },
        {
          path: '/personControl', component: Home, name: '预警模型',
          children: [
            {path: '/addControl', component: AddControl, name: '新建/修改预警模型'},
            {path: '/controlDetail', component: ControlDetail, name: '预警模型详情'}
          ]
        },
        {
          path: '/listManage', component: Home, name: '重点人员',
          children: [
            {path: '/vipDetail', component: VipDetail, name: '重点人员详情'}
          ]
        }
      ]
    },
    {
      path: '/myApply',
      component: Index,
      name: '翻码',
      children: [
        {path: '/myApply', component: MyApply, name: 'IMSI翻码（我申请的）'},
        {path: '/myApproval', component: MyApproval, name: 'IMSI翻码（我审批的）'},
        {path: '/myReview', component: MyReview, name: 'IMSI翻码（我审阅的）'},
        {path: '/imsiConver', component: ImsiConver, name: 'IMSI翻码（翻码返回）'},
        {
          path: '/myApply', component: Home, name: 'IMSI翻码',
          children: [
            {path: '/approvalDetail', component: ApprovalDetail, name: '翻码详情'},
            {path: '/approvalApply', component: ApprovalApply, name: '发起申请'}
          ]
        },
      ]
    },
    {
      path: '/deviceMap',
      component: Index,
      name: '设备',
      children: [
        {path: '/deviceMap', component: DeviceMap, name: '设备地图'},
        {path: '/cameraDevice', component: CameraDevice, name: '相机设备'},
        {path: '/codeDevice', component: CodeDevice, name: '侦码设备'},
        {path: '/placeManager', component: PlaceManager, name: '场所管理'},
        {
          path: '/placeManager', component: Home, name: '场所管理',
          children: [
            {path: '/placeDetail', component: PlaceDetail, name: '场所详情'}
          ]
        }
      ]
    },
    {
      path: '/userList',
      component: Index,
      name: '系统',
      children: [
        {path: '/userList', component: UserList, name: '用户管理'},
        {path: '/organizationManager', component: OrganizationManager, name: '组织管理'},
        {path: '/roleList', component: RoleList, name: '角色管理'},
        {
          path: '/userList', component: Home, name: '',
          children: [
            {path: '/systemParams', component: SystemParams, name: '系统参数'},
          ]
        },
        {path: '/systemLog', component: SystemLog, name: '审计日志'},
        {path: '/menuManager', component: MenuManager, name: '菜单管理'},
        {path: '/dataChart', component: DataChart, name: '数据统计'}
      ]
    },
    {
      path: '/login',
      name: "登录",
      hidden: true,
      component: Login
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
