(function (window) {

  'use strict';
  var $wf = window.$wf;
  if (!$wf) $wf = {};
  $wf.A = $wf.A || {};

  $wf.A.toYears = function (api_data, argStr) {
    var data = $wf._toJsonData(argStr, false);
    var years = null;
    if (data.a6 == 'G') {
      var years = data.a5 * data.a1;
    }
    else if (data.a6 == 'Y') {
      var years = data.a5;
    }
    return years;
  }

  $wf.A.timePeriod = function (api_data, argStr) {
    // TODO:什麼條件下是跨過去到未來?
    $wf.o ("TODO:Q3什麼條件下是跨過去到未來?", "color:red;", "h2");
    var data = $wf._toJsonData(argStr, false);
    if (data.a4 && data.a5) {
      return "過去";
    }
    else if (data.a9 && data.a5) {
      return "未來";
    }
    return null;
  };

  $wf.A.ifKnowning = function (api_data, argStr) {
    // TODO:判斷Y或N的條件不明確，需要加強
    $wf.o ("TODO:Q4判斷Y或N的條件不明確，需要加強", "color:red;", "h2");
    var data = $wf._toJsonData(argStr, false);
    if (data.a11 === 'B') {
      return 'Y';
    }
    else {
      return 'N';
    }
  }

  $wf.A.getBasis = function (api_data, argStr) {
    // TODO:???
    $wf.o ("TODO:Q6要把細節確認一下", "color:red;", "h2");
    $wf.o ("TODO:Q6 a10的I沒有用到", "color:red;", "h2");
    var data = $wf._toJsonData(argStr, false);
    var subc = [];
    if (['A'].indexOf(data.a8) > -1) {
      subc.push('a');
    }
    if (['A','B'].indexOf(data.a7) > -1) {
      subc.push('b');
    }
    if (data.a10) {
      if (['A'].indexOf(data.a7) > -1 || arrIntersect(data.a10.split(''), ['A']).length > 0) {
        subc.push('c');
      }
      if (arrIntersect(data.a10.split(''), ['B']).length > 0) {
        subc.push('d');
      }
      if (arrIntersect(data.a10.split(''), ['C', 'D', 'E', 'F', 'G', 'H']).length > 0) {
        subc.push('e');
      }
    }
    if (subc.length > 0) {
      return subc.join();
    }
    else {
      return 'N';
    }
  }

  $wf.A.outputResult = function () {
    var m;
    var exception_status = ['NF','DD','LC'];
    var exception_status_idx = exception_status.indexOf($wf.A.RedListClass);
    if (exception_status_idx == -1) {
      m = $wf.A.RedListClass + ' ' + $wf.A.category + $wf.A.subCriteria;
      $wf.o(m, 'color:red;', 'h1');
    }
    else {
      m = exception_status[exception_status_idx];
      $wf.o(m, 'color:red;', 'h1');
    }
    return m;
  }
 

}) (window);
