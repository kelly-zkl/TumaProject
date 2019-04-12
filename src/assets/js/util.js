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

// Bean: {
//   /**
//    * @param source 网络请求的数据
//    * @param target data声明的对象
//    */
//   copyProperty: function (source, target) {
//     if (source === undefined) source = {};
//     let targetFileds = Object.getOwnPropertyNames(target);
//     let sourceFileds = Object.getOwnPropertyNames(source);
//     let index;
//     for (index in targetFileds) {
//       let filed = targetFileds[index];
//       if (!$.List.contains(sourceFileds, filed)) {
//         source[filed] = undefined;
//       }
//     }
//     return source;
//   },
// },

// List: {
//   contains: function (list, obj) {
//     let index;
//     for (index in list) {
//       if (list[index] === obj) return true;
//     }
//     return false;
//   }
// },


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
//数据加解密

//加密
export const encryData = (text) => {
  // let key = CryptoJS.enc.Utf8.parse("8NONwyJtHesysWpM");
  //
  // let encryptedData = CryptoJS.AES.encrypt(text, key, {
  //   mode: CryptoJS.mode.ECB,
  //   padding: CryptoJS.pad.Pkcs7
  // });
  //需要加密的内容
  var C = CryptoJS;

  var message = C.enc.Utf8.parse('123456789');
  var key = C.enc.Utf8.parse('8NONwyJtHesysWpM');
  var iv = C.enc.Utf8.parse('0000000000000000');


  var str1 = C.AES.encrypt(message, key, {
    iv: iv,
    mode: C.mode.CBC,
    padding: C.pad.NoPadding
  }).ciphertext.toString();
  console.log(str1);
  var str2 = C.AES.decrypt(C.lib.CipherParams.create({ciphertext: C.enc.Hex.parse(str1)}),
    key, {iv: iv, mode: C.mode.CBC, padding: C.pad.NoPadding}).toString();


  console.log(str2)
  return str2;
};
//解密
export const decryData = (text) => {
  let key = CryptoJS.enc.Utf8.parse("8NONwyJtHesysWpM");

  let encryptedData = text.ciphertext.toString();

  let encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedData);
  let encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);

  let decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });

  let decryptedStr = decryptedData.toString(CryptoJS.enc.Utf8);
  return decryptedStr;
};
