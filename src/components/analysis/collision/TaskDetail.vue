<template>
  <div>
    <section class="content">
      <div class="add-appdiv">
        <el-row>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 14px;color: #999;margin: 0 20px;">任务名称</p>
            <p style="margin: 5px 20px 0 20px;font-size: 15px">{{task.taskName}}</p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 14px;color: #999;margin: 0 20px;">任务类型</p>
            <p style="margin: 5px 20px 0 20px;font-size: 15px">
              {{collisionType == 'IMSI' ? 'IMSI' : collisionType == 'FACE' ? '图像' : 'MAC'}}
            </p>
          </el-col>
          <el-col :span="6" align="left" style="border-right: 1px #e5e5e5 solid">
            <p style="font-size: 14px;color: #999;margin: 0 20px;">创建时间</p>
            <p style="margin: 5px 20px 0 20px;font-size: 15px">{{task.timeStr}}</p>
          </el-col>
          <el-col :span="6" align="right">
            <el-button type="text" @click="runTaskDetail = true">查看任务</el-button>
            <el-button type="text" @click="deleteTask()" v-show="getButtonVial('collision:delete')">删除任务</el-button>
          </el-col>
        </el-row>
      </div>
      <el-row v-show="activeType == 'IMSI'" style="margin-bottom: 15px">
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="activeItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="分析结果" name="first"></el-tab-pane>
            <el-tab-pane label="归属地统计" name="second"></el-tab-pane>
            <el-tab-pane label="地区统计" name="third"></el-tab-pane>
            <el-tab-pane label="源IMSI记录" name="fourth"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right">
          <el-button type="primary" size="medium" @click="exportData()" v-show="getButtonVial(exportKey)">导出数据
          </el-button>
        </el-col>
      </el-row>
      <div v-show="activeType == 'IMSI'&&activeItem=='second'">
        <regionalCount ref="regionalCount"></regionalCount>
      </div>
      <div v-show="activeType == 'IMSI'&&activeItem=='third'">
        <areaCount ref="areaCount"></areaCount>
      </div>
      <div v-show="activeType == 'IMSI'&&activeItem=='fourth'">
        <imsiList ref="imsiList"></imsiList>
      </div>
      <div class="content" style="margin-left: 10px" v-show="activeType == 'IMSI'&&activeItem=='first'">
        <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('collision:queryResult')">
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.imsi" placeholder="IMSI" size="medium" style="width: 160px"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-select v-model="query.isp" placeholder="运营商" style="width: 120px" size="medium" clearable>
              <el-option v-for="item in operators" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-input v-model="query.regional" placeholder="IMSI归属地" style="width: 160px" size="medium"
                      :maxlength=20></el-input>
          </el-form-item>
          <el-form-item label="条件1出现次数" style="margin-bottom: 10px">
            <el-input v-model="query.count1" type="number" size="medium" style="width: 80px" :maxlength=5></el-input>
          </el-form-item>
          <el-form-item label="条件2出现次数" style="margin-bottom: 10px">
            <el-input v-model="query.count2" type="number" size="medium" style="width: 80px" :maxlength=5></el-input>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
          </el-form-item>
          <el-form-item style="margin-bottom: 10px">
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="IMSI" prop="imsi" min-width="150"
                           max-width="300" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="运营商" prop="isp" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="网络类型" prop="netType" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="IMSI归属地" prop="regional" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="条件1出现次数" prop="imsiCount1" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="条件2出现次数" prop="imsiCount2" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" width="130" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImsi(scope.row.imsi)"
                         v-show="getButtonVial('collision:queryRecord')">查看IMSI
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>
      <el-row v-show="activeType == 'FACE'" style="margin-bottom: 10px">
        <el-col :span="16" align="left" class="tab-card">
          <el-tabs v-model="imageItem" @tab-click="handleType" type="border-card">
            <el-tab-pane label="图像" name="image"></el-tab-pane>
            <el-tab-pane label="图像记录" name="list"></el-tab-pane>
          </el-tabs>
        </el-col>
        <el-col :span="8" align="right">
          <el-button type="primary" size="medium" @click="exportData()" v-show="getButtonVial(exportKey)">导出数据
          </el-button>
        </el-col>
      </el-row>
      <div v-show="activeType == 'FACE'&&imageItem=='list'">
        <imageList ref="imageList"></imageList>
      </div>
      <div class="content" style="margin-left: 10px" v-show="activeType == 'FACE'&&imageItem=='image'">
        <el-form :inline="true" :model="query" align="left" v-show="getButtonVial('collision:queryResult')">
          <el-form-item label="年龄">
            <el-input-number v-model="query.age1" controls-position="right" :min="1"
                             :max="query.age2-1" style="width: 100px" size="medium"></el-input-number>
            <span>~</span>
            <el-input-number v-model="query.age2" controls-position="right" :min="query.age1+1"
                             :max="200" style="width: 100px" size="medium"></el-input-number>
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="query.sex" placeholder="性别" style="width: 100px" size="medium" clearable>
              <el-option v-for="item in sexs" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="条件1出现次数">
            <el-input-number v-model="query.count1" controls-position="right" :min="1"
                             :max="99999" style="width: 100px" size="medium"></el-input-number>
          </el-form-item>
          <el-form-item label="条件2出现次数">
            <el-input-number v-model="query.count2" controls-position="right" :min="1"
                             :max="99999" style="width: 100px" size="medium"></el-input-number>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="medium" @click="query.page=1;getData()">搜索</el-button>
          </el-form-item>
          <el-form-item>
            <el-button size="medium" @click="clearData()">重置</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="records" v-loading="listLoading" class="center-block" stripe>
          <el-table-column align="center" type="index" label="序号" width="65"></el-table-column>
          <el-table-column align="left" label="现场图像" prop="scensePicURL" min-width="125"
                           max-width="250">
            <template slot-scope="scope">
              <img v-bind:src="scope.row.userFacePicURL" @click="bigUrl=scope.row.userFacePicURL;runBigPic=true"
                   style="max-width: 90px;max-height:90px;border-radius: 6px"/>
            </template>
          </el-table-column>
          <el-table-column align="left" label="年龄" prop="age" min-width="125"
                           max-width="250"></el-table-column>
          <el-table-column align="left" label="性别" prop="sex" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="条件1出现次数" prop="faceCount1" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="条件2出现次数" prop="faceCount2" min-width="125"
                           max-width="250" :formatter="formatterAddress"></el-table-column>
          <el-table-column align="left" label="操作" min-width="125" max-width="250" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="gotoImage(scope.row.scensePicURL,scope.row.personID)"
                         v-show="getButtonVial('collision:queryRecord')">查看图像
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="block" style="margin-top: 20px" align="right">
          <el-pagination @size-change="handleSizeChange" @current-change="pageChange" :current-page.sync="query.page"
                         :page-sizes="[10, 15, 20, 30]" :page-size="query.size" :total="count" background
                         layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </div>

      <!--任务详情-->
      <el-dialog title="任务详情" :width="dialogWidth" :visible.sync="runTaskDetail">
        <div class="block gray-form">
          <el-form label-width="100px" :model="task" label-position="right" style="margin-right: 20px">
            <el-form-item label="任务名称" align="left" style="margin: 0">{{task.taskName}}</el-form-item>
            <el-form-item label="创建时间" align="left" style="margin: 0">{{task.timeStr}}</el-form-item>
            <el-form-item label="数据类型" align="left" style="margin: 0">
              {{collisionType == 'IMSI' ? 'IMSI' : collisionType == 'FACE' ? '图像' : 'MAC'}}
            </el-form-item>
            <el-form-item label="数据组合" align="left" style="margin: 0">
              {{task.collisionMode == 'INTERSECT' ? '交集' : task.collisionMode == 'UNION' ? '并集' : '差集'}}
            </el-form-item>
            <el-form-item label="条件1" align="left" style="margin: 0">
              <div v-for="(item,indx) in task.condition1" :key="indx">
                <span
                  style="display:inline-block;width:90%;word-wrap:break-word;white-space:normal">{{item}}</span>
              </div>
            </el-form-item>
            <el-form-item label="条件2" align="left" style="margin: 0">
              <div v-for="(item,indx) in task.condition2" :key="indx">
                <span
                  style="display:inline-block;width:90%;word-wrap:break-word;white-space:normal">{{item}}</span>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
      <!--查看大图-->
      <el-dialog title="查看大图" :visible.sync="runBigPic" width="500px" center>
        <div class="block">
          <el-row>
            <el-col :span="24" style="text-align: center" align="center">
              <img :src="bigUrl" style="max-width: 400px;max-height:400px;border-radius:8px;vertical-align:middle"/>
            </el-col>
          </el-row>
          <div slot="footer" class="dialog-footer" align="center" style="margin-top: 20px">
            <el-button type="primary" @click="runBigPic=false" size="medium">关闭</el-button>
          </div>
        </div>
      </el-dialog>
    </section>
  </div>
