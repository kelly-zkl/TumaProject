<template>
  <div>
    <section class="content">
      <el-row style="margin-bottom: 10px">
        <el-col :span="24" align="left" class="tab-card no" style="text-align: left">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="基本信息" name="TASK"></el-tab-pane>
            <el-tab-pane label="IMSI告警" name="IMSI">
              <imsiWarning ref="imsi"></imsiWarning>
            </el-tab-pane>
            <el-tab-pane label="人脸告警" name="FACE">
              <faceWarning ref="face"></faceWarning>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
      <div class="content gray-form" v-show="activeItem == 'TASK'">
        <el-form :model="task" style="margin: 0;padding: 0" labelPosition="right" label-width="120px">
          <div class="add-appdiv dialog" style="padding:10px 0 0 0;margin-bottom: 13px">
            <el-row style="margin: 0;padding: 0;border-bottom:1px #D7D7D7 solid">
              <el-col :span="12" align="left" style="text-align: left">
                <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left">任务信息</div>
              </el-col>
              <el-col :span="12" align="right" style="text-align: right">
                <router-link :to="{path:'/addControl',query:{id:task.id}}">
                  <el-button type="text" v-show="getButtonVial('disposition:add')&&task.threeFlag!='QING_ZHI'"
                             style="margin: 0 10px 0 0" size="mini">修改
                  </el-button>
                </router-link>
                <el-button type="text" @click="deleteTask()"
                           v-show="getButtonVial('disposition:delete')&&task.threeFlag!='QING_ZHI'"
                           style="margin: 0 10px 0 0" size="mini">删除
                </el-button>
                <el-button type="text" @click="finishTask()"
                           v-show="getButtonVial('disposition:batchUpdateStatus')&&task.threeFlag!='QING_ZHI'"
                           style="margin: 0 20px 0 0" size="mini">关闭预警
                </el-button>
              </el-col>
            </el-row>
            <el-row style="margin: 0;padding: 0">
              <el-col :span="8">
                <el-form-item label="关联案件" align="left" style="margin: 0;text-align: left">
                  <el-button type="text" @click="gotoCaseDetail()">{{task.caseName?task.caseName:'--'}}</el-button>
                </el-form-item>
                <el-form-item label="模型名称" align="left" style="margin: 0;text-align: left">
                  {{task.taskName?task.taskName:'--'}}
                </el-form-item>
                <el-form-item label="模型编号" align="left" style="margin: 0;text-align: left">
                  {{task.taskNo?task.taskNo:'--'}}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="有效期限" align="left" style="margin: 0;text-align: left">
                  {{(task.startStr?task.startStr:'--') + ' 至 ' + (task.endStr?task.endStr:'--')}}
                </el-form-item>
                <el-form-item label="重复周期" align="left" style="margin: 0;text-align: left">
                  {{task.cycleType == 'EVERYDAY' ? "每天" : task.week}}
                </el-form-item>
                <el-form-item label="每日时段" align="left" style="margin: 0;text-align: left">
                  {{task.intervalType == 'ALLDAY'?'全天':(task.startTimeInterval?task.startTimeInterval:'--')+ ' 至 '
                  +(task.endTimeInterval?task.endTimeInterval:'--')}}
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="预警状态" align="left" style="margin: 0;text-align: left">
                  <span
                    v-bind:style="{fontSize:'15px',color:task.taskStatus=='EXECUTION'?'#00C755':task.taskStatus =='FINISH'?'#00C755':task.taskStatus =='EXPIRE' ?'#dd6161':'#333'}">
                   {{task.taskStatus =="EXECUTION" ? "进行中" : task.taskStatus == "FINISH" ? "已结束" : task.taskStatus == "EXPIRE" ?'已过期':"--"}}
                 </span>
                </el-form-item>
                <el-form-item label="管控对象类型" align="left" style="margin: 0;text-align: left">
                  {{task.dispositionType==0?'重点人员名单':task.dispositionType==1?'人脸|IMSI特征':'--'}}
                </el-form-item>
                <el-form-item label="创建时间" align="left" style="margin: 0;text-align: left">
                  {{task.timeStr?task.timeStr:'--'}}
                </el-form-item>
                <el-form-item label="创建用户" align="left" style="margin: 0;text-align: left">
                  {{task.createBy?task.createBy:'--'}}
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <el-row style="margin: 0;padding: 0" :gutter="10">
            <el-col :span="15">
              <div class="add-appdiv dialog"
                   v-bind:style="{padding:'10px 0 0 0',marginBottom:'13px',height:tableHeight+'px'}">
                <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">
                  管控对象类型
                </div>
                <el-table :data="task.blackClassList" class="center-block" v-if="task.blackClassList">
                  <el-table-column align="center" type="index" label="序号" width="70"></el-table-column>
                  <el-table-column align="left" prop="name" label="重点人员名单">
                    <template slot-scope="scope">
                      <el-button type="text" @click="gotoVipManager(scope.row.id)">{{scope.row.name}}</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column align="left" prop="personNumbers" label="人员数量"
                                   :formatter="formatterAddress"></el-table-column>
                </el-table>
                <div v-else>
                  <el-form-item label="人脸" align="left" style="margin: 0" v-if="task.featureList.length>0">
                    <div class="img-main" style="margin-top: 10px">
                      <div class="img-item" v-for="item in task.featureList" :key="item.imageId">
                        <img :src="item.imageUrl?item.imageUrl:imgPath" style="max-width: 100%;border-radius: 4px"
                             :onerror="img404"/>
                      </div>
                    </div>
                  </el-form-item>
                  <el-form-item label="IMSI" align="left" style="margin: 0" v-if="task.imsiList.length>0">
                    <el-row>
                      <el-col :span="24">{{task.imsi}}</el-col>
                    </el-row>
                  </el-form-item>
                </div>
              </div>
            </el-col>
            <el-col :span="9">
              <div class="add-appdiv dialog"
                   v-bind:style="{padding:'10px 0 0 0',marginBottom:'13px',height:tableHeight+'px'}">
                <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">
                  布控场所
                </div>
                <el-table :data="task.placeList" class="center-block">
                  <el-table-column align="center" type="index" label="序号" width="70"></el-table-column>
                  <el-table-column align="left" prop="permissionUrl" label="场所名称">
                    <template slot-scope="scope">
                      <el-button type="text" @click="gotoPlaceDetail(scope.row.id)">{{scope.row.placeName}}</el-button>
                    </template>
                  </el-table-column>
                  <el-table-column align="left" prop="detailAddress" label="详细地址"
                                   :formatter="formatterAddress"></el-table-column>
                </el-table>
              </div>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator} from "../../../assets/js/util";
  import faceWarning from '../control/ControlFaceWarning';
  import imsiWarning from '../control/ControlIMSIWarning';

  export default {
    components: {
      faceWarning, imsiWarning
    },
    data() {
      return {
        tableHeight: window.innerHeight - 410,
        task: {featureList: [], imsiList: []},
        taskId: this.$route.query.taskId || '',
        activeItem: "TASK",
        imgPath: require('../../../assets/img/icon_people.png'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_people.png') + "'"
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //跳转重点人员
      gotoVipManager(id) {
        let routeData = this.$router.resolve({path: '/listManage', query: {id: id}});
        window.open(routeData.href, '_blank');
      },
      //跳转场所详情
      gotoPlaceDetail(id) {
        let routeData = this.$router.resolve({path: '/placeDetail', query: {id: id}});
        window.open(routeData.href, '_blank');
      },
      //跳转案件详情
      gotoCaseDetail() {
        if (this.task.caseId) {
          let routeData = this.$router.resolve({path: '/caseDetail', query: {caseId: this.task.caseId}});
          window.open(routeData.href, '_blank');
        }
      },
      handleType(val) {
        if (this.activeItem == 'TASK') {
          this.getTaskDetail();
        } else if (this.activeItem == 'IMSI') {
          this.$refs.imsi.getPlaces();
          this.$refs.imsi.clearData();
        } else {
          this.$refs.face.getPlaces();
          this.$refs.face.clearImgData();
        }
      },
      getTaskDetail() {
        this.$post('disposition/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
          this.task.imsi = this.task.imsiList.join("，");
          this.task.place = this.task.placeName.join("，");
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.updateStr = formatDate(new Date(this.task.updateTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.startStr = formatDate(new Date(this.task.startTime * 1000), 'yyyy-MM-dd');
          this.task.endStr = formatDate(new Date(this.task.endTime * 1000), 'yyyy-MM-dd');
          if (this.task.cycleType === 'WEEKLY') {//每周
            this.task.week = this.getWeekStr(this.task.weekCycleDay);
          }
          if (this.task.blackClassList.length > 0) {
            delete this.task['featureList'];
            delete this.task['imsiList'];
          } else {
            delete this.task['blackClassList'];
          }
        }).catch((err) => {
        });
      },
      //转化重复周期
      getWeekStr(val) {
        let arr = [];
        for (let i = 0; i <= 6; i++) {
          if (val.charAt(i) == 1) {
            switch (i + 1) {
              case 1:
                arr.push("周一");
                break;
              case 2:
                arr.push("周二");
                break;
              case 3:
                arr.push("周三");
                break;
              case 4:
                arr.push("周四");
                break;
              case 5:
                arr.push("周五");
                break;
              case 6:
                arr.push("周六");
                break;
              case 7:
                arr.push("周日");
                break;
            }
          }
        }
        return arr.length > 0 ? arr.join("，") : '--';
      },
      //删除布控任务
      deleteTask() {
        this.$confirm('确认要删除该布控任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('disposition/delete', [this.taskId], '删除成功').then((data) => {
            if ("000000" === data.code) {
              if ("000000" === data.code)
                this.$router.go(-1);
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //结束布控
      finishTask() {
        this.$confirm('确认结束布控?', '提示', {type: 'info'}).then(() => {
          this.$post('disposition/batchUpdateStatus', [this.taskId], '操作成功').then((data) => {
            if ("000000" === data.code) {
              if ("000000" === data.code)
                this.handleType();
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'personNumbers') {
          return row.personNumbers >= 0 ? row.personNumbers : '--';
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      }
    },
    mounted() {
      this.handleType();
    }
  }
</script>
<style scoped>
  .img-main {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .img-item {
    max-width: 100px;
    margin-right: 10px;
    /*margin-bottom: 10px;*/
    position: relative;
  }
</style>
