(function (document, window) {

  'use strict';

  var redListEval = window.redListEval = function () {
    'use strict';

    var display_message = '';
    var ns;
  
    var o = function (txt, styles, wrapper) {

      var beginEl = '';
      var endEl = '';

      if (styles === undefined) {
        styles = 'color:blue;';
      }

      if (wrapper !== undefined) {
        var br = '';
        var els = wrapper.split(' ');
        els.forEach(function (el) {
          beginEl += '<' + el + '>';
          endEl = '</' + el + '>' + endEl;
        });
      }
      else {
        var br = '<br/>';
      }
      //document.write('<i style="' + styles + '">' + txt + '</i><br/>');
      redListEval['shared']['display_message'] += '<span style="' + styles + '">' + beginEl + txt + endEl + '</span>' + br;
      $('div#display_message_box').html(redListEval['shared']['display_message']);
    }
  
    function e (txt) {
      o(txt, 'color:red;');
    }
  
    function m (txt) {
      o(txt, 'color:green;');
    }

    function _op_type (op) {
      var optype = {
        EQ:'comp',
        NE:'comp',
        GT:'comp',
        GTE:'comp',
        LT:'comp',
        LTE:'comp',
        NE:'comp',
        GOTO:'flow',
        SET:'act',
        FUNC:'act',
      }
      return optype[op];
    }

    function _call_function (meta) {
      var funcName = meta[0];
      var argStr = meta[1];
      var api_url = meta[2];
      var async = meta[3];
      o('執行函式:' + funcName + ' 並使用參數:' + argStr + ' 以及來自:api('+api_url+') 的結果.');
      if (typeof redListEval[ns][funcName] === 'function') {
        // redListEval[ns][funcName].retVal = redListEval[ns][funcName](argStr);
        redListEval[ns][funcName].retVal = redListEval[ns].general(argStr, funcName, api_url, async);
        o('Call function redListEval.'+ns+'.'+funcName+' with parameters ' + argStr);
        m('Return value ('  + funcName + '): ' + redListEval[ns][funcName].retVal + '(' + (typeof redListEval[ns][funcName].retVal) + ')');
      }
      else {
        // error
        o('function redListEval.'+ns+'.' + funcName + ' is not found', 'color:red', 'h1');
        throw 'Error: function redListEval.'+ns+'.' + funcName + ' is not found.'
      }
    }

    function _compare (op, a, b) {
      switch (op) {
        case 'eq':
          return (a == b);
          break;
        case 'gt':
          return a > b;
          break;
        case 'gte':
          return a >= b;
          break;
        case 'lt':
          return a < b;
          break;
        case 'lte':
          return a <= b;
          break;
        case 'ne':
          return !(a == b);
          break;
      }
    }

    function _comp_api (meta, op) {
        var a = _get_value(meta[0]);
        var b = _get_value(meta[1]);
        var a_name = meta[0];

        if (['gt', 'gte', 'lt', 'lte'].indexOf(op) > -1) {
          a = Number(a);
          b = Number(b);
        }

        var _comp_res = _compare(op, a, b);

        if (_comp_res) {
          m(String(a) + '('+ (typeof a) +') ' + op + ' ' + String(b) + '('+(typeof b)+')' + ' is ' + _comp_res.toString());
        }
        else {
          e(String(a) + '('+ (typeof a) +') ' + op + ' ' + String(b) + '('+(typeof b)+')' + ' is ' + _comp_res.toString());
        }
        return _comp_res;
    }

    function _get_value(variable, _toString) {
      var tmp_ns = ns;
      var var_root = 0;
      var heirarchical_vars = variable.split('.');
      if (heirarchical_vars[0].match(/^ns:/) !== null) {
        tmp_ns = heirarchical_vars[0].replace(/^ns:/, '');
        var_root = 1;
      }

      var h_var_arr = [];
      var heirarchical_parent = redListEval[tmp_ns];
      var h_len = heirarchical_vars.length;
      for (var h=var_root; h<h_len; h++) {
        h_var_arr.push(heirarchical_vars[h]);
        if (heirarchical_parent[heirarchical_vars[h]] === undefined) {
          var value = undefined;
        }
        else {
          var value = heirarchical_parent[heirarchical_vars[h]];
        }
      }

      var toString = true;
      if (_toString !== undefined) {
        toString = _toString;
      }

      if (typeof value === 'function') {
        value = value.retVal;
        toString = false;
      }

      if (toString) {
        e(h_var_arr.join('.') + ' is not a variable, treated as STRING.');
        return (value===undefined)?String(variable):value;
      }
      else {
        return value;
      }
    }


    function _set_value(meta) {
      var tmp_ns = ns;
      var variable = meta[0];
      var var_root = 0;
      var heirarchical_vars = variable.split('.');
      if (heirarchical_vars[0].match(/^ns:/) !== null) {
        tmp_ns = heirarchical_vars[0].replace(/^ns:/, '');
        var_root = 1;
      }

      var value = _get_value(meta.slice(1).join(' '));

      if (typeof value === 'function') {
        value = value.retVal;
      }

      m('SET ' + variable + ' to ' + value);



      var h_var_arr = [];
      if (redListEval[tmp_ns] === undefined) {
        redListEval[tmp_ns] = {};
      }
      var heirarchical_parent = redListEval[tmp_ns];
      var h_len = heirarchical_vars.length;
      for (var h=var_root; h<h_len-1; h++) {
        h_var_arr.push(heirarchical_vars[h]);
        if (heirarchical_parent[heirarchical_vars[h]] === undefined) {
          e('Variable ' + h_var_arr.join('.') + ' doesn\'t exist, create now');
          heirarchical_parent[heirarchical_vars[h]] = {};
          heirarchical_parent = heirarchical_parent[heirarchical_vars[h]];
        }
        else if (typeof heirarchical_parent[heirarchical_vars[h]] !== 'object') {
          e('The variable' + heirarchical_vars[h] + 'exists but is not an object');
        }
        else {
          heirarchical_parent = heirarchical_parent[heirarchical_vars[h]];
        }
      }
      e('Value of ' + variable + ' changes from ' + heirarchical_parent[heirarchical_vars[h_len-1]] + ' to ' + value);
      heirarchical_parent[heirarchical_vars[h_len-1]] = value;
      m(JSON.stringify(redListEval[tmp_ns][heirarchical_vars[var_root]]));
    }

    function _op_func(op) {
      var opFunc = {
        'FUNC':_call_function,
        'EQ':function(meta){
          return _comp_api (meta, 'eq');
        },
        'NE':function(meta){
          return _comp_api (meta, 'ne');
        },
        'GT':function(meta){
          return _comp_api (meta, 'gt');
        },
        'GTE':function(meta){
          return _comp_api (meta, 'gte');
        },
        'LT':function(meta){
          return _comp_api (meta, 'lt');
        },
        'LTE':function(meta){
          return _comp_api (meta, 'lte');
        },
        'SET':function(meta){
          return _set_value (meta);
        },
      };
      return opFunc[op];
    }

    function _run_instruction (args) {
      return _op_func(args[0])(args.slice(1));
    }


    function _behave (line) {

      if (skipSection) {
        return;
      }

      var instructions = line.split('\t');
      var logic_result = true;
      for (var i=0; i<instructions.length; i++) {
        var instruction = instructions[i];
        var args = instruction.split(' ');
        var op = args[0];

        if (i===0 ) {
          o(line, 'color:black;text-decoration:underline;');
        }

        switch (_op_type(op)) {
          case 'comp':
            o('Comparing ' + args[1] + ' with ' + args[2]);
            logic_result = logic_result && _run_instruction(args);
            if (logic_result === false) {
              e ('Condition "' + instruction + '" unmatched, skip whole line.');
              return;
            }
            break;
          case 'act':
            if (logic_result) {
              o('Running ' + instruction);
              _run_instruction(args);
            }
            else {
              e('Conditions not match, won\'t run ' + instruction);
            }
            break;
          case 'flow':
            if (logic_result) {
              o('Running '+instruction);
              o('Searching for ' + args[1] + ' section...');
              skipSection = true;
              nextSection = args[1];
            }
            break;
        }
      }
    }

    function FileHelper() {} {
      FileHelper.readStringFromFileAtPath = function(pathOfFileToReadFrom) {
        var request = new XMLHttpRequest();
        var timestamp = new Date().getTime();
        request.open("GET", pathOfFileToReadFrom+"?timestamp="+timestamp, false);
        request.send();
        var returnValue = request.responseText;
        return returnValue;
      }
    }

    function _pr (m, style, wrapper) {
      if (redListEval[ns]['RedListClass'] !== 'NF') {
        o(redListEval[ns]['RedListClass'] + ' ' + redListEval[ns]['category'] + redListEval[ns]['subCriteria'], 'color:red;', 'h1');
      }
      else {
        o('Not Feasible', 'color:red;', 'h1');
      }
    }



    function _behave_sec (sec_id, window, document) {

      if (sec_id !== 'PAUSE') {
        skipSection = false;
  
        var sec = null;
        if (typeof sec_id === 'number') {
          var sec = sections[sec_id];
          nextSection = named_sections[sec_id + 1]?named_sections[sec_id + 1].name:'EOF';
        }
        else if (typeof sec_id === 'string') {
          for (var i=0; i<named_sections.length; i++) {
            if (named_sections[i].name === sec_id) {
              var sec = named_sections[i].section;
              nextSection = named_sections[i + 1]?named_sections[i + 1].name:'EOF';
              break;
            }
          }
        }
  
        if ((sec_id === 'START')&&(sec === null)) {
          e ('Find no start, start from the file beginning');
          sec = sections[0];
        }
  
        if (sec !== null) {
          currentSection = sec_id;
          if (rounds[currentSection] === undefined) {
            rounds[currentSection] = 0;
          }
          rounds[currentSection] ++;
          o(currentSection + ': round ' + rounds[currentSection], '', 'h3');
          var lines = sec.split('\n');
          for (var j=0; j<lines.length; j++) {
            var line = lines[j];
            var instructions = line.split('\t');
            _behave(line);
          }
        }
        else {
          // 如果找不到section就先結束
          nextSection = 'ERROR';
        }
      }
  
      switch (nextSection) {
        case 'FIN':
          m ('Decent Ending');
          m(JSON.stringify(redListEval[ns]));
          _pr();
          break;
        case 'ERROR':
          e('Find No Section.');
          m(JSON.stringify(redListEval[ns]));
          break;
        case 'EOF':
          m ('End Of Flow');
          m(JSON.stringify(redListEval[ns]));
          _pr();
          break;
        case 'PAUSE':
          e ('THE FLOW WILL BE PAUSED FOR EXTERNAL I/O');
          break;
        default:
          m ('Continue...');
          _behave_sec(nextSection, window, document);
      }

    }

    redListEval['shared'] = {};
    redListEval['shared']['display_message'] = '';

    function _init (spData) {

      redListEval[ns] = {};
      redListEval['A'] = {};
      redListEval['B'] = {};

      for (var k in spData) {
        if (spData.hasOwnProperty(k)) {
          var trimmed = String (spData[k]).trim();
          if (trimmed !== '') {
            redListEval[ns][k] = trimmed;
          }
          else {
            redListEval[ns][k] = undefined;
          }
        }
      }

      redListEval[ns].inputYesNo = function (api_data, msg) {
        if (confirm(msg)) {
          return 'Y';
        }
        else {
          return 'N';
        }
      }

      redListEval[ns].inputValue = function (api_data, argStr) {
        var args = argStr.split(',');
        // args[0]是顯示文字, args[1]是預設值
        var value = prompt(args[0], args[1]);
        return String(value);
      }

      var strToArgs = function (argStr, _toString) {
        var toString = true;
        var args = {};
        if (_toString !== undefined) {
          toString = _toString;
        }
        argStr.split(',').every(function (arg, idx) {
          args[arg] = _get_value(arg, false);
          return true;
        });
        return args;
      }


      redListEval['A'].q4 = function (api_data, argStr) {
        // TODO:判斷Y或N的條件不明確，需要加強
        o ("TODO:Q4判斷Y或N的條件不明確，需要加強", "color:red;", "h2");
        var args = strToArgs(argStr, false);
        if (args['a11'] === 'B') {
          return 'Y';
        }
        else {
          return 'N';
        }
      }

      redListEval['A'].q3 = function (api_data, argStr) {
        // TODO:什麼條件下是跨過去到未來?
        o ("TODO:Q3什麼條件下是跨過去到未來?", "color:red;", "h2");
        var args = strToArgs(argStr, false);
        if (args['a4'] && args['a5']) {
          return "過去";
        }
        else if (args['a9']) {
          return "未來";
        }
      };

      redListEval['A'].q6 = function (api_data, argStr) {
        // TODO:???
        o ("TODO:Q6要把細節確認一下", "color:red;", "h2");
        o ("TODO:Q6 a10的I沒有用到", "color:red;", "h2");
        var args = strToArgs(argStr, false);
        var subc = [];
        if (['A'].indexOf(args['a8']) > -1) {
          subc.push('a');
        }
        if (['A','B'].indexOf(args['a7']) > -1) {
          subc.push('b');
        }
        if (args['a10']) {
          if (['A'].indexOf(args['a7']) > -1 || arrIntersect(args['a10'].split(','), ['A']).length > 0) {
            subc.push('c');
          }
          if (arrIntersect(args['a10'].split(','), ['B']).length > 0) {
            subc.push('d');
          }
          if (arrIntersect(args['a10'].split(','), ['C', 'D', 'E', 'F', 'G', 'H']).length > 0) {
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

      redListEval['A'].q2 = function (api_data, argStr) {
        var args = strToArgs(argStr, false);
        //var fork = currentSection;
        /*
        if (redListEval[ns].q2.retVal === undefined) {
          $.when($.get("randomTime.php")).then(
            function (data, textStatus, jqXHR) {
              // retVal here should be evaluate from parameter "data"
              var retVal = 'Y';
              if (redListEval[ns].q2.retVal !== retVal) {
                skipSection = true;
                nextSection = fork;
                redListEval[ns].q2.retVal = retVal;
                _behave_sec(fork, window, document);
              }
            }
          );
        }
        //*/
        return 'Y';
      }

      redListEval['B'].pre_fromAOO = function (data) {
        e("pre_fromAOO");
        e(JSON.stringify(data));
        return {oo_type: 'aoo', n1: _get_value('n1')};
      }
      redListEval['B'].fromAOO = function (api_data, argStr) {

        if (api_data) return JSON.parse(api_data)['aoo'];

        var b = {};
        var picked = undefined;
        argStr.split(',').every(function (arg, idx) {
          b[arg] = _get_value(arg, false);
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

      redListEval['B'].pre_fromEOO = function (data) {
        e("pre_fromEOO");
        e(JSON.stringify(data));
        return {oo_type: 'eoo', n1: _get_value('n1')};
      }
      redListEval['B'].fromEOO = function (api_data, argStr) {

        if (api_data) return JSON.parse(api_data)['eoo'];

        var b = {};
        var picked = undefined;
        argStr.split(',').every(function (arg, idx) {
          b[arg] = _get_value(arg, false);
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

      redListEval['B'].bsubTwoOutOfThree1 = function (api_data, argStr) {
        var data = _toJsonData(argStr);
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




      var _pause = function () {
        nextSection = 'PAUSE';
        skipSection = true;
      }

      var _toJsonData = function (argStr, additionData) {
        var argNames = argStr.split(',');
        var data = {};
        for (var i=0; i<argNames.length; i++) {
          data[argNames[i]] = _get_value(argNames[i]);
        }
        return data;
      }

      var _call_prepare_data = function (variable, data) {
        var tmp_ns = ns;
        var var_root = 0;
        var heirarchical_vars = variable.split('.');
        if (heirarchical_vars[0].match(/^ns:/) !== null) {
          tmp_ns = heirarchical_vars[0].replace(/^ns:/, '');
          var_root = 1;
        }
  
        var h_var_arr = [];
        var heirarchical_parent = redListEval[tmp_ns];
        var h_len = heirarchical_vars.length;
        for (var h=var_root; h<h_len; h++) {
          h_var_arr.push(heirarchical_vars[h]);
          if (heirarchical_parent[heirarchical_vars[h]] === undefined) {
            var value = undefined;
          }
          else {
            var value = heirarchical_parent[heirarchical_vars[h]];
          }
        }
  
        if (typeof value === 'function') {
          return value(data);
        }
        return undefined;
      }




      var _additionData = function (funcName, data) {
        var adata = _call_prepare_data ('pre_' + funcName, data);
        if (adata === 'undefined') {
          return {};
        }
        else if (typeof adata === 'string' || typeof adata === 'number') {
          adata = {literal: adata}
        }
        else if (Array.isArray(adata)) {
          adata = (function toObject(arr) {
            var rv = {};
            for (var i = 0; i < arr.length; ++i)
              if (arr[i] !== undefined) rv[i] = arr[i];
            return rv;
          }) (adata);
        }

        return (function (a, b) {
          a = a || {};
          b = b || {};
          var c = {};
          for (var attr in a) {
            if (a.hasOwnProperty(attr)) {
              c[attr] = a[attr];
            }
          }
          for (var attr in b) {
            if (b.hasOwnProperty(attr)) {
              c[attr] = b[attr];
            }
          }
          return c;
        }) (data, adata);

      }

      redListEval[ns].general = function (argStr, funcName, url, _async) {
        var fork = currentSection;
        var api_url = 'dummy.txt';

        if (url === 'true') {
          url = true;
        }
        else if (url === 'false') {
          url = false;
        }

        if (url && typeof url === 'string') {
          api_url = url;
        }
        else if (typeof url === 'boolean') {
          _async = url;
        }

        var async = false;
        if (_async !== "true" && _async !== true) {
          async = false;
        }
        else {
          async = true;
        }

        //*
        if (redListEval[ns][funcName].retVal === undefined) {

          // 預設會等待I/O
          if (!async) {
            _pause();
            //_behave_sec('PAUSE', window, document);
          }

          e('Waiting for ' + funcName + '(url:' + url + ') to return value...');
          $.when($.post(api_url, _additionData(funcName, _toJsonData(argStr)))).then(
            function (data, textStatus, jqXHR) {
              // retVal here should be evaluate from parameter "data"
              m('API回傳' + data);
              if (api_url === 'dummy.txt') data = undefined;
              if (typeof redListEval[ns][funcName] === 'function') {
                var retVal = redListEval[ns][funcName](data, argStr);
              }
              else {
                var retVal = data;
              }
              if (redListEval[ns][funcName].retVal !== retVal) {
                e('Value recieved from ' + funcName + '(url:' + url + '), going to run section ' + fork + ' again.');
                e('*****Function:' + funcName + '收到新值('+retVal+')，再次執行區塊:' + fork);
                skipSection = true;
                nextSection = fork;
                redListEval[ns][funcName].retVal = retVal;
                _behave_sec(fork, window, document);
              }
            }
          );
        }
        //*/
        return redListEval[ns][funcName].retVal;
      }
    }

    var text;
    var sections;
    var named_sections;
    var nextSection = 'START';
    var currentSection;
    var skipSection = false;
    var rounds = {};

    function evalWith (filename, data) {


      text = FileHelper.readStringFromFileAtPath (filename);
      ns = filename.split('.')[1];
      _init(data);

      o("流程定義檔讀自: <a target='_blank' href='" + filename + "'>" + filename + "</a>");
      o("資料讀自: <a target='_blank' href='https://docs.google.com/spreadsheets/d/1nKH-Bxm8pF4bVwa3Epq7C-J-HfRD3HwdQaNDtG0t0uc/pub?gid=1034574937&single=true&output=html'>Column 5("+redListEval[ns]['欄位編號']+")</a>");

      while (text.match('\n\n\n') !== null) {
        text = text.replace('\n\n\n', '\n\n');
      }

      sections = text.split('\n\n');
      named_sections = [];
      for (var i=0; i<sections.length; i++) {
        var sec = sections[i];
        var sec_name = sec.split('\n')[0];
        named_sections.push({name:sec_name, section:sec});
      }

      /*
      while ((nextSection !== 'FIN')&&(nextSection !== 'ERROR')&&(nextSection !== 'EOF')) {
        _behave_sec(nextSection);
      }
      //*/ _behave_sec(nextSection);

    }
    return {
      evalWith: evalWith
    }
  }
}) (document, window);
