

/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */

StackedAreaChart = function(_parentElement, _data){
	this.parentElement = _parentElement;
    this.data = _data;
    this.altered_data = _data;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    console.log("Loaded");

    this.initVis();
}



/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

StackedAreaChart.prototype.initVis = function(){
	var vis = this;

	vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

	vis.width = 550 - vis.margin.left - vis.margin.right,
    vis.height = 350 - vis.margin.top - vis.margin.bottom;

   // vis.altered_data = [];
    //var arr = [];

    vis.keys = ["Blizzard", "Flood", "Hail", "Hurricane", "Thunderstorm", "Tornado", "Tropical Storm", "Tsunami", "Wildfire"];

/**
    for (var i = 0; i <= 37; i++){
        arr.push((i + 1980));

        var obj = {};

        vis.keys.forEach(function(t){
            var filtered_data = vis.data.filter(function(d){
                return +d.YEAR === i + 1980 && d.EVENT_TYPE === t;
            });

            obj[t] = filtered_data.length;

        });

        vis.altered_data.push(obj);
    }
    **/

    console.log(JSON.stringify(vis.altered_data));

  // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right+ 150)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
       .append("g")
	    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.svg2 = d3.select("#buttons").append("svg").attr("height", vis.height + vis.margin.top + vis.margin.bottom);

	// TO-DO: Overlay with path clipping
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain([dateParser("1980-01-01"), dateParser("2016-01-01")]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .ticks(5)
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");


	// TO-DO: Initialize stack layout
    var dataCategories = colorScale.domain();
    vis.stack = d3.stack()
        .keys(vis.keys);

    vis.stackedData = vis.stack(vis.altered_data);
	
    // TO-DO: Rearrange data

    // TO-DO: Stacked area layout
	vis.area = d3.area()
        //.curve(d3.curveCardinal)
        .x(function(d, i) {return vis.x(dateParser((i + 1980).toString() + "-01-01")); })
        .y0(function(d) {return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); })
        .curve(d3.curveCardinal);

    vis.svg.selectAll("rect.bet")
        .data(vis.keys)
        .enter()
        .append("rect")
        .attr("class", "bet")
        .attr("x", 520)
        .attr("y", function(d, i){
            return i*30 + 10;
        })
        .attr("height", 25)
        .attr("width", 100)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", function(d) {
            return colorScale(d);
        })
        .attr("fill-opacity", 0.7)
        .on("click", function(d, i){
            //vis.keys = ["tornadoes", "hail", "wind"];

            if ($.inArray(d, vis.keys) < 0) {
                vis.keys.splice(vis.keys.length, 0, d);
                d3.select(this).transition().attr("fill", colorScale(d))
                vis.keys.sort();
            }
            else {
                vis.keys.splice($.inArray(d, vis.keys), 1);
                d3.select(this).transition().attr("fill", "gray");
            }


            vis.stack.keys(vis.keys);
            vis.stackedData = vis.stack(vis.altered_data);


            vis.wrangleData();


        });

    vis.svg.selectAll("text")
        .data(vis.keys)
        .enter()
        .append("text")
        .attr("x", 530)
        .attr("y", function(d, i){
            return i*30 + 25;
        })
        .attr("font-size", "12px")
        .attr("stroke", "white")
        .text(function(d, i){
            return d;
        });

    vis.svg.append("text")
        .attr("font-size", "15px")
        .attr("stroke", "white")
        .attr("x", 530)
        .attr("y", 0)
        .text("Filter: ");

    vis.rec = vis.svg.append("svg")
        .attr("class", "rec")
        .attr("width", vis.width - 150)
        .attr("height", vis.height)
        .attr("fill", "none");

	// TO-DO: (Filter, aggregate, modify data)
    vis.wrangleData();
}



/*
 * Data wrangling
 */

StackedAreaChart.prototype.wrangleData = function(){
	var vis = this;

	// In the first step no data wrangling/filtering needed
	vis.displayData = vis.stackedData;

	// Update the visualization
    vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (console.log(x0)enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

StackedAreaChart.prototype.updateVis = function(){
	var vis = this;









    // Update domain
	// Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
	vis.y.domain([0, d3.max(vis.displayData, function(d) {
			return d3.max(d, function(e) {
				return e[1];
			});
		})
	]);
    var dataCategories = vis.keys;

// Draw the layers
    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .style("fill", function(d,i) {
            return colorScale(dataCategories[i]);
        })
        .transition()
        .duration(1000)
        .attr("d", function(d) {
            return vis.area(d);
        });



    // TO-DO: Update tooltip text

	categories.exit().attr("fill-opacity", 0).remove();


	// Call axis functions with the new domain 
	vis.svg.select(".x-axis").transition().duration(1000).call(vis.xAxis);
    vis.svg.select(".y-axis").transition().duration(1000).call(vis.yAxis);
}