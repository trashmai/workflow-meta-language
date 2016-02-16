(function (window) {

  'use strict';

  $wf = window.$wf;

  $wf.C = $wf.C || {};


  $wf.C.outputResult = function () {
    var argStr = 'RedListClass,RedListClass.C,RedListClass.C1,RedListClass.C2,RedListClass.C2a,RedListClass.C2b';
    var data = $wf._toJsonData(argStr, false);
    var rc = ['NF', 'VU', 'EN','CR'];
    var C = rc.indexOf(data['RedListClass.C']);
    var C1 = rc.indexOf(data['RedListClass.C1']);
    var C2 = rc.indexOf(data['RedListClass.C2']);
    var C2a = rc.indexOf(data['RedListClass.C2a']);
    var C2b = rc.indexOf(data['RedListClass.C2b']);
    var res = rc[Math.max(Math.max(C1, C2), C)];
    var res_sub = [];

    var sub_2a = '', sub_2b = '';

    var c2a = [], c2b = [];

    if (data['RedListClass'] == 'NF') {
      return 'Not Feasible';
    }

    if (data['RedListClass.C1'] != 'NF') res_sub.push('C1');


    if (data['RedListClass.C2a'] != 'NF') {
      sub_2a = 'a' + data['RedListClass.C2a'];
      c2a.push(sub_2a);
    }

    if (data['RedListClass.C2b'] != 'NF') {
      sub_2b = 'b' + data['RedListClass.C2b'];
      c2b.push(sub_2b);
    }

    c2a.join(',');
    c2b.join(',');

    if (c2a != '') {
      res_sub.push(c2a);
    }
    if (c2b != '') {
      res_sub.push(c2b);
    }

    if (res_sub.length == 0) res = 'NF';

    var m;
    if (res != 'NF') {
      res = res + ' ' + res_sub.join('+');
      m = res;
      $wf.o(m, 'color:red;', 'h1');
    }
    else {
      m = 'Not Feasible';
      $wf.o(m, 'color:red;', 'h1');
    }
    return m;
  }


}) (window);
