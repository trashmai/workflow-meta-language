(function (window) {

  'use strict';
  var $wf = window.$wf;
  if (!$wf) $wf = {};
  $wf.D = $wf.D || {};


  $wf.D.outputResult = function () {
    var argStr = 'RedListClass,Subcriteria';
    var data = $wf._toJsonData(argStr, false);

    var exception_status = ['NF','DD','LC'];
    var exception_status_idx = exception_status.indexOf(data.RedListClass);

    if (!!data.RedListClass && exception_status_idx == -1 && !!data.Subcriteria) {
      return data.RedListClass + ' ' + data.Subcriteria;
    }
    else {
      return exception_status[exception_status_idx];
    }
  }


}) (window);
