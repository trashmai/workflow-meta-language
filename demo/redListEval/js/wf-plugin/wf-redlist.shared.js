(function (window) {

  'use strict';
  var $wf = window.$wf;
  if (!$wf) $wf = {};
  $wf.shared = $wf.shared || {};

  $wf.shared.cyAddLabel = function () {
    var vname = $wf[$wf.ns]['欄位編號'];
    var sname = $wf[$wf.ns]['n1'];
    var label = 'Criteria ' + $wf.ns + ': ' + vname + ' (' + sname + ')';
    var classes = 'graph_label';
    var lblNode = {group:'nodes', data:{id:'default_label', name:label, weight:500, faveColor:'#FFF', faveShape:'rectangle', sec:''}, classes: classes};
    $wf.cy_add([lblNode]);

    return vname + '<br/>' + sname;
  }

  $wf.shared.numeric_min = function (api_data, argStr) {
    var data = $wf._toJsonData(argStr, false);
    var min = null;
    for (var i in data) {
      if (data.hasOwnProperty(i)) {
        if ($.isNumeric(data[i]) && min === null) {
          min = data[i];
        }
        else if ($.isNumeric(data[i]) && data[i] < min) {
          min = data[i];
        }
      }
    }
    return min;
  }


}) (window);
