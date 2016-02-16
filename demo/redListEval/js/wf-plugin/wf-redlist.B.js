(function (window) {

  'use strict';

  $wf = window.$wf;

  $wf.B = $wf.B || {};

  $wf.B.pre_fromAOO = function (data) {
    $wf.e("pre_fromAOO");
    $wf.e(JSON.stringify(data));
    return {oo_type: 'aoo', n1: $wf._get_value('n1')};
  }

  $wf.B.fromAOO = function (api_data, argStr) {
    if (api_data) return JSON.parse(api_data)['aoo'];

    var pickValue = function (argName, argValue) {
      if (argValue !== undefined) {
        pickValue.pickedArgName = argName;
        pickValue.pickedArgValue = argValue;
        return false; // stop callback
      }
      else {
//        pickValue.pickedArgValue = 56;
//        $wf.o(pickValue.pickedArgValue + ' is made-up for testing.', 'color:red', 'h1');
        $wf.e('Nothing ('+argName+') is really picked up so keep looping.');
      }
    }

    var data = $wf._toJsonData(argStr, false, pickValue);

    var picked = pickValue.pickedArgValue;

    if (picked === undefined) {
      return NaN
    }
    else {
      return picked;
    }

  }

  // prepare query parameters for api
  $wf.B.pre_fromEOO = function (data) {
    $wf.e("pre_fromEOO");
    $wf.e(JSON.stringify(data));
    return {oo_type: 'eoo', n1: $wf._get_value('n1')};
  }

  $wf.B.fromEOO = function (api_data, argStr) {

    if (api_data) return JSON.parse(api_data)['eoo'];

    var pickValue = function (argName, argValue) {
      if (argValue !== undefined) {
        pickValue.pickedArgName = argName;
        pickValue.pickedArgValue = argValue;
        return false; // stop callback
      }
      else {
//        pickValue.pickedArgValue = i19999;
//        $wf.o(pickValue.pickedArgValue + ' is made-up for testing.', 'color:red', 'h1');
        $wf.e('Nothing ('+argName+') is really picked up so keep looping.');
      }
    }

    var data = $wf._toJsonData(argStr, false, pickValue);

    var picked = pickValue.pickedArgValue;

    if (picked === undefined) {
      return NaN
    }
    else {
      return picked;
    }
  }

  $wf.B.NumberOfLocationsOrSubpopulations = function (api_data, argStr) {
    if (api_data) return api_data;

    var data = $wf._toJsonData(argStr, false);

    if (!!data.b15) {
      return data.b15;
    }
    else {
      return NaN;
    }
  }

  $wf.B.NumOfGoingDown = function (api_data, argStr){
    if (api_data) return api_data;
    var data = $wf._toJsonData(argStr, false);
    var num = 0;
    var Bb = [];

    if (data.b17 == 'A') num++;
    if (data.b18 == 'A') {
      Bb.push('(i)');
      Bb.push('(iii)');
    }
    else if (['B','C','D'].indexOf(data.b18)) {
      Bb.push('(ii)');
      Bb.push('(iii)');
    }
    if (data.b23 == 'A' || data.b24 == 'A') {
      num++;
      Bb.push('(iv)');
    }
    if (data.b26 == 'A' || data.b27 == 'A') {
      num++;
      Bb.push('(v)');
    }

    if (num > 0) {
      $wf._set_value(['RedListClass.Bb',Bb.join('')]);
    }

    return num;
  }

  $wf.B.NumOfCriticalChanges = function (api_data, argStr) {
    if (api_data) return api_data;
    var data = $wf._toJsonData(argStr, false);
    var num = 0;
    var Bc = [];

    // test output
    data.b29 = 'Y';

    if (data.b29 == 'Y') num++;

    if (data.b30 == 'A') {
      Bc.push('(i)');
    }
    else if (['B','C','D'].indexOf(data.b30)) {
      Bc.push('(ii)');
    }

    if (data.b33 == 'Y') {
      num++;
      Bc.push('(iii)');
    }

    if (data.b35 == 'Y') {
      num++;
      Bc.push('(iv)');

    }
    if (num > 0) {
      $wf._set_value(['RedListClass.Bc',Bc.join('')]);
    }

    return num;
  }

  $wf.B.b1b2_sustained = function (api_data, argStr) {
    if (api_data) return api_data;
    var data = $wf._toJsonData(argStr, false);
    var num = 0;
    if (data['RedListClass.Ba'] != 'NF') num++;
    if (data['RedListClass.Bb'] != 'NF') num++;
    if (data['RedListClass.Bc'] != 'NF') num++;
    if (num > 1) {
      return 'Y';
    }
    $wf.m(JSON.stringify($wf.B));
    return 'N';
  }

  $wf.B.outputResult = function () {
    var argStr = 'RedListClass,RedListClass.B1,RedListClass.B2,RedListClass.Ba,RedListClass.Bb,RedListClass.Bc';
    var data = $wf._toJsonData(argStr, false);
    var rc = ['NF', 'VU', 'EN','CR'];
    var B = rc.indexOf(data['RedListClass']);
    var B1 = rc.indexOf(data['RedListClass.B1']);
    var B2 = rc.indexOf(data['RedListClass.B2']);
    var Ba = rc.indexOf(data['RedListClass.Ba']);
    var res = rc[Math.max(Math.max(Math.max(B1, B2), Ba),B)];
    var res_sub = [];

    var sub_a = '', sub_b = '', sub_c = '';

    var b1 = [], b2 = [];

    if (data['RedListClass.Ba'] != 'NF') {
      sub_a = 'a' + data['RedListClass.Ba'];
      b1.push(sub_a);
      b2.push(sub_a);
    }

    if (data['RedListClass.Bb'] != 'NF') {
      sub_b = 'b' + data['RedListClass.Bb'];
      b1.push(sub_b);
      b2.push(sub_b);
    }

    if (data['RedListClass.Bc'] != 'NF') {
      sub_c = 'c' + data['RedListClass.Bc'];
      b1.push(sub_c);
      b2.push(sub_c);
    }

    b1.join(',');
    b2.join(',');

    if (b1 != '' && data['RedListClass.B1'] != 'NF') {
      res_sub.push('B1'+b1);
    }
    if (b2 != '' && data['RedListClass.B2'] != 'NF') {
      res_sub.push('B2'+b2);
    }

    var m;
    if (res != 'NF') {
      res = res + ' ' + res_sub.join('+');
      m = res;
      $wf.o(m, 'color:red;', 'h1');
    }
    else {
      m = 'Not Feasible';
      $wf.o('Not Feasible', 'color:red;', 'h1');
    }
    return m;
  }


}) (window);
