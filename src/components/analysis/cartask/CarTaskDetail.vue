<template>
  <div>
    <section class="content">
      <div class="add-appdiv gray-form" style="margin-bottom: 15px;padding: 0">
        <el-row style="border-bottom:1px #D7D7D7 solid;margin: 0">
          <el-col :span="12" align="left" style="text-align: left">
            <div style="font-size:15px;padding:10px 20px;text-align:left">车码碰撞任务信息</div>
          </el-col>
          <el-col :span="12" align="right" style="text-align: right;padding-right: 30px">
            <router-link :to="{path:'/addCarTask',query:{no:task.taskNo}}">
              <el-button type="text" style="margin-right: 20px" v-show="getButtonVial('car:task:create')">修改</el-button>
            </router-link>
            <el-button type="text" @click="deleteTask()" v-show="getButtonVial('car:task:del')">删除</el-button>
          </el-col>
        </el-row>
        <el-row style="padding: 15px 0">
          <el-form :model="task" style="margin: 0;padding: 0" labelPosition="right" label-width="100px">
            <el-col :span="6" align="left" style="text-align: left">
              <el-form-item label="任务编号" align="left" style="margin: 0;text-align: left">
                {{task.taskNo?task.taskNo:'--'}}
              </el-form-item>
              <el-form-item label="任务名称" align="left" style="margin: 0;text-align: left">
                {{task.taskName?task.taskName:'--'}}
              </el-form-item>
              <el-form-item label="分析状态" align="left" style="margin: 0;text-align: left">
                <span
                  v-bind:style="{fontSize:'15px',color:task.status=='running'?'#6799FD':task.status =='finish'?'#00C755':task.status=='waiting'?'#FF9900':task.status =='killed'?'#999':task.status === 'failed' ? '#dd6161' :'#333'}">
                  {{task.status==="running" ? "进行中": task.status === "finish" ? "已完成" :task.status==="waiting" ? "等待中": task.status === "killed" ? "终止" :task.status === "failed" ? "失败" : "--"}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6" align="left">
              <el-form-item label="分析对象" align="left" style="margin: 0;text-align: left">
                {{'['+(task.atype=='imsi'?'IMSI':'车牌')+']'+(task.followTarget?task.followTarget:'--')+(task.atype=='car'?
                ' | '+task.carLicenseKind:'')}}
              </el-form-item>
              <el-form-item align="left" style="margin: 0;text-align: left" v-if="task.atype=='car'">
                <img :src="imgUrl?imgUrl:imgPath" :onerror="img404" onclick="javascript:window.open(this.src)"
                     style="max-height:50px;border-radius:4px;cursor:pointer"/>
              </el-form-item>
              <el-form-item label="分析类型" align="left" style="margin: 0;text-align: left">
                {{task.atype=='imsi'?'以码找车':task.atype=='car'?'以车找码':'--'}}
              </el-form-item>
            </el-col>
            <el-col :span="6" align="left">
              <el-form-item label="分析场所" align="left" style="margin: 0;text-align: left">
                <div class="text-overflow-s" title="task.place?task.place:'--'" :title="task.place?task.place:'--'">
                  {{task.place?task.place:'--'}}
                </div>
              </el-form-item>
              <el-form-item label="日期范围" align="left" style="margin: 0;text-align: left">
                {{(task.startStr?task.startStr:'--')+' 至 '+ (task.endStr?task.endStr:'--')}}
              </el-form-item>
              <el-form-item label="时间范围" align="left" style="margin: 0;text-align: left">
                {{(task.repeatStartTime?task.repeatStartTime:'--')+' 至 '+ (task.repeatEndTime?task.repeatEndTime:'--')}}
              </el-form-item>
              <el-form-item label="时间间隔" align="left" style="margin: 0;text-align: left">
                {{task.interval==0?0:task.interval}}
              </el-form-item>
            </el-col>
            <el-col :span="6" align="right">
              <el-form-item label="创建时间" align="left" style="margin: 0;text-align: left">
                {{task.timeStr?task.timeStr:'--'}}
              </el-form-item>
              <el-form-item label="创建用户" align="left" style="margin: 0;text-align: left">
                {{task.creatorName?task.creatorName:'--'}}
              </el-form-item>
              <el-form-item label="关联案件" align="left" style="margin: 0;text-align: left">
                <div class="btn-case" @click="gotoCaseDetail()" :title="task.caseName?task.caseName:'--'">
                  {{task.caseName?task.caseName:'--'}}
                </div>
              </el-form-item>
            </el-col>
          </el-form>
        </el-row>
      </div>
      <div class="add-appdiv dialog" style="padding:10px 0 0 0">
        <div style="font-size:15px;padding:0 20px 10px 20px;text-align:left;border-bottom:1px #D7D7D7 solid">
          分析结果
        </div>
        <div style="padding: 0 15px">
          <carResult v-if="atype=='imsi'"></carResult>
          <imsiResult v-if="atype=='car'"></imsiResult>
        </div>
      </div>
    </section>
  </div>
</template>
<script>
  import {formatDate, buttonValidator} from "../../../assets/js/util";
  import carResult from '../cartask/CarResult.vue';
  import imsiResult from '../cartask/IMSIResult.vue';

  export default {
    components: {carResult, imsiResult},
    data() {
      return {
        task: {},
        imgPath: require('../../../assets/img/icon_img.svg'),
        img404: "this.onerror='';this.src='" + require('../../../assets/img/icon_img.svg') + "'",
        taskNo: this.$route.query.no || '',
        atype: this.$route.query.atype || '',
        results: [],
        queryResult: {page: 1, size: 10},
        listLoading: false,
        imgUrl: '',
        count: 0,
        records: [],
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //跳转案件详情页
      gotoCaseDetail() {
        if (this.task.caseId) {
          let routeData = this.$router.resolve({path: '/caseDetail', query: {caseId: this.task.caseId}});
          window.open(routeData.href, '_blank');
        }
      },
      //删除伴随任务
      deleteTask() {
        this.$confirm('确认要删除该任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/car/task/del', {taskNoList: [this.taskNo]}, '删除成功').then((data) => {
            if ("000000" === data.code) {
              this.$router.replace("/carTaskList");
            }
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //获取伴随详情
      getTaskDetail() {
        this.$post('/car/task/detail', {taskNo: this.taskNo}).then((data) => {
          this.task = data.data;
          this.task.place = '--';
          if (!!this.task.placeList) {
            let places = [];
            this.task.placeList.forEach((item) => {
              places.push(item.placeName);
            });
            this.task.place = places.join("，");
          }
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss');
          this.task.startStr = formatDate(new Date(this.task.startDate * 1000), 'yyyy-MM-dd');
          this.task.endStr = formatDate(new Date(this.task.endDate * 1000), 'yyyy-MM-dd');
          if (this.atype == 'car') {
            this.getCarImg();
          }
        }).catch((err) => {
        });
      },
      getCarImg() {
        var param = {carLicense: this.task.followTarget, carLicenseKind: this.task.carLicenseKind};
        this.$post('/car/image/query', param).then((data) => {
          if ("000000" === data.code) {
            this.imgUrl = data.data;
          }
        });
      }
    },
    mounted() {
      this.taskNo = this.$route.query.no || '';
      this.atype = this.$route.query.atype || '';

      this.getTaskDetail();
    }
  }
</script>
