(function (window) {

  'use strict';

  $wf = window.$wf;

  $wf.E = $wf.E || {};


  $wf.E.outputResult = function () {
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
