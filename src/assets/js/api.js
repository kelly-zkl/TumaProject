// 处理成json
export const JSONParse = (params) => {
  let jp = '';
  if (!!params) {
    jp = JSON.parse(params);
  }
  return jp;
};
// 验证手机号码
export const mobileValidator2 = (phone) => {
  let bol = true;
  if (!/^1(3|4|5|7|8)\d{0,9}$/.test(phone)) {
    bol = false;
  }
  return bol;
};

// 验证手机号码
export const mobileValidator = (phone) => {
  let bol = true;
  if (!/^1(3|4|5|7|8)\d{9}$/.test(phone)) {
    bol = false;
  }
  return bol;
};
// 验证座机号码
export const telphoneValidator = (phone) => {
  let bol = true;
  if (!/^0\d{2,3}-\d{7,8}$/.test(phone)) {
    bol = false;
  }
  return bol;
};
//小数
export const doubleValid = (num) => {
  let isNum = false;
  if (/^[1-9]$|[1-9][0-9]$|^[1-9][0-9]*\.\d{0,2}$|^[0]\.\d{1,2}$/g.test(num)) {
    isNum = true;
  }
  return isNum;
};
//只能整数
export const numValid = (num) => {
  let isNum = false;
  if (/^[0-9]*$/.test(num)) {
    isNum = true;
  }
  return isNum;
};
//验证所有整数，包括0和正负数整数
export const intValid = (num) => {
  let isNum = false;
  if (/^(0|[1-9][0-9]*|-[1-9][0-9]*)$/.test(num)) {
    isNum = true;
  }
  return isNum;
};
//IP地址
export const ipValid = (num) => {
  let isNum = false;
  if (/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(num)) {
    isNum = true;
  }
  return isNum;
};
//验证MAC地址 短横线或者冒号
export const isMac = (val) => {
  let mac = false;
  if (/^([A-Fa-f0-9]{2}-){5}[A-Fa-f0-9]{2}|([A-Fa-f0-9]{2}:){5}[A-Fa-f0-9]{2}$/.test(val)) {
    mac = true;
  }
  return mac;
};
//验证MAC地址 短横线或者冒号
export const macVal = (val) => {
  let mac = false;
  if (/^([A-Fa-f0-9-]|[A-Fa-f0-9:])*$/.test(val)) {
    mac = true;
  }
  return mac;
};
//验证mcc 移动国家号：000-999 中国：460
export const mccValidator = (mcc) => {
  const reg = /^[0-9]{3}$/;
  return reg.test(mcc);
};
//验证pci 物理小区标识：0-504
export const pciValidator = (pci) => {
  const reg = /^[0-9]{1,3}$/;
  return reg.test(pci);
};
//验证16进制 0001-FFFE 且0000H和FFFFH不可以
export const hexValidator = (hex) => {
  while (hex.length < 4) {//初0成四位
    hex = "0" + hex;
  }
  const regex = /^(?!0000)(?!FFFF)[0-9A-F]{1,4}$/i; //后面的i表示不区分大小写
  if (regex.test(hex)) {
    return true;
  } else {
    return false;
  }
};
// 验证密码  必须包含英文字母和数字
export const pwdValidator = (pwd) => {
  let bol = true;
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,18}$/.test(pwd)) {
    bol = false;
  }
  return bol;
};
//验证密码  英文、数字、下划线
export const pswValidator = (psw) => {
  const reg = /^[\w~!@#$%^&*=+/-]+$/;
  return reg.test(psw);
};
//验证名字 汉字、英文
export const nameValidator = (name) => {
  const reg = /^[\u4e00-\u9fa5A-Za-z·]+$/;
  return reg.test(name);
};
//验证编号  英文、数字、下划线和小数点
export const pcknumValidator = (msg) => {
  const reg = /^[A-Za-z0-9_.]+$/;
  return reg.test(msg);
};
//禁止输入特殊字符(除了英文、字母、下划线以外的字符)
export const noValidator = (msg) => {
  const reg = /^[^A-Za-z0-9_]+$/;
  return reg.test(msg);
};
//禁止输入特殊字符(除了汉字英文、字母、下划线以外的字符)
export const noSValidator = (msg) => {
  const reg = /^[^A-Za-z0-9_\u4e00-\u9fa5]+$/;
  return reg.test(msg);
};
// 图片公用验证 gif / jpg / png / jpeg
export const globalValidImg = (file, msg) => {
  let isJPG = false;
  if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/gif') {
    isJPG = true;
  }
  const isLt1M = file.size / 1024 / 1024 < 2;
  if (!isJPG) {
    msg.error('上传图片只能是jpeg,jpg或者png格式!');
  } else if (!isLt1M) {
    msg.error('上传图片大小不能超过 2MB!');
  }
  return isJPG && isLt1M;
};
//压缩文件验证 *.rar*.zip*.cab*.arj*.lzh*.ace*.7-zip*.tar*.gzip*.uue*.bz2*.jar*.iso*.z
export const globalValidZIP = (file, msg) => {
  let isZIP = false;
  const isLt100M = (file.size / 1024 / 1024 <= 100);
  // file.name.indexOf('.rar') > 0 || || file.name.indexOf('.cab') > 0
  //     || file.name.indexOf('.arj') > 0 || file.name.indexOf('.lzh') > 0 || file.name.indexOf('.ace') > 0
  //     || file.name.indexOf('.7-zip') > 0 || file.name.indexOf('.tar') > 0 || file.name.indexOf('.gzip') > 0
  //     || file.name.indexOf('.uue') > 0 || file.name.indexOf('.bz2') > 0 || file.name.indexOf('.jar') > 0
  //     || file.name.indexOf('.7z') > 0
  if (file.name.indexOf('.zip') > 0) {
    isZIP = true;
  }
  if (!isZIP) {
    msg.error('上传文件只能是ZIP压缩文件!');
  }
  if (!isLt100M) {
    msg.error('上传文件大小不能超过 100MB!');
  }
  return isZIP && isLt100M;
};
//电子表格文件验证 *.xls/* .xlsx/*.xltx
export const globalValidExcel = (file, msg) => {
  let isExcel = false;
  const isLt20M = file.size / 1024 / 1024 <= 45;
  if (file.name.indexOf('.xls') > 0 || file.name.indexOf('.xlsx') > 0 || file.name.indexOf('.xltx')) {
    isExcel = true;
  }
  if (!isExcel) {
    msg.error('上传文件只能是电子表格*.xls/*.xlsx/*.xltx!');
  }
  if (!isLt20M) {
    msg.error('上传文件大小不能超过 45MB!');
  }
  return isExcel && isLt20M;
};
// p12验证--》ios开发证书
export const globalValidP12 = (file, msg) => {
  let isP12 = false;
  if (file.type === 'application/x-pkcs12' || file.name.substring(file.name.length - 4, file.name.length) === '.p12') {
    isP12 = true;
  }
  if (!isP12) {
    msg.error('上传格式只能是p12!');
  }
  return isP12;
};
//身份证号码验证
export const userCardValid = (cardNo) => {
  let isCardNo = false;
// 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
  if (/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(cardNo)) {
    isCardNo = true;
  }
  return isCardNo;
};
//非空判断
export const isNull = (str) => {
  let isNull = false;
  if (str == null || str == undefined || str == '' || str == 'null' || str == 'undefined' || str == 'NAN') {
    isNull = true;
  }
  if (str == 0) {
    isNull = false;
  }
  return isNull;
};
//去掉字符串前后所有空格
export const Trim = (str) => {
  return str.replace(/(^\s*)|(\s*$)/g, "");
};
