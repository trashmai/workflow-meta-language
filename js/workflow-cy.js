
function makeCyLayout () {
  var layout = cy.makeLayout({name:'cose-bilkent', padding: 30, animate:true});
  //var layout = cy.makeLayout({name:'cose', padding: 20, animate:true});
  layout.run();
}

$(function(){ // on dom ready

  $('#cy_canvas').cytoscape({
    layout: {
      name: 'cose-bilkent',
      padding: 10
    },
    
    style: cytoscape.stylesheet()
      .selector('node')
        .css({
          'shape': 'data(faveShape)',
          'width': 'mapData(weight, 40, 80, 20, 60)',
          'content': 'data(name)',
          'text-valign': 'center',
          'text-outline-width': 2,
          'text-outline-color': 'data(faveColor)',
          'background-color': 'data(faveColor)',
          'color': 'mapData(fontColor, 0, 1, white, black)'
        })
      .selector('.start')
        .css({
          'background-color': '#F56',
          'text-outline-color': '#F56',
        })
      .selector('.graph_label')
        .css({
          'background-color': '#FFF',
          'text-outline-width': 0,
          'color': 'black',
          'width': 'label',
        })
      .selector('.red_list_class')
        .css({
          'text-outline-color': '#FFF',
          'background-color': '#FFF',
          'color': '#F00',
          'border-width': 2,
          'border-color': '#555',
          'font-size': 20,
        })
      .selector('.button')
        .css({
          'width': 60,
          'height': 60,
        })
      .selector(':selected')
        .css({
          'border-width': 3,
          'border-color': '#333'
        })
      .selector('edge')
        .css({
          'label': 'data(label)',
          'color': '#000',
          //'opacity': 0.666,
          'width': 'mapData(strength, 70, 100, 2, 6)',
          'target-arrow-shape': 'triangle',
          'source-arrow-shape': 'circle',
          'line-color': 'data(faveColor)',
          //'line-color': 'mapData(strength, 20, 100, blue, red)',
          'source-arrow-color': 'data(faveColor)',
          'target-arrow-color': 'data(faveColor)'
        })
      .selector('edge.questionable')
        .css({
          'width': 'mapData(strength, 70, 100, 2, 6)',
          'line-style': 'dotted',
          'target-arrow-shape': 'triangle'
        })
      .selector('.faded')
        .css({
          'opacity': 0.25,
          'text-opacity': 0
        }),

    elements:{nodes:[{ data: { id: 'dqbzhn', name: '文字開關', weight: 75, faveColor: '#F56', faveShape: 'octagon' }, classes: 'button' }], edges:[]},
  
  /*  
    elements: {
      nodes: [
        { data: { id: 'j', name: 'Jerry', weight: 65, faveColor: '#6FB1FC', faveShape: 'triangle' } },
        { data: { id: 'e', name: 'Elaine', weight: 45, faveColor: '#EDA1ED', faveShape: 'ellipse' } },
        { data: { id: 'k', name: 'Kramer', weight: 75, faveColor: '#86B342', faveShape: 'octagon' } },
        { data: { id: 'g', name: 'George', weight: 70, faveColor: '#F5A45D', faveShape: 'rectangle' } }
      ],
      edges: [
        { data: { source: 'j', target: 'e', faveColor: '#6FB1FC', strength: 90 } },
        { data: { source: 'j', target: 'k', faveColor: '#6FB1FC', strength: 70 } },
        { data: { source: 'j', target: 'g', faveColor: '#6FB1FC', strength: 80 } },
       
        { data: { source: 'e', target: 'j', faveColor: '#EDA1ED', strength: 95 } },
        { data: { source: 'e', target: 'k', faveColor: '#EDA1ED', strength: 60 }, classes: 'questionable' },
        
        { data: { source: 'k', target: 'j', faveColor: '#86B342', strength: 100 } },
        { data: { source: 'k', target: 'e', faveColor: '#86B342', strength: 100 } },
        { data: { source: 'k', target: 'g', faveColor: '#86B342', strength: 100 } },
        
        { data: { source: 'g', target: 'j', faveColor: '#F5A45D', strength: 90 } }
      ]
    },
  //*/
    
    ready: function(){
      window.cy = this;
      // giddy up
      show();
      cy.on('tap', 'node', function(evt) {
        var node = evt.cyTarget;
        var tmp;
        tmp = node.data('sec');
        $('#show_text_data').html(tmp);
      })
      .on('tap', 'edge', function(evt) {
        var edge = evt.cyTarget;
        if (edge.data('label')) {
          edge.data('original_label', edge.data('label'));
          edge.data('label', '');
        }
        else {
          edge.data('label', edge.data('original_label')||'');
        }
      })
      .on('tap', 'node[id="dqbzhn"]', function(evt) {
        var d = $('#display_message_box');
        var g = $('#cy_canvas');
        var t = $('#show_text_data');
        if (d.css('display') == 'none') {
          d.show();
          t.hide();
          //g.css('left', '250px');
          //makeCyLayout();
        }
        else {
          d.hide();
          t.show();
          //g.css('left', '0px');
          //makeCyLayout();
        }
      })

    }
  });

});

function cyRemove (arr) {
  arr.forEach(function(id) {
    cy.$(id).remove();
  })
}
