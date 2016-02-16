(function (document, window) {

  'use strict';

  var $wf = window.$wf = function () {
    'use strict';

    var display_message = '';
    var ns;

    var keyOp = {};
  
    var o = $wf.o = function (txt, styles, wrapper) {

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
      $wf[shared]['display_message'] += '<span style="' + styles + '">' + beginEl + txt + endEl + '</span>' + br;
      $('div#display_message_box').html($wf[shared]['display_message']);
    }
  
    var e = $wf.e = function (txt) {
      o(txt, 'color:red;');
    }
  
    var m = $wf.m = function (txt) {
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
      if (meta[0].indexOf('.') > 0) {
        var tmpFuncParts = meta[0].split('.');
        var func_ns = tmpFuncParts[0];
        var funcName = tmpFuncParts.slice(1).join('.');
      }
      else {
        var func_ns = ns;
        var funcName = meta[0];
      }
      var argStr = meta[1];
      var api_url = meta[2];
      var async = meta[3];
      o('執行函式:' + funcName + ' 並使用參數:' + argStr + ' 以及來自:api('+api_url+') 的結果.');

      // _call_function fallback
      if (typeof $wf[func_ns][funcName] === 'undefined') {
        if (typeof $wf[shared][funcName] === 'function') {
          $wf[func_ns][funcName] = $wf[shared][funcName];
          m('Fall back to shared function ' + funcName);
        }
      }

      var funcText = '';
      if (!$wf[func_ns][funcName]) {
        funcText = 'undefined';
      }
      else {
        funcText = $wf[func_ns][funcName].toString();
      }
      funcText = '<xmp>' + funcText + '</xmp>';

      var cyNode = {group:'nodes', data:{id:funcName, name:funcName, weight:200, faveColor:'#86B342', faveShape:'octagon', sec:funcText}};
      var cyEdge = {group:'edges', data:{id:currentSection + '_' + funcName, original_label:JSON.stringify($wf._toJsonData(argStr, false)), faveColor:'#86B342', target:funcName, source:currentSection}};
      //$wf.$cyData.nodes.push(cyNode);
      cy.add([cyNode]);
      //$wf.$cyData.edges.push(cyEdge);
      cy.add([cyEdge]);


      if (typeof $wf[func_ns][funcName] === 'function') {
        // $wf[ns][funcName].retVal = $wf[ns][funcName](argStr);
        $wf[func_ns][funcName].retVal = $wf[shared].general(argStr, funcName, api_url, async);
        o('Call function $wf.'+func_ns+'.'+funcName+' with parameters ' + argStr);
        m('Return value ('  + funcName + '): ' + $wf[func_ns][funcName].retVal + '(' + (typeof $wf[func_ns][funcName].retVal) + ')');
      }
      else {
        // error
        o('function $wf.'+func_ns+'.' + funcName + ' is not found', 'color:red', 'h1');
        m(JSON.stringify($wf[ns]));
        throw 'Error: function $wf.'+func_ns+'.' + funcName + ' is not found.'
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

        function opTL (op) {
          switch (op) {
            case 'eq': return '==';
            case 'ne': return '!=';
            case 'gt': return '>';
            case 'lt': return '<';
            case 'gte': return '>=';
            case 'lte': return '<=';
          }
        }

        if (keyOp[currentSection].indexOf(meta[0] + '('+ String(a) +') ' + opTL(op) + ' ' + meta[1] + '('+String(b)+')' + ' is ' + _comp_res.toString()) == -1) {
          keyOp[currentSection].push(meta[0] + '('+ String(a) +') ' + opTL(op) + ' ' + meta[1] + '('+String(b)+')' + ' is ' + _comp_res.toString());
        }
        return _comp_res;
    }

    var _get_value = $wf._get_value = function (variable, _toString) {
      var tmp_ns = ns;
      var var_root = 0;
      var heirarchical_vars = variable.split('.');
      if (heirarchical_vars[0].match(/^ns:/) !== null) {
        tmp_ns = heirarchical_vars[0].replace(/^ns:/, '');
        var_root = 1;
      }

      var h_var_arr = [];
      var heirarchical_parent = $wf[tmp_ns];
      var h_len = heirarchical_vars.length;
      for (var h=var_root; h<h_len; h++) {
        h_var_arr.push(heirarchical_vars[h]);
        if (heirarchical_parent[heirarchical_vars[h]] === undefined) {
          var value = undefined;
        }
        else {
          var value = heirarchical_parent[heirarchical_vars[h]];
          heirarchical_parent = value;
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
        if (value===undefined) {
          e(h_var_arr.join('.') + ' is not a variable, treated as STRING.');
          return String(variable);
        }
        else {
          m(h_var_arr.join('.') + '=' + value);
          return value;
        }
      }
      else {
        return value;
      }
    }


    var _set_value = $wf._set_value = function (meta) {
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
      if (keyOp[currentSection].indexOf('set ' + variable + ' to ' + value) == -1) {
        keyOp[currentSection].push('set ' + variable + ' to ' + value);
      }


      var h_var_arr = [];
      if ($wf[tmp_ns] === undefined) {
        $wf[tmp_ns] = {};
      }
      var heirarchical_parent = $wf[tmp_ns];
      var h_len = heirarchical_vars.length;
      for (var h=var_root; h<h_len-1; h++) {
        h_var_arr.push(heirarchical_vars[h]);
        if (heirarchical_parent[heirarchical_vars[h]] === undefined) {
          e('Variable ' + h_var_arr.join('.') + ' doesn\'t exist, create now');
          heirarchical_parent[heirarchical_vars[h]] = {};
          heirarchical_parent = heirarchical_parent[heirarchical_vars[h]];
        }
        else if (typeof heirarchical_parent[heirarchical_vars[h]] !== 'object') {
          e('The variable ' + heirarchical_vars[h] + ' exists but is not an object. Failed to set variable.');
        }
        else {
          heirarchical_parent = heirarchical_parent[heirarchical_vars[h]];
        }
      }
      e('Value of ' + variable + ' changes from ' + heirarchical_parent[heirarchical_vars[h_len-1]] + ' to ' + value);
      heirarchical_parent[heirarchical_vars[h_len-1]] = value;
      m(JSON.stringify($wf[tmp_ns][heirarchical_vars[var_root]]));
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

      currentLine = line;
      line = line.split('//')[0];

      var instructions = line.split('\t');

      if (!line.trim()) instructions.length = 0;

      var logic_result = true;
      for (var i=0; i<instructions.length; i++) {
        var instruction = instructions[i];
        var args = instruction.split(' ').filter(function(i){if (i!='') return i});

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


    function _behave_sec (sec_id, window, document) {

      if (sec_id !== 'PAUSE') {
        skipSection = false;
  
        var sec = null;
        if (typeof sec_id === 'number') {
          var sec = sections[sec_id];
          nextSection = named_sections[sec_id + 1]?named_sections[sec_id + 1].name:'EOF';
        }
        else if (typeof sec_id === 'string') {
          if (sec_id !== 'NEXT') {
            for (var i=0; i<named_sections.length; i++) {
              if (named_sections[i].name === sec_id) {
                var sec = named_sections[i].section;
                nextSection = named_sections[i + 1]?named_sections[i + 1].name:'EOF';
                break;
              }
            }
          }
          else if (sec_id === 'NEXT') {
            for (var i=0; i<named_sections.length; i++) {
              if (named_sections[i].name === currentSection) {
                if (!!named_sections[i+1]) {
                  var sec = named_sections[i + 1].section;
                  sec_id = named_sections[i + 1].name;
                  nextSection = named_sections[i + 2]?named_sections[i + 2].name:'EOF';
                }
                else {
                  var sec = null;
                  nextSection = named_sections[i + 2]?named_sections[i + 2].name:'EOF';
                }
                break;
              }
            }
          }
        }
  
        if ((sec_id === 'START')&&(sec === null)) {
          sec = sections[0];
          sec_id = named_sections[0].name;
          currentSection = named_sections[0].name;
          e ('Find no start, start from the file beginning section: ' + sec_id);
        }
  
        if (sec !== null) {

          prevSection = currentSection;
          var prevSectionLastLine = currentLine;
          currentSection = sec_id;

          if (!keyOp[currentSection]) {
            keyOp[currentSection] = [];
          }
          keyOp[currentSection].length = 0;

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

          if (prevSection && currentSection) {
            if (prevSection !== currentSection && funcFinished[prevSection] !== false && ['FIN',  'ERROR', 'EOF', 'PAUSE'].indexOf(prevSection) == -1) {
              if (prevSectionLastLine.match('GOTO ')) {
                var gotoLabel = prevSectionLastLine;
              }
              else {
                var gotoLabel = 'GOTO NEXT';
              }
              var cySecEdgeId = 'solid_' + prevSection + '_' + currentSection;
              var cySecEdge = {group:'edges', data:{id:cySecEdgeId, original_label: gotoLabel, faveColor:'#EDA1ED', target:currentSection, source:prevSection, strength:(65 + 5 * rounds[prevSection])}};

              cy.$('#'+prevSection).data('sec', '<xmp>' + named_sections[sec_names.indexOf(prevSection)].section + '\n\n**key operation:\n' + keyOp[prevSection].join('\n') + '</xmp>');


              if ($wf.$cyToBeRemoved.indexOf('#' + prevSection + '_' + currentSection) == -1 ) {
                $wf.$cyToBeRemoved.push('#' + prevSection + '_' + currentSection);
              }
            }
            else if (prevSection !== currentSection && ['FIN',  'ERROR', 'EOF', 'PAUSE'].indexOf(prevSection) == -1) {
              var cySecEdgeId = prevSection + '_' + currentSection;
              var cySecEdge = {group:'edges', classes:'questionable', data:{id:cySecEdgeId, faveColor:'#F5A45D', target:currentSection, source:prevSection, strength:(65 + 5 * rounds[prevSection])}};
            }

            /* 用粗細看流程, 有點不清楚, 先拿掉
            if (prevSection != currentSection) {
              var cySecEdgeId = 'solid_' + prevSection + '_' + currentSection;
              var cySecEdge = {group:'edges', data:{id:cySecEdgeId, original_label: gotoLabel, faveColor:'#EDA1ED', target:currentSection, source:prevSection, strength:20*rounds[prevSection]}};
            }
            //*/
            
            if (!cy.$('#'+cySecEdgeId).length && !!cySecEdge) {
              cy.add([cySecEdge]);
            }
            else if (!!cySecEdge) {
              var cySecEdge = cy.$('#'+cySecEdgeId)[0];
              cySecEdge.data('original_label', gotoLabel);
              cySecEdge.data('label', '');
              cySecEdge.data('strength', 65 + 5 * rounds[prevSection]);
            }
 
          }
        }
        else {
          // 如果找不到section就先結束
          if (nextSection !== 'EOF') {
            nextSection = 'ERROR';
          }
          else {
            $wf._error_message = 'Find No Section';
          }
        }
      }

      function lastPart(s, this_sec_id) {
          'use strict';
          m (s);
          m(JSON.stringify($wf[ns]));

          var res = 'No Result';
          if ($wf[ns].print === undefined || $wf[ns].print === null) $wf[ns].print = true;
          if ($wf[ns].print) {
            res = $wf[ns].outputResult();
          }

          var cyResNode = {group:'nodes', data:{id:'RES', name:res, weight:200, faveColor:'#F56', faveShape:'ellipse', sec:'<xmp>'+$wf[ns].outputResult.toString()+'</xmp>'}, classes: 'red_list_class'};
          var addRes = cy.add([cyResNode]);
          if (addRes.length === 0) {
            cy.$('#RES').data('name', res);
          }
          var cyResEdge = {group:'edges', data:{id:this_sec_id + '_RES', original_label: '', faveColor:'#EDA1ED', target:'RES', source:this_sec_id, strength:80}};
          cy.add([cyResEdge]);
          var cyResToLabelEdge = {group:'edges', data:{id:'RES_' + $wf.$cyData.label_node_id, original_label: '', faveColor:'#FFF', target:$wf.$cyData.label_node_id, source:'RES'}};
          cy.add([cyResToLabelEdge]);

          if (currentLine.match('GOTO ')) {
            var gotoLabel = currentLine;
          }
          else {
            var gotoLabel = 'GOTO NEXT';
          }

          if (currentSection !== this_sec_id && funcFinished[currentSection] !== false && ['FIN', 'ERROR', 'EOF', 'PAUSE'].indexOf(currentSection) == -1) {
            var cyFinEdge = {group:'edges', data:{id:'solid_' + currentSection + '_' + this_sec_id, original_label: gotoLabel, faveColor:'#EDA1ED', target:this_sec_id, source:currentSection, strength:(65 + 5 * rounds[currentSection])}};
            cy.add([cyFinEdge]);
            cy.$('#'+currentSection).data('sec', '<xmp>' + named_sections[sec_names.indexOf(currentSection)].section + '\n\n**key operation:\n' + keyOp[currentSection].join('\n') + '</xmp>');

            if ($wf.$cyToBeRemoved.indexOf('#' + currentSection + '_' + this_sec_id) == -1 ) {
              $wf.$cyToBeRemoved.push('#' + currentSection + '_' + this_sec_id);
            }

          }
          else if (currentSection !== this_sec_id && ['FIN', 'ERROR', 'EOF', 'PAUSE'].indexOf(currentSection) == -1) {
            var cyFinEdge = {classes: 'questionable', group:'edges', data:{id:currentSection + '_' + this_sec_id, original_label: gotoLabel, faveColor:'#F5A45D', target:this_sec_id, source:currentSection, strength:(65 + 5 * rounds[currentSection])}};
            cy.add([cyFinEdge]);
          }

          currentSection = this_sec_id;

          var cyToggleEdge = {group:'edges', data:{id:'RES_dqbzhn', original_label: '', faveColor:'#EDA1ED', target:'dqbzhn', source:'RES'}};
          cy.add([cyToggleEdge]);
      }  


      switch (nextSection) {
        case 'FIN':
          lastPart('Decent Ending', nextSection);
          break;
        case 'ERROR':
          if (!!$wf._error_message) {
            e($wf._error_message);
          }
          else {
            e('Unregistered Error at section:' + currentSection + ':' + currentLine);
          }
          m(JSON.stringify($wf[ns]));
          _pr($wf[ns].print);
          break;
        case 'EOF':
          lastPart('End of File', nextSection);
          break;
        case 'PAUSE':
          e ('THE FLOW WILL BE PAUSED FOR EXTERNAL I/O');
          break;
        default:
          m ('Continue...');
          _behave_sec(nextSection, window, document);
      }

      if (typeof makeCyLayout === 'function') {
        makeCyLayout();
        cyRemove($wf.$cyToBeRemoved);
      }
    }

    var shared = 'shared';
    $wf[shared] = $wf[shared] || {};
    $wf[shared]['display_message'] = '';

    function _init (wfData) {

      $wf[ns] = $wf[ns] || {};

      for (var k in wfData) {
        if (wfData.hasOwnProperty(k)) {
          var trimmed = String (wfData[k]).trim();
          if (trimmed !== '') {
            $wf[ns][k] = trimmed;
          }
          else {
            $wf[ns][k] = undefined;
          }
        }
      }

      $wf[shared].inputYesNo = function (api_data, msg) {
        if (confirm(msg)) {
          return 'Y';
        }
        else {
          return 'N';
        }
      }

      $wf[shared].inputValue = function (api_data, argStr) {
        var args = argStr.split(',');
        // args[0]是顯示文字, args[1]是預設值
        var value = prompt(args[0], args[1]);
        return String(value);
      }

      var _strToArgs = $wf._strToArgs = function (argStr, _toString) {
        var toString = false;
        var args = {};
        if (_toString !== undefined) {
          toString = _toString;
        }
        argStr.split(',').every(function (arg, idx) {
          args[arg] = _get_value(arg, toString);
          return true;
        });
        return args;
      }

      var _pause = function () {
        nextSection = 'PAUSE';
        skipSection = true;
      }

      // edit: 20160127 好像跟 _strToArgs差不多？
      var _toJsonData = $wf._toJsonData = function (argStr, _toString, _callback) {
      //var _toJsonData = function (argStr, additionData) {
        var argNames = argStr.split(',');
        var data = {};
        var call = true;
        for (var i=0; i<argNames.length; i++) {
          data[argNames[i]] = _get_value(argNames[i], _toString);
          if (typeof _callback === 'function' && call !== false) {
            call = _callback(argNames[i], data[argNames[i]]);
          }
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
        var heirarchical_parent = $wf[tmp_ns];
        var h_len = heirarchical_vars.length;
        for (var h=var_root; h<h_len; h++) {
          h_var_arr.push(heirarchical_vars[h]);
          if (heirarchical_parent[heirarchical_vars[h]] === undefined) {
            var value = undefined;
          }
          else {
            var value = heirarchical_parent[heirarchical_vars[h]];
            heirarchical_parent = value;
          }
        }

        var preFuncName = h_var_arr.join('.');
  
        if (typeof value === 'function') {
          var cyPrepareNode = {group:'nodes', data:{id:preFuncName, name:preFuncName, faveColor:'#6FB1FC', faveShape:'octagon', sec:'<xmp>'+value.toString()+'</xmp>'}};
          //$wf.$cyData.nodes.push(cyPrepareNode);
          cy.add([cyPrepareNode]);
          return value(data);
        }
        return undefined;
      }

      // edit: 20160127
      var _additionData = function (funcName, data) {
        var adata = _call_prepare_data ('pre_' + funcName, data);
        if (adata === undefined) {
          return data;
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

        var cyPrepareEdge = {group:'edges', data:{id:'pre_'+funcName + '_' + funcName, original_label:JSON.stringify(adata), faveColor:'#6FB1FC', target:funcName, source:'pre_' + funcName}};
        //$wf.$cyData.edges.push(cyPrepareEdge);
        cy.add([cyPrepareEdge]);
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

      $wf[shared].general = function (argStr, funcName, url, _async) {

        var fork = currentSection;
        var api_url = './service/wf-dummy.txt';

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

        funcFinished[fork] = false;

        //*
        if ($wf[ns][funcName].retVal === undefined) {

          // 預設會等待I/O
          if (!async) {
            _pause();
            //_behave_sec('PAUSE', window, document);
          }

          e('Waiting for ' + funcName + '(url:' + url + ') to return value...');
          var reqData = _additionData(funcName, _toJsonData(argStr, false));
          $.when($.post(api_url, reqData)).then(
            function (data, textStatus, jqXHR) {
              // retVal here should be evaluate from parameter "data"
              m('API回傳' + data);
              if (api_url.match(/wf-dummy\.txt$/)) data = undefined;
              if (typeof $wf[ns][funcName] === 'function') {
                var retVal = $wf[ns][funcName](data, argStr);
              }
              else {
                var retVal = data;
              }
              if ($wf[ns][funcName].retVal !== retVal) {
                e('Value recieved from ' + funcName + '(url:' + url + '), going to run section ' + fork + ' again.');
                e('*****Function:' + funcName + '收到新值('+retVal+')，再次執行區塊:' + fork);
                skipSection = true;
                nextSection = fork;
                $wf[ns][funcName].retVal = retVal;
                _behave_sec(nextSection, window, document);

                funcFinished[fork] = true;

                var cyFuncEdge = {group:'edges', data:{id:funcName + '_' + fork, label:retVal, original_label:retVal, faveColor:'#86B342', target:fork, source:funcName}};
                //$wf.$cyData.edges.push(cyFuncEdge);
                cy.add([cyFuncEdge]);

                var strUrl = url;
                if (url !== true && url !== false && url !== undefined && url !== null) {
                  // if (url === undefined) strUrl = 'undefined';
                  var cyNode = {group:'nodes', data:{id:strUrl, name:strUrl, weight:200, faveColor:'#6FB1FC', faveShape:'triangle'}};
                  var cyUrlEdge = {group:'edges', data:{id:strUrl + '_' + funcName, label: data, original_label:data, faveColor:'#6FB1FC', target:funcName, source:strUrl}};
                  var cyReqUrlEdge = {group:'edges', data:{id:'orig_'+funcName + '_' + strUrl, original_label:JSON.stringify(_toJsonData(argStr, false)), faveColor:'#6FB1FC', target:strUrl, source:funcName}};
                  var cyReqUrlEdge = {group:'edges', data:{id:'all_'+funcName + '_' + strUrl, original_label:JSON.stringify(reqData), faveColor:'#6FB1FC', target:strUrl, source:funcName}};
                  //$wf.$cyData.nodes.push(cyNode);
                  cy.add([cyNode]);
                  //$wf.$cyData.edges.push(cyUrlEdge);
                  cy.add([cyUrlEdge]);
                  //$wf.$cyData.edges.push(cyReqUrlEdge);
                  cy.add([cyReqUrlEdge]);
                }

              }
              else {
                e('*****Function:' + funcName + 'return undefined. Set to NULL');
                skipSection = true;
                nextSection = 'ERROR';
                _behave_sec(nextSection, window, document);
              }
            }
          );
        }
        else {
          var retVal = $wf[ns][funcName].retVal;
          var cyFuncEdge = {group:'edges', data:{id:funcName + '_' + fork, label:retVal, original_label:retVal, faveColor:'#86B342', target:fork, source:funcName}};
          //$wf.$cyData.edges.push(cyFuncEdge);
          cy.add([cyFuncEdge]);
          funcFinished[fork] = true;
        }
        //*/
        return $wf[ns][funcName].retVal;
      }
    }

    var text;
    var sections;
    var named_sections;
    var sec_names;
    var nextSection = 'START';
    var currentSection;
    var prevSection;
    var currentLine;
    var skipSection = false;
    var rounds = {};
    var funcFinished = {};

    if (!$wf.$cyData) {
      $wf.$cyData = {};
    }

    function runWith (wfFile, namespace, data) {

      $wf.ns = ns = namespace;
      text = FileHelper.readStringFromFileAtPath (wfFile);
      _init(data);

      o("流程定義檔讀自: <a target='_blank' href='" + wfFile + "'>" + wfFile + "</a>");

      // TODO: Data loading layer is needed.
      o("資料讀自: <a target='_blank' href='https://docs.google.com/spreadsheets/d/10UnX17y5Yfj0MJoPDlNmrUCOER4xnF-OodNgx6bb6T4/pub?gid=1851777821&single=true'>Column #("+$wf[ns]['欄位編號']+")</a>");

      o("流程視覺化: <a target='_blank' href='cy.html?" + window.location.href.split('?').pop() + "'>見此</a>");

      //* 寫Label
      $wf.$cyData.label_node_id = 'default_label';
      if (typeof $wf[$wf.ns].cyAddLabel === 'function') {
          $('#wf_label').html($wf[$wf.ns].cyAddLabel($wf[$wf.ns]));
      }
      else if (typeof $wf.shared.cyAddLabel === 'function') {
          $('#wf_label').html($wf.shared.cyAddLabel($wf[$wf.ns]));
      }
      //*/

      // 拆區塊
      while (text.match('\n\n\n') !== null) {
        text = text.replace('\n\n\n', '\n\n');
      }

      $wf.$cyToBeRemoved = [];
      var thisCyNode = null;
      var prevCyNode = null;
      var cyEdge = null;

      sections = text.split('\n\n');
      named_sections = [];
      sec_names = [];

      var isFirst = true;

      var dummy = [];

      for (var i=0; i<sections.length; i++) {
        var sec = sections[i];
        var tmp_sec_lines = sec.split('\n');
        var sec_name = '';
        tmp_sec_lines.some(function(tmp_line) {
          if (sec_name = tmp_line.split('//')[0]) {
            return true;
          }
          else {
            return false;
          }
        });

        if (!sec_name) {
          sec_name = 'DummySection_' + ('00' + (dummy.length + 1)).slice(-3);
          dummy.push(sec_name);
        }

        if (sec && sec_name) {
          named_sections.push({name:sec_name, section:sec});
          sec_names.push(sec_name);
          if (isFirst) {
            var classes = 'start';

            isFirst = false;
          }
          else {
            var classes = '';
          }
          thisCyNode = {group:'nodes', data:{id:sec_name, name:sec_name, weight:500, faveColor:'#F5A45D', faveShape:'rectangle', sec:'<xmp>'+sec+'</xmp>'}, classes: classes};
          //$wf.$cyData.nodes.push(thisCyNode);
          cy.add([thisCyNode]);
          if (prevCyNode) {
            cyEdge = {group:'edges', data:{id:(prevCyNode.data.id+'_'+thisCyNode.data.id), source:prevCyNode.data.id, target:thisCyNode.data.id, faveColor:'#F5A45D'}, classes:'questionable'};
            //$wf.$cyData.edges.push(cyEdge);
            cy.add([cyEdge]);
          }
          prevCyNode = thisCyNode;
        }
      }

      _behave_sec(nextSection);
    }
    return {
      runWith: runWith
    }
  }
}) (document, window);
