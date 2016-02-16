(function (window) {

  'use strict';

  $wf = window.$wf;

  $wf['B'] = {};

  $wf['B'].pre_fromAOO = function (data) {
    $wf.e("pre_fromAOO");
    $wf.e(JSON.stringify(data));
    return {oo_type: 'aoo', n1: $wf._get_value('n1')};
  }

  $wf['B'].fromAOO = function (api_data, argStr) {

    if (api_data) return JSON.parse(api_data)['aoo'];

    var b = {};
    var picked = undefined;
    argStr.split(',').every(function (arg, idx) {
      b[arg] = $wf._get_value(arg, false);
      if ((picked === undefined)&&(b[arg])) {
        picked = b[arg];
        return false;
      }
      return true;
    });
    if (picked === undefined) {
      return Infinity
    }
    else {
      return picked;
    }
  }

  $wf['B'].pre_fromEOO = function (data) {
    $wf.e("pre_fromEOO");
    $wf.e(JSON.stringify(data));
    return {oo_type: 'eoo', n1: $wf._get_value('n1')};
  }

  $wf['B'].fromEOO = function (api_data, argStr) {

    if (api_data) return JSON.parse(api_data)['eoo'];

    var b = {};
    var picked = undefined;
    argStr.split(',').every(function (arg, idx) {
      b[arg] = $wf._get_value(arg, false);
      if ((picked === undefined)&&(b[arg])) {
        picked = b[arg];
        return false;
      }
      return true;
    });
    if (picked === undefined) {
      return Infinity
    }
    else {
      return picked;
    }
  }

  $wf['B'].bsubTwoOutOfThree1 = function (api_data, argStr) {
    var data = $wf._toJsonData(argStr);
    // Ba
    var B1_count = 0;
    data.b15 = Number(data.b15);
    var B1 = '';
    if (!isNaN(data.b15)) {
      if (data.b15 == 1) {
        _set_value(['RedListClass.Ba', 'VU']);
        B1_count+=1;
        B1 += 'a';
      }
      else if (data.b15 < 5) {
        _set_value(['RedListClass.Ba', 'EN']);
        B1_count+=1;
        B1 += 'a';
      }
      else if (data.b15 < 10) {
        _set_value(['RedListClass.Ba', 'CR']);
        B1_count+=1;
        B1 += 'a';
      }
      else {
        _set_value(['RedListClass.Ba', 'NF']);
      }
    }

    // B1b(i,ii,iii)
    var B1b_count = 0;
    var B1b = '';
    if (data.b17 === 'A') {
      if (data.b18 === 'B' || data.b18 === 'C' || data.b18 === 'D') {
        B1b += '(i)(iii)';
        B1b_count +=1;
      }
      else if (data.b18 === 'A') {
        B1b += '(ii)(iii)';
        B1b_count +=1;
      }
    }

    // B1b(iv)
    if (data.b23 === 'A' || data.b24 === 'A') {
      B1b += '(iv)';
      B1b_count += 1;
    }

    // B1b(v)
    if (data.b26 === 'A' || data.b27 === 'A') {
      B1b += '(v)';
      B1b_count += 1;
    }

    if (B1b_count) {
      B1 += 'b' + B1b;
      B1_count += 1;
    }

    // B1c (i,ii)
    var B1c_count = 0;
    var B1c = '';
    if (data.b29 === 'Y') {
      if (data.b18 === 'B' || data.b18 === 'C' || data.b18 === 'D') {
        B1c += '(i)';
        B1c_count +=1;
      }
      else if (data.b18 === 'A') {
        B1c += '(ii)';
        B1c_count +=1;
      }
    }

    // B1c(iii)
    if (data.b33 === 'Y') {
      B1c += '(iii)';
      B1c_count += 1;
    }

    // B1c(iv)
    if (data.b35 === 'Y') {
      B1c += '(iv)';
      B1c_count += 1;
    }

    if (B1c_count) {
      B1 += 'c' + B1c;
      B1_count += 1;
    }

    if (B1_count > 1) {
      return B1;
    }
    else {
      return 'NF';
    }

  }

}) (window);
