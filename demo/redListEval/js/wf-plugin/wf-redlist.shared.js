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
}) (window);