</template>

<script>
  import {isNull} from "../../../assets/js/api";
  import {formatDate, isPC, buttonValidator} from "../../../assets/js/util";
  import areaCount from '../collision/AreaCount.vue';
  import regionalCount from '../collision/RegionalCount.vue';
  import imsiList from '../collision/ImsiList.vue';
  import imageList from '../collision/ImageList.vue';

  var fileDownload = require('js-file-download');

  export default {
    data() {
      return {
        dialogWidth: isPC() ? '35%' : '90%',
        taskId: this.$route.query.taskId || '',
        runBigPic: false,
        bigUrl: '',
        collisionType: this.$route.query.collisionType || '',
        activeType: "IMSI",
        activeItem: 'first',
        imageItem: 'image',
        exportKey: 'collision:export:analyze',
        records: [],
        listLoading: false,
        runTaskDetail: false,
        query: {page: 1, size: 10},
        count: 0,
        task: {},
        sexs: [{value: 0, label: '男'}, {value: 1, label: '女'}],
        operators: [{value: 0, label: '移动'}, {value: 1, label: '联通'}, {value: 2, label: '电信'}],
        param: ''
      }
    },
    methods: {
      getButtonVial(msg) {
        return buttonValidator(msg);
      },
      //任务类型-->IMSI、图像、疑似人员
      handleType(tab, event) {
        if (tab.name == 'image' || tab.name == 'first') {
          this.exportKey = 'collision:export:analyze';
        } else if (tab.name == 'fourth' || tab.name == 'list') {
          this.exportKey = 'collision:export:record';
        } else {
          this.exportKey = 'collision:export:regional';
        }
      },
      //碰撞结果导出
      exportData() {
        var param = Object.assign({}, this.query);
        param.page = 1;
        param.size = 100000;
        if ((this.activeType === 'IMSI' && this.activeItem === 'first') || (this.activeType === 'FACE' && this.imageItem === 'image')) {
          this.axios.post('/collision/export/analyze', param, {responseType: 'arraybuffer'}).then((res) => {
            let fileStr = res.headers['content-disposition'].split(";")[1].split("filename=")[1];
            let fileName = decodeURIComponent(fileStr);
            fileDownload(res.data, fileName);
          }).catch(function (res) {
          });
        } else if (this.activeType === 'IMSI' && this.activeItem === 'second') {
          this.$refs.regionalCount.exportData();
        } else if (this.activeType === 'IMSI' && this.activeItem === 'third') {
          this.$refs.areaCount.exportData();
        } else if (this.activeType === 'IMSI' && this.activeItem === 'fourth') {
          this.$refs.imsiList.exportData();
        } else if (this.activeType === 'FACE' && this.imageItem === 'list') {
          this.$refs.imageList.exportData();
        }
      },
      //跳转IMSI记录
      gotoImsi(imsi) {
        // this.$router.push({
        //   path: '/collisionImsiRecords', query: {
        //     taskId: this.taskId,
        //     collisionType: this.collisionType, imsi: imsi
        //   }
        // });
        let routeData = this.$router.resolve({
          path: '/collisionImsiRecords', query: {
            taskId: this.taskId,
            collisionType: this.collisionType, imsi: imsi
          }
        });
        window.open(routeData.href, '_blank');
      },
      //跳转图像记录页面
      gotoImage(pic, personID) {
        // this.$router.push({
        //   path: '/collisionImageRecords', query: {
        //     taskId: this.taskId, personID: personID,
        //     collisionType: this.collisionType, picUrl: pic
        //   }
        // });
        let routeData = this.$router.resolve({
          path: '/collisionImageRecords', query: {
            taskId: this.taskId, personID: personID,
            collisionType: this.collisionType, picUrl: pic
          }
        });
        window.open(routeData.href, '_blank');
      },
      pageChange(index) {
        this.query.page = index;
        this.getData();
      },
      handleSizeChange(val) {
        this.query.size = val;
        this.getData();
      },
      //格式化内容   有数据就展示，没有数据就显示--
      formatterAddress(row, column) {
        if (column.property === 'sex') {//0-男  1-女  2-未知
          return row.sex == 0 ? '男' : row.sex == 1 ? '女' : '--';
        } else if (column.property === 'isp') {
          return row.isp === 0 ? '移动' : row.isp === 1 ? '联通' : row.isp === 2 ? '电信' : '--';
        } else if (column.property === 'netType') {//网络类型 --> 根据运营商判断
          return this.getNetType(row.isp);
        } else if (column.property === 'pushTime') {
          return row.pushTime ? formatDate(new Date(row.pushTime * 1000), 'yyyy-MM-dd hh:mm:ss') : '--';
        } else if (column.property === 'imsiCount1' || column.property === 'imsiCount2' || column.property === 'faceCount1' || column.property === 'faceCount2') {
          return row[column.property];
        } else {
          return row[column.property] && row[column.property] !== "null" ? row[column.property] : '--';
        }
      },
      getNetType(isp) {
        let moduleId = "--";
        switch (isp) {
          case 0:
            moduleId = "CMCC";
            break;
          case 1:
            moduleId = "CMUC";
            break;
          case 2:
            moduleId = "CMTC";
            break;
          default:
            break;
        }
        return moduleId;
      },
      //删除任务
      deleteTask() {
        this.$confirm('确认要删除该任务吗?', '提示', {type: 'info'}).then(() => {
          this.$post('/collision/delete', [this.taskId], '删除成功').then((data) => {
            if ("000000" === data.code)
              this.$router.go(-1);
          }).catch((err) => {
          });
        }).catch(() => {
        });
      },
      //清除查询条件
      clearData() {
        this.query = {page: 1, size: 10};
        this.query.collisionType = this.collisionType;
        this.query.collisionTaskId = this.taskId;
        this.getData();
      },
      //获取记录
      getData() {
        if (this.collisionType === 'FACE') {//人脸
          if (!isNull(this.query.age1) || !isNull(this.query.age2)) {
            if (isNull(this.query.age1) || isNull(this.query.age2)) {
              this.$message.error('请输入正确的年龄范围');
              return;
            } else {
              this.query.age1 = parseInt(this.query.age1);
              this.query.age2 = parseInt(this.query.age2);
              if (this.query.age1 >= this.query.age2) {
                this.$message.error('请输入正确的年龄范围');
                return;
              }
            }
          }
        }

        this.listLoading = true;
        this.$post('/collision/queryResult', this.query).then((data) => {
          this.records = data.data.list;
          this.count = data.data.count;
          this.listLoading = false;
        }).catch((err) => {
          this.records = [];
          this.listLoading = false;
        });
      },
      //任务详情
      taskDetail() {
        this.$post('/collision/get/' + this.taskId, {}).then((data) => {
          this.task = data.data;
          this.task.condition1 = this.task.condition1.split("\r\n");
          this.task.condition2 = this.task.condition2.split("\r\n");
          this.task.timeStr = formatDate(new Date(this.task.createTime * 1000), 'yyyy-MM-dd hh:mm:ss')
        }).catch((err) => {
        });
      }
    },
    mounted() {
      this.taskId = this.$route.query.taskId || '';
      this.collisionType = this.$route.query.collisionType || '';

      this.activeType = this.collisionType;

      this.query.collisionType = this.collisionType;
      this.query.collisionTaskId = this.taskId;

      this.taskDetail();
      this.getData();
    },
    components: {
      areaCount,
      regionalCount,
      imsiList,
      imageList
    }
  }
</script>
