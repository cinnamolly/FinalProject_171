
/*
 * Timeline - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */

Timeline = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;

    // No data wrangling, no update sequence
    this.displayData = this.data;

    this.initVis();
}


/*
 * Initialize area chart with brushing component
 */

Timeline.prototype.initVis = function(){
    var vis = this;

    vis.keys = ["Blizzard", "Flood", "Hail", "Hurricane", "Thunderstorm", "Tornado", "Tropical Storm", "Tsunami", "Wildfire"];


    vis.altered_data = [];



    vis.data.forEach(function(d){
        var sum = 0;
        for (var e in d){
            sum += d[e];
        }

        vis.altered_data.push(sum);

    });

    //vis.stack = d3.stack()
     //   .keys(vis.keys);

    vis.stackedData = vis.altered_data;

    // read about the this

    vis.displayData = vis.stackedData;

    //console.log(vis.stackedData);

	vis.margin = {top: 0, right: 0, bottom: 30, left: 60};

	vis.width = 550 - vis.margin.left - vis.margin.right,
    vis.height = 100 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right + 150)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

// Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain([dateParser("1980-01-01"), dateParser("2016-01-01")]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain([0, d3.max(vis.altered_data, function(d) { return d; })]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    // SVG area path generator
    vis.area = d3.area()
        .x(function(d, i) {return vis.x(dateParser((i + 1980).toString() + "-01-01")); })
        .y0(function(d) {return vis.y(0); })
        .y1(function(d) { return vis.y(d); })
        .curve(d3.curveCardinal);

    // Draw area by using the path generator
    vis.svg.append("path")
        .datum(vis.displayData)
        .attr("fill", "#ccc")
        .attr("d", vis.area);

    /**
    var categories = vis.svg.selectAll(".area")
        .data(vis.stackedData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .style("fill", function(d,i) {
            return "#ccc";
        })
        .attr("d", function(d) {
            return vis.area(d);
        });
     **/


  // TO-DO: Initialize brush component
    var brush = d3.brushX()
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush", brushed);

  // TO-DO: Append brush component here
    vis.svg.append("g")
        .attr("class", "x brush")
        .call(brush)
        .selectAll("rect")
        .attr("y", -6)
        .attr("height", vis.height + 7);


  vis.svg.append("g")
      .attr("class", "x-axis axis")
      .attr("transform", "translate(0," + vis.height + ")")
      .call(vis.xAxis);

}
/**
Timeline.prototype.updateVis = function(_range){
    var vis = this;

    console.log(_range);


    var categories = vis.svg.selectAll(".area")
        .data(vis.stackedData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .style("fill", function(d,i) {
            console.log(d);
            console.log(dateParser((i + 1955).toString() + "-01-01"));
            if (dateParser((i + 1955).toString() + "-01-01") <= _range[1] && (dateParser((i + 1955).toString() + "-01-01") >= _range[0]))
                return colorScale(vis.keys[i]);
            else
                return "#ccc";
        })
        .attr("d", function(d) {
            return vis.area(d);
        });

}
 */

