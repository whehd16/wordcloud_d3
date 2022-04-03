function WordCloud(options) {
    var margin = {top: 50, right: 0, bottom: 0, left: 0},
             w = 1080 - margin.left - margin.right,
             h = 720 - margin.top - margin.bottom;
  
    // create the svg
    var svg = d3.select(options.container).append("svg")
                .attr('height', h + margin.top + margin.bottom)
                .attr('width', w + margin.left + margin.right)
                .style("background-color","black")
  
    // set the ranges for the scales
    var xScale = d3.scaleLinear().range([10, 130]);
  
    var focus = svg.append('g')
                   .attr("transform", "translate(" + [w/2, h/2+margin.top] + ")")
                   
  
    // var colorMap = ['red', '#a38b07'];
    var colorMap = [
        // '#000000',
        // '#000066',
        // '#000099',
        // '#0000CC',
        '#0099FF',
        '#00FFFF',
        '#00FF66',
        '#00FF33',
        '#33FF33',
        '#99FF99',
        '#FFFFCC',
        '#FFFF66',
        '#FFFF00',
        '#FFCC33',
        '#FFCCCC',
        '#FF6666',
        '#FF3333',
        '#FF0000'
      ];
  
    // seeded random number generator
    var arng = new alea('hello.');
  
    var data;

    var global_temp_font_size, global_temp_color;
    var font_name = "san serif"

    d3.json(options.data, function(error, d) {
      if (error) throw error;
      data = d;
      var word_entries = d3.entries(data['count']);
      xScale.domain(d3.extent(word_entries, function(d) {return d.value;}));
  
      makeCloud();
  
      function makeCloud() {
        d3.layout.cloud().size([w, h])
                 .timeInterval(20)
                 .words(word_entries)
                 .fontSize(function(d) { return xScale(+d.value); })
                 .text(function(d) { return d.key; })
                 .font(font_name)
                 .random(arng)
                 .on("end", function(output) {
                   // sometimes the word cloud can't fit all the words- then redraw
                   // https://github.com/jasondavies/d3-cloud/issues/36
                   if (word_entries.length !== output.length) {
                     console.log("not all words included- recreating");
                     makeCloud();
                     return undefined;
                   } else { draw(output); }
                 })
                 .start();
      }
  
      d3.layout.cloud().stop();
  
    });
  
    function draw(words) {
      focus.selectAll("text")
           .data(words)
           .enter().append("text")
           .style("font-size", function(d) { return xScale(d.value) + "px"; })
           .style("font-family", "sans serif")
           .style("fill", function(d, i) { return colorMap[~~(arng() *colorMap.length)]; })
           .attr("text-anchor", "middle")
           .attr("transform", function(d) {
             return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
           })
           .text(function(d) { return d.key; })
           .on('mouseover', handleMouseOver)
           .on('mouseout', handleMouseOut);
    }
  
    function handleMouseOver(d) {        
        // console.log(d3.select(this).classed("word-hovered", true).transition(`mouseover-${d.key}`))
        // font-size: 100px; font-family: Impact; fill: rgb(255, 204, 51);

        temp_font_size = d3.select(this).style("font-size");
        temp_color = d3.select(this).style("fill");

        parsed_font_size = parseFloat(temp_font_size.substring(0, temp_font_size.length-2));
        global_temp_font_size = parsed_font_size;
        global_temp_color = temp_color

        
        d3.select(this).classed("word-hovered", true)
        .transition(`mouseover-${d.key}`).duration(1000).attr(
            "style", function(d,i) { return "font-size : " + (parsed_font_size+15) + "px; font-family : "+font_name+"; fill : " + temp_color + ";" }
            );

        var group = focus.append('g').attr('id', 'story-titles');
        var base = d.y - d.size;

        var rect_font_size = 30
        group.selectAll('text')
           .data(data['sample_title'][d.key])
           .enter().append('text')
           .attr('x', d.x + 250)
           .attr('y', function(title, i) {
             return (base + i*rect_font_size);
           })
           .attr('font-weight', 'bold')
           .attr('text-anchor', 'middle')
           .style("font-size", rect_font_size+'px')
           .style("font-family",font_name)
           .text(function(title,i) { return (i+1)+"."+title; });
  
      var bbox = group.node().getBBox();
      var bboxPadding = 5;
  
      // place a white background to see text more clearly
      var rect = group.insert('rect', ':first-child')
                    .attr('x', bbox.x)
                    .attr('y', bbox.y)
                    .attr('width', bbox.width + bboxPadding)
                    .attr('height', bbox.height + bboxPadding)
                    .attr('rx', 10)
                    .attr('ry', 10)
                    .attr('class', 'label-background-strong');
    }
  
    function handleMouseOut(d) {
      d3.select(this).classed("word-hovered", false).interrupt(`mouseover-${d.key}`).attr(
            "style", function(d,i) { return "font-size : " + global_temp_font_size + "px; font-family : "+font_name+"; fill : " + global_temp_color + ";" }
            )
      d3.select('#story-titles').remove();
    }
  }