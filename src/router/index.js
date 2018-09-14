import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import Login from '@/components/Login'
import Platforms from '@/components/Platforms'
import PageError from "@/components/404";

import DataOverview from '@/components/overview/DataOverview'

import WarningHome from '@/components/warning/WarningHome'
import ImsiWarnings from '@/components/warning/ImsiWarnings'
import CatchWarnings from '@/components/warning/CatchWarnings'
import FaceWarningDetail from '@/components/warning/FaceWarningDetail'
import ImsiWarningDetail from '@/components/warning/ImsiWarningDetail'

import FileHome from '@/components/profiles/FileHome'
import ImsiRecords from '@/components/profiles/ImsiRecords'
import CatchRecords from '@/components/profiles/CatchRecords'
import ImportPersons from '@/components/profiles/ImportPersons'
import NormalPersons from '@/components/profiles/NormalPersons'
import ListManage from '@/components/profiles/ListManage'
import PersonnelFiles from '@/components/profiles/PersonnelFiles'
import ImsiDetail from '@/components/profiles/ImsiDetail'
import FaceDetail from '@/components/profiles/FaceDetail'
import ListData from '@/components/profiles/ListData'
import PathLine from '@/components/profiles/PathLine'

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
import DeviceSet from "@/components/device/DeviceSet";

import SystemHome from '@/components/system/SystemHome'
import UserList from '@/components/system/UserList'
import RoleList from '@/components/system/RoleList'
import MenuManager from '@/components/system/MenuManager'
import OrganizationManager from '@/components/system/OrganizationManager'
import SystemLog from '@/components/system/SystemLog'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/dataOverview',
      name: '',
      component: Index,
      children: [
        {path: '/dataOverview', component: DataOverview, name: '概览'},
        {
          path: '/imsiWarnings',
          component: WarningHome,
          name: '告警',
          children: [
            {path: '/imsiWarnings', component: ImsiWarnings, name: 'IMSI告警'},
            {path: '/catchWarnings', component: CatchWarnings, name: '抓拍告警'},
            {path: '/imsiWarningDetail', component: ImsiWarningDetail, name: 'IMSI告警详情'},
            {path: '/faceWarningDetail', component: FaceWarningDetail, name: '图像告警详情'}
          ]
        },
        {
          path: '/imsiRecords',
          component: FileHome,
          name: '档案',
          children: [
            {path: '/imsiRecords', component: ImsiRecords, name: 'IMSI记录'},
            {path: '/catchRecords', component: CatchRecords, name: '抓拍记录'},
            {path: '/importPersons', component: ImportPersons, name: '重点人员'},
            {path: '/normalPersons', component: NormalPersons, name: '普通人员'},
            {path: '/listManage', component: ListManage, name: '名单管理'},
            {path: '/personnelFiles', component: PersonnelFiles, name: '人员档案'},
            {path: '/imsiDetail', component: ImsiDetail, name: 'IMSI详情'},
            {path: '/faceDetail', component: FaceDetail, name: '图像详情'},
            {path: '/listData', component: ListData, name: '名单入库'},
            {path: '/pathLine', component: PathLine, name: '轨迹'}
          ]
        },
        {
          path: '/caseList',
          component: AnalysisHome,
          name: '侦查',
          children: [
            {path: '/caseList', component: CaseList, name: '案件管理'},
            {path: '/caseDetail', component: CaseDetail, name: '案件详情'},
            {path: '/collisionAnalysis', component: CollisionAnalysis, name: '碰撞分析'},
            {path: '/addCollision', component: AddCollision, name: '新建碰撞任务'},
            {path: '/taskDetail', component: TaskDetail, name: '分析结果'},
            {path: '/collisionImsiRecords', component: CollisionImsiRecords, name: 'IMSI详情'},
            {path: '/collisionImageRecords', component: CollisionImageRecords, name: '图像详情'},
            {path: '/followAnalysis', component: FollowAnalysis, name: '伴随分析'},
            {path: '/addFollow', component: AddFollow, name: '新建伴随任务'},
            {path: '/followResult', component: FollowResult, name: '分析结果'},
            {path: '/followIMSIDetail', component: FollowIMSIDetail, name: 'IMSI详情'},
            {path: '/followImageDetail', component: FollowImageDetail, name: '图像详情'},
            {path: '/personControl', component: PersonControl, name: '人员布控'},
            {path: '/addControl', component: AddControl, name: '创建布控任务'},
            {path: '/controlDetail', component: ControlDetail, name: '布控告警详情'},
            {path: '/compareTool', component: CompareTool, name: '对比工具'}
          ]
        },
        {
          path: '/myApply',
          component: ApprovalIndex,
          name: '审批',
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
            {path: '/placeManager', component: PlaceManager, name: '场所管理'},
            {path: '/deviceSet', component: DeviceSet, name: '设备详情'},
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
            {path: '/organizationManager', component: OrganizationManager, name: '组织管理'}
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
