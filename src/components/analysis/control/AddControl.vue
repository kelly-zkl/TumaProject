<template>
  <div>
    <section class="content">
      <el-form ref="controlTask" :model="controlTask" label-position="left" label-width="120px" :rules="rules">
        <h5 class="add-label" style="margin-top: 0">关联案件</h5>
        <div class="add-appdiv">
          <el-form-item label="设置案件" align="left" style="margin:0" prop="caseId">
            <el-select v-model="controlTask.caseId" placeholder="选择案件" filterable clearable>
              <el-option v-for="item in cases" :key="item.id" :label="item.caseName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <h5 class="add-label">设置布控场所</h5>
        <div class="add-appdiv">
          <el-form-item label="设置场所" align="left" style="margin:0" prop="placeList">
            <el-select v-model="controlTask.placeList" placeholder="布控场所" size="medium" filterable multiple clearable
                       collapse-tags>
              <el-option v-for="item in places" :key="item.id" :label="item.placeName" :value="item.id">
              </el-option>
            </el-select>
            <el-button type="primary" size="medium" @click="mapVisible=true" style="margin-left: 10px">地图选择</el-button>
          </el-form-item>
        </div>
        <h5 class="add-label">设置布控人员</h5>
        <div class="add-appdiv">
          <el-form-item label="特征布控" align="left" style="margin: 0">
            <el-upload :action="uploadUrl" list-type="picture-card" :before-remove="beforeRemove"
                       :on-change="handleChange" :limit="20">
              <div class="el-upload__text" style="color: #777">上传头像</div>
            </el-upload>
            <el-row style="margin-top: 15px">
              <el-col :span="24">
                <el-tag :key="tag" v-for="tag in controlTask.imsiList" closable hit
                        :disable-transitions="false" @close="handleClose(tag)">{{tag}}
                </el-tag>
                <el-input class="input-tag" v-show="inputVisible && controlTask.imsiList.length<20" v-model="inputValue"
                          ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" :maxlength="15"
                          @blur="handleInputConfirm">
                </el-input>
                <el-button v-show="!inputVisible && controlTask.imsiList.length<20" class="button-tag" size="small"
                           @click="showInput" type="primary" icon="el-icon-plus">IMSI
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </div>
        <h5 class="add-label">设置布控周期</h5>
        <div class="add-appdiv">
          <el-form-item label="重复周期" align="left" required>
            <el-radio-group v-model="controlTask.cycleType" size="medium">
              <el-radio-button label="EVERYDAY">每天</el-radio-button>
              <el-radio-button label="WEEKLY">每周</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item align="left" v-show="controlTask.cycleType=='WEEKLY'">
            <el-checkbox-group v-model="controlTask.week" size="medium">
              <el-checkbox-button v-for="item in weeks" :key="item.value" :label="item.value">{{item.label}}
              </el-checkbox-button>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="每日时段" style="margin:0" align="left" required>
            <el-radio-group v-model="controlTask.intervalType" size="medium">
              <el-radio-button label="ALLDAY">全天</el-radio-button>
              <el-radio-button label="CUSTOM">自定义</el-radio-button>
            </el-radio-group>
            <el-time-picker is-range v-model="controlTask.timerange" range-separator="至" start-placeholder="开始时间"
                            end-placeholder="结束时间" placeholder="选择时间范围" v-show="controlTask.intervalType=='CUSTOM'"
                            size="medium" style="margin-left: 10px" value-format="HH:mm:ss">
            </el-time-picker>
          </el-form-item>
        </div>
        <h5 class="add-label">设置布控有效期</h5>
        <div class="add-appdiv">
          <el-form-item label="布控有效期" style="margin:0" align="left" prop="startDate">
            <el-date-picker v-model="controlTask.startDate" type="datetimerange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" clearable
                            :default-time="['00:00:00', '23:59:59']" value-format="timestamp" format="yyyy-MM-dd">
            </el-date-picker>
          </el-form-item>
        </div>
      </el-form>
      <div class="block" style="margin-top: 30px">
        <el-button type="primary" @click="createControlTask()">确认创建布控</el-button>
      </div>
      <!--在地图上选择场所-->
      <el-dialog title="选择场所" :visible.sync="mapVisible">
        <PlaceMap @getPlaceList="getPlaceList"></PlaceMap>
        <div class="block" style="margin-top: 20px">
          <el-button @click="mapVisible = false">取消</el-button>
          <el-button type="primary" @click="setPlaceList">确定</el-button>
        </div>
      </el-dialog>
    </section>
  </div>
