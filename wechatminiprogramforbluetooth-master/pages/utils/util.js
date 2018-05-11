function getLocation(callback) {
  wx.getLocation({
    success: function(res) {
      callback(true, res.latitude, res.longitude);
    },
    fail: function() {
      callback(false);
    }
  })
}

function getCityName(latitude, longitude, callback) {

  var apiUrl = "http://api.map.baidu.com/geocoder/v2/?output=json&location=" + latitude + "," + longitude + "&ak=03NUEPARQtSvGLDEzX2Saq80q3sggwFG";

  wx.request({
    url: apiUrl,
    success: function (res) {
      console.log(res);
      callback(res.data["result"]["addressComponent"]["city"]);
    }
  });

}

function getWeatherByCityname(city, callback) {
  var apiUrl ="https://free-api.heweather.com/s6/weather?";
  var param = {
    key: "2749fb13279c4d0eaa4b085d4aa6f37e",
    location: city
  }
  wx.request({
    url: apiUrl,
    data: param,
    header: {
      'content-type': 'application/json'
    },
    success: function(res) {
      callback(res)
    }
  });
}

function loadWeatherData(callback) {
  getLocation(function (success, latitude, longitude) {

    //如果 GPS 信息获取不成功， 设置一个默认坐标
    if (success == false) {

      latitude = 39.90403;
      longitude = 116.407526;
    
    }
    console.log(latitude, longitude)
    getCityName(latitude, longitude, function(city){
      city = city.substring(0, city.length - 1);
      console.log(city)
      getWeatherByCityname(city, function(weather){
        callback(weather)
        console.log(weather)
      })
    })
  })
  
 
}

module.exports = {
  loadWeatherData: loadWeatherData
}