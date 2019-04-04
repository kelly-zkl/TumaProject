<template>
  <div>
    <section class="content">
      <div class="help-title">设置数据集</div>
      <el-row :gutter="10">
        <el-col :span="12">
          <img style="max-width:100%" src="../../../assets/img/data1.png" onclick="javascript:window.open(this.src)">
        </el-col>
        <el-col :span="12">
          <div class="div-title">1.添加源数据</div>
          <div class="div-content">在工具栏中，点击“添加数据源”图标，即添加了一个数据源； 同时会弹出“设定条件”面板。
          </div>
          <div class="div-title">2.设定筛选条件</div>
          <div class="div-content">在弹出的“设定条件”面板中，根据侦查需要，设立筛选条件； 设置完毕后，点击“保存”按钮，即可完成数据集添加。 (注：重复以上步骤，创建多个数据集）</div>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <img style="max-width:100%" src="../../../assets/img/data2.png">
        </el-col>
        <el-col :span="12">
          <div class="div-title">3.管理数据集</div>
          <div class="div-content"><i class="fa fa-filter btn-icon"></i><span>修改条件</span></div>
          <div class="div-content"><i class="fa fa-file-text-o btn-icon"></i><span>查看数据集</span></div>
          <div class="div-content"><i class="fa fa-bar-chart btn-icon"></i><span>查看统计</span></div>
        </el-col>
      </el-row>
      <div class="help-title">创建交并差分析任务</div>
      <el-row :gutter="10">
        <el-col :span="12">
          <img style="max-width:100%" src="../../../assets/img/result1.png" onclick="javascript:window.open(this.src)">
        </el-col>
        <el-col :span="12">
          <div class="div-title">1.选择两组数据</div>
          <div class="div-content">在数据源板块与交兵分析结果板块，任意勾选两组（或以上）的数据；</div>
          <div class="div-title">2.设定交、并、差分析规则</div>
          <div class="div-content">选择两组数据集后，在工具栏中设定分析规则，即自动生成一条新的交并分析任务；</div>
          <div class="div-content">交集：在已选的N组数据集中，都出现了的IMSI；</div>
          <div class="div-content">并集：在已选的N组数据集中，分别出现了的IMSI；</div>
          <div class="div-content">差集：在已选的N组数据集中，仅在第一组出现了的IMSI；</div>
        </el-col>
      </el-row>
      <el-row :gutter="10">
        <el-col :span="12">
          <img style="max-width:100%" src="../../../assets/img/result2.png" onclick="javascript:window.open(this.src)">
        </el-col>
        <el-col :span="12">
          <div class="div-title">3.交并分析结果管理</div>
          <div class="div-content"><i class="fa fa-list-alt btn-icon"></i><span>查看交并分析结果</span></div>
          <div class="div-content">
            <i class="fa fa-bar-chart btn-icon"></i><span>查看分析结果的数据统计（把本次结果中IMSI的源记录进行统计）</span>
          </div>
          <div class="div-content"><i class="fa fa-stop-circle btn-icon"></i><span>终止分析中的任务</span></div>
          <div class="div-content"><i class="fa fa-repeat btn-icon"></i><span>重新分析任务</span></div>
          <div class="div-content"><span>分析方式：变更分析规则（变更后，本条任务将立即重新分析，原记录不保存。）</span>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>
<style scoped>
  .help-title {
    text-align: center;
    font-size: 16px;
    color: #000;
    font-weight: bold;
    margin: 15px 0;
  }

  .div-title {
    font-size: 15px;
    color: #000;
    font-weight: bold;
    text-align: left;
    margin-bottom: 10px
  }

  .div-content {
    font-size: 14px;
    text-align: left;
    margin-bottom: 10px;
    margin-left: 15px;
  }

  .btn-icon {
    color: #6799FD;
    margin-right: 10px;
    font-size: 20px
  }
</style>
