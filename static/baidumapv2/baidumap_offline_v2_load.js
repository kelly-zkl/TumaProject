var bdmapcfg = {
  'off_line': false,//地图瓦片 ----- 是否离线，仅用于地图瓦片；true：内网环境（正式），false：可通外网（调试）
  'imgext': '.jpg', //瓦片图的后缀 ------ 根据需要修改，一般是 .png .jpg
  'tiles_dir': '',   //普通地图瓦片的目录 ----- 用于侦码、图码平台：ip:port/xxx/titles
  'tiles_midnight': '',//午夜蓝瓦地图瓦片的目录为 ----- 用于图码平台首页：ip:port/xxx/tiles_midnight
};

//////////////////下面的保持不动///////////////////////////////////
var scripts = document.getElementsByTagName("script");
var JS__FILE__ = scripts[scripts.length - 1].getAttribute("src");
bdmapcfg.home = JS__FILE__.substr(0, JS__FILE__.lastIndexOf("/") + 1); //地图API主目录, images,tiles都在此目录下
(function () {
  window.BMap_loadScriptTime = (new Date).getTime();
  //加载地图API主文件
  document.write('<script type="text/javascript" src="' + bdmapcfg.home + 'baidumap_offline_v2_20160921_min.js"></script>');
})();
