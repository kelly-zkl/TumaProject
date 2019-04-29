/**
 * @autor:ycs
 * @date:2017/6/10
 * @email:897710401@qq.com
 */

let CryptoJS = require("crypto-js");
export const getPropFromJSON = (json, name) => {
  if (json === undefined || jQuery.trim(json).length === 0)
    return undefined;
  let obj = JSON.parse(json);
  if (obj === undefined) {
    return undefined;
  }
  return obj[name];
};

export const setPropIfUndefine = (obj, prop, value) => {
  if (obj === null) return;
  if (obj[prop] === undefined) {
    obj[prop] = value;
  }
};

export const setPropFromJSON = (json, name, value) => {
  let target;
  if (json === undefined || jQuery.trim(json).length === 0) {
    target = {};
  } else {
    target = JSON.parse(json);
    if (jQuery.type(target) === "array") {
      target = {}
    }
  }
  target[name] = value;
  let stringify = JSON.stringify(target);
  return stringify;
};

//数据加解密
//加密
export const encryData = (text) => {
  var key = CryptoJS.enc.Utf8.parse('wisec-zkl-2019-04-26');
  var iv = CryptoJS.enc.Utf8.parse('wisec-2017-szcsddfdgfd');
  var encrypted = CryptoJS.AES.encrypt(text, key,
    {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
  return encrypted.toString();    //返回的是base64格式的密文
};
//解密
export const decryData = (text) => {
  var key = CryptoJS.enc.Utf8.parse('wisec-zkl-2019-04-26');
  var iv = CryptoJS.enc.Utf8.parse('wisec-2017-szcsddfdgfd');
  var decrypted = CryptoJS.AES.decrypt(text, key,
    {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export const formatDate = (date, fmt) => {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1,
        (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
};

export const padLeftZero = (str) => {
  return ('00' + str).substr(str.length);
};
// 验证按钮权限
var btnArr = JSON.parse(sessionStorage.getItem("button"));
export const buttonValidator = (button) => {
  if (!btnArr || btnArr.length == 0) {
    btnArr = JSON.parse(sessionStorage.getItem("button"));
  }
  let bol = true;
  if (btnArr) {
    for (let item of btnArr) {
      if (button === item.permissionValue && item.status === 0) {
        bol = true;
        break;
      } else {
        bol = false;
      }
    }
  } else {
    bol = false;
  }
  return bol;
};
//获得省市县
var provinceList = JSON.parse(localStorage.getItem("areas"));
export const getAreaLable = (code) => {
  if (!provinceList || provinceList.length == 0) {
    provinceList = JSON.parse(localStorage.getItem("areas"));
  }
  let lable = '--';
  provinceList.forEach((province) => {
    if (province.subAreas) {
      province.subAreas.forEach((city) => {
        if (city.subAreas) {//省级+市级+县级
          city.subAreas.forEach((country) => {
            if (code === country.areaCode) {
              lable = province.areaName + city.areaName + country.areaName;
            }
          })
        } else {//省级+市级
          if (code === city.areaCode) {
            lable = province.areaName + city.areaName;
          }
        }
      })
    } else {//只包含省级
      if (code === province.areaCode) {
        lable = province.areaName;
      }
    }
  });
  return lable;
};
/**
 * 判断是否是pc设备
 */

export const isPC = () => {
  let flag = false;
  if (window.screen.width >= 768) {
    flag = true;
  }
  return flag;
};
/*验证时间段是否是正常范围*/
export const compareTime = (start, end) => {
  var isRange = true;
  var startTime = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + start).replace(/-/g, '/')).getTime();
  var endTime = new Date((formatDate(new Date(), 'yyyy-MM-dd') + " " + end).replace(/-/g, '/')).getTime();
  if (startTime >= endTime) {
    isRange = false;
  }
  return isRange;
};
