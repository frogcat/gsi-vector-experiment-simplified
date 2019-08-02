var helper = {
  initialized: false,
  onStyleData: function(e) {
    var map = e.target;
    var style = map.getStyle();

    if (helper.initialized === false) {
      helper.loadSprite("https://gsi-cyberjapan.github.io/gsimaps-vector-experiment/sprite/std").then(a => {
        Object.keys(a).forEach(k => {
          var id = "std///" + k;
          if (!map.hasImage(id)) map.addImage(id, a[k]);
        });
      });
      helper.loadSprite("https://gsi-cyberjapan.github.io/gsimaps-vector-experiment/sprite/pale").then(a => {
        Object.keys(a).forEach(k => {
          var id = "pale///" + k;
          if (!map.hasImage(id)) map.addImage(id, a[k]);
        });
      });
      helper.initialized = true;
    }

    style.layers.map(a => a.paint ? a.paint["fill-pattern"] : null).forEach(id => {
      if (id && !map.hasImage(id))
        map.addImage(id, helper.createImageDataFromId(id));
    });
  },
  loadSprite: function(url) {
    return Promise.all([fetch(url + ".json").then(a => a.json()), new Promise(resolve => {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function() {
        var canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        var context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);
        resolve(context);
      };
      img.src = url + ".png";
    })]).then(a => {
      var json = a[0];
      var context = a[1];
      var map = {};
      Object.keys(json).forEach(key => {
        var val = json[key];
        map[key] = context.getImageData(val.x, val.y, val.width, val.height);
      });
      return map;
    });
  },
  createImageDataFromId: function(id) {
    var token = id.replace(/[-,]/g, " ").trim().split(" ");
    var type = token[2];
    var size = parseInt(token[3]);
    var color = {
      r: parseInt(token[4]),
      g: parseInt(token[5]),
      b: parseInt(token[6]),
      a: parseInt(token[7])
    };
    var bgColor = token.length === 12 ? {
      r: parseInt(token[8]),
      g: parseInt(token[9]),
      b: parseInt(token[10]),
      a: parseInt(token[11])
    } : null;
    var imageData = document.createElement("canvas").getContext("2d").createImageData(size, size);
    helper.drawHatch(imageData.data, type, size, color, bgColor);
    return imageData;
  },
  // below is copy of https://github.com/gsi-cyberjapan/gsimaps-vector-experiment/blob/18af463c7d52012be98d5dd361ce03aa18de2705/js/src/map/hatch-imagemanager.js#L78
  drawHatch: function(data, type, size, color, bgColor) {

    if (bgColor) {

      for (var i = 0; i < data.length; i += 4) {
        data[i] = bgColor.r;
        data[i + 1] = bgColor.g;
        data[i + 2] = bgColor.b;
        data[i + 3] = bgColor.a * 255;
      }
    } else {
      for (var i = 0; i < data.length; i++) data[i] = 0;
    }
    // 左上→右下のライン描画
    switch (type) {
      case "ltrb":
      case "cross":
        for (var y = 0; y < size; y++) {
          var idx = (y * size * 4) + y * 4;
          data[idx] = color.r;
          data[idx + 1] = color.g;
          data[idx + 2] = color.b;
          data[idx + 3] = color.a * 255;
        }
        break;

      case "minus":
        for (var x = 1; x < size; x++) {
          var y = 3;
          var idx = (y * size * 4) + x * 4;
          data[idx] = color.r;
          data[idx + 1] = color.g;
          data[idx + 2] = color.b;
          data[idx + 3] = color.a * 255;
        }
        for (var x = 0; x < size - 1; x++) {
          var y = 9;
          var idx = (y * size * 4) + x * 4;
          data[idx] = color.r;
          data[idx + 1] = color.g;
          data[idx + 2] = color.b;
          data[idx + 3] = color.a * 255;
        }
        break;

      case "dot":
        var x = 1;
        var y = 2;
        var idx = (y * size * 4) + x * 4;
        data[idx] = color.r;
        data[idx + 1] = color.g;
        data[idx + 2] = color.b;
        data[idx + 3] = color.a * 255;
        break;

    }

    // 右下→左上のライン描画
    switch (type) {
      case "rtlb":
      case "cross":
        for (var y = 0; y < size; y++) {
          var idx = (y * size * 4) + (size - y - 1) * 4;
          data[idx] = color.r;
          data[idx + 1] = color.g;
          data[idx + 2] = color.b;
          data[idx + 3] = color.a * 255;
        }
        break;
    }
  }

};
