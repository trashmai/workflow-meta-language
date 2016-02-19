(function (window) {

  'use strict';
  var $wf = window.$wf;
  if (!$wf) $wf = {};
  $wf.D = $wf.D || {};


  $wf.D.outputResult = function () {
    var argStr = 'RedListClass,Subcriteria';
    var data = $wf._toJsonData(argStr, false);
    if (!!data.RedListClass && data.RedListClass!='NF' && !!data.Subcriteria) {
      return data.RedListClass + ' ' + data.Subcriteria;
    }
    else {
      return 'Not Feasible';
    }
  }


}) (window);
