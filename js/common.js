// By Ates Goral @ http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

var url_query = getQueryParams(document.location.search);

function arrIntersect(arr1, arr2) {
  var tmp_arr2 = [];
  arr2.forEach (function(e) {
    tmp_arr2.push(String(e).trim());
  });
  return arr1.filter(function(n) {
    n = String(n).trim();
    return tmp_arr2.indexOf(n) != -1
  });
}

/**
 * http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function merge_attr(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) {
      if (obj3[attrname] === undefined) obj3[attrname] = {};
      for (var attrVal in obj1[attrname]) {
        obj3[attrname][attrVal] = obj1[attrname][attrVal] || obj3[attrname][attrVal];
      }
    }
    for (var attrname in obj2) {
      if (obj3[attrname] === undefined) obj3[attrname] = {};
      for (var attrVal in obj2[attrname]) {
        obj3[attrname][attrVal] = obj2[attrname][attrVal] || obj3[attrname][attrVal];
      }
    }
    return obj3;
}

function buildOpts (arrVal, arrLabel, selectedVal) {
  var optHtml = '';
  arrVal = arrVal || [];
  arrLabel = arrLabel || arrVal;
  arrVal.forEach(function(v, i) {
    if (v === selectedVal) {
      optHtml += '<option value="'+v+'" selected>'+arrLabel[i]+'</option>';
    }
    else {
      optHtml += '<option value="'+v+'">'+arrLabel[i]+'</option>';
    }
  });
  return optHtml;
}