</template>
<script>
  import {numValid} from "../../../assets/js/api";
  import PlaceMap from '../PlaceMap';

  export default {
    data() {
      let nameValidator = (rule, value, callback) => {
        if (!/[A-Za-z0-9_\u4e00-\u9fa5]$/.test(value)) {
          callback(new Error("由汉字、数字、英文字母、下划线组成"));
        } else {
          callback();
        }
      };
      let noValidator = (rule, value, callback) => {
        if (!/[a-zA-Z0-9_]$/.test(value)) {
          callback(new Error("由英文字母、数字、下划线组成"));
        } else {
          callback();
        }
      };
      return {
        mapVisible: false,
        controlTask: {cycleType: 'EVERYDAY', intervalType: 'ALLDAY', week: [], imsiList: [], featureList: []},
        cases: [],
        places: [],
        placeList: [],
        inputVisible: false,
        inputValue: '',
        uploadUrl: this.axios.defaults.baseURL + 'file/upload',
        weeks: [{label: '周一', value: 0}, {label: '周二', value: 1}, {label: '周三', value: 2}, {label: '周四', value: 3},
          {label: '周五', value: 4}, {label: '周六', value: 5}, {label: '周日', value: 6}],
        rules: {
          caseId: [
            {required: true, message: '请选择案件', trigger: 'blur'}
          ],
          placeList: [
            {required: true, message: '请选择布控场所', trigger: 'blur'}
          ],
          startDate: [
            {required: true, message: '请选择布控有效期', trigger: 'blur'}
          ]
        }
      }
    },
    methods: {
      //地图选择场所
      setPlaceList() {
        this.controlTask.placeList = this.placeList;
        this.mapVisible = false;
      },
      //获得地图选择的场所
      getPlaceList(pos) {
        this.placeList = pos;
        // console.log(pos);
      },
      //图像个数变化
      handleChange(file, fileList) {
        this.controlTask.featureList = [];
        fileList.forEach((item) => {
          if (item.status === 'success') {
            let data = item.response;
            if ('000000' === data.code) {
              let img = {};
              img.imageUrl = data.data.fileUrl;
              this.controlTask.featureList.push(img);
            }
          }
        });
      },
      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },
      //删除标签
      handleClose(tag) {
        this.controlTask.imsiList.splice(this.controlTask.imsiList.indexOf(tag), 1);
      },
      //输入频点
      showInput() {
        this.inputVisible = true;
        this.$nextTick(() => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      //输入框回车添加tag标签
      handleInputConfirm() {
        let inputValue = this.inputValue;
        if (inputValue) {
          if (!numValid(inputValue) || inputValue.length != 15) {
            this.$message.error('请输入15位正确的IMSI');
            return;
          }
          if (this.isMultiple(inputValue)) {
            this.controlTask.imsiList.push(inputValue);
          }
        }
        this.inputVisible = false;
        this.inputValue = '';
      },
      //是否重复
      isMultiple(val) {
        let bol = true;
        this.controlTask.imsiList.forEach((item) => {
          if (val == item) {
            this.$message.error('重复IMSI');
            bol = false;
          }
        });
        return bol;
      },
      //创建布控任务
      createControlTask() {
        this.$refs['controlTask'].validate((valid) => {
          if (valid) {
            this.controlTask.endTime = this.controlTask.startDate[1] / 1000;
            this.controlTask.startTime = this.controlTask.startDate[0] / 1000;
            if (this.controlTask.cycleType === 'WEEKLY') {//重复周期
              if (this.controlTask.week.length === 0) {
                this.$message.error('请选择重复周期');
                return;
              }
              this.controlTask.weekCycleDay = this.getWeekStr(this.controlTask.week);
            }
            if (this.controlTask.intervalType === 'CUSTOM') {//自定义时段
              if (this.controlTask.timerange.length === 0) {
                this.$message.error('请选择自定义时段');
                return;
              }
              this.controlTask.startTimeInterval = this.controlTask.timerange[0];
              this.controlTask.endTimeInterval = this.controlTask.timerange[1];
            }
            if (this.controlTask.featureList.length === 0 && this.controlTask.imsiList.length === 0) {
              this.$message.error('请设置布控人员特征');
              return;
            }

            this.controlTask.caseName = this.getCaseName();
            this.controlTask.taskStatus = 'EXECUTION';
            delete this.controlTask['startDate'];
            delete this.controlTask['timerange'];
            delete this.controlTask['week'];
            console.log(this.controlTask);
            this.$post("disposition/add", this.controlTask, "创建成功").then((data) => {
              if ("000000" === data.code)
                this.$router.go(-1);
            });
          }
        })
      },
      //转化重复周期
      getWeekStr(val) {
        let str = [0, 0, 0, 0, 0, 0, 0];
        for (let item of val) {
          str[item] = 1;
        }
        let week = str.join("");
        console.log(week);
        return week;
//        let arr = [];
//        for (let i = 0; i <= 6; i++) {
//          if (week.charAt(i) == 1) {
//            arr.push(i);
//          }
//        }
//        console.log(arr);
      },
      //获取案件名称
      getCaseName() {
        for (let item of this.cases) {
          if (item.id === this.controlTask.caseId) {
            return item.caseName;
          }
        }
      },
      //获取案件列表
      getCases() {
        this.$post('/case/query', {page: 1, size: 999999, status: 'EXECUTION'}).then((data) => {
          this.cases = data.data.list;
        }).catch((err) => {
          this.cases = [];
        });
      },
      //布控场所
      getPlaces() {
        this.$post("place/query", {page: 1, size: 999999}).then((data) => {
          this.places = data.data.list;
        }).catch((err) => {
          this.places = [];
        });
      }
    },
    mounted() {
      this.getCases();
      this.getPlaces();
    },
    components: {
      PlaceMap
    }
  }
</script>
