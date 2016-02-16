function export_image() {
  if (!!cy) {
    //var image_scope = 
    //var img64 = 
    var ffss=5566;
    var image_scope = document.getElementsByName('image_scope');
    var image_format = document.getElementsByName('image_format');
    for (is_idx in image_scope){
      if (image_scope.hasOwnProperty(is_idx)) {
        if (image_scope[is_idx].checked) {
          opt_image_scope = image_scope[is_idx].value;
          if (opt_image_scope == 'full') {
            opt_image_scope = true;
          }
          else {
            opt_image_scope = false;
          }
          break;
        }
      }
    }

    for (if_idx in image_format){
      if (image_format.hasOwnProperty(if_idx)) {
        if (image_format[if_idx].checked) {
          opt_image_format = image_format[if_idx].value;
          break;
        }
      }
    }

    var mw = 1600; //px
    var a = document.getElementById('link_for_exported');
    var species_vname = document.getElementById('species').selectedOptions[0].innerHTML;
    var criteria = document.getElementById('criteria').selectedOptions[0].innerHTML;
    var timestamp_now = Date.now();
    var img_file_basename = species_vname + '_' + criteria + '_' + timestamp_now;

    switch (opt_image_format) {
      case 'png':
        var img64 = cy.png({full:opt_image_scope, maxWidth:mw});
        var img_file_name = img_file_basename + '.png';
        break;
      case 'jpg':
        var img64 = cy.jpg({full:opt_image_scope, maxWidth:mw});
        var img_file_name = img_file_basename + '.jpg';
        break;
    }
    a.innerText = '下載:' + img_file_name;
    a.setAttribute('download', img_file_name);
    a.href = img64;
  }
  else {
    alert('Cytoscape is not defined!');
  }
}
