

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

    //vis.altered_data = [];
    //var arr = [];

    vis.keys = ["tornadoes", "hail", "wind"];

/**
    for (var i = 0; i <= 61; i++){
        arr.push((i + 1955));
        var filtered_data_torn = vis.data.filter(function(d){
            return +d.year === i + 1955 && d.type === "Tornado";
        });

        var filtered_data_hail = vis.data.filter(function(d){
            return +d.year === i + 1955 && d.type === "Hail";
        });

        var filtered_data_wind = vis.data.filter(function(d){
            return +d.year === i + 1955 && d.type === "Wind";
        });

        var obj = {tornadoes: filtered_data_torn.length, hail: filtered_data_hail.length, wind: filtered_data_wind.length};

        vis.altered_data.push(obj);
    }
 */

    var jsonObject = JSON.stringify(vis.altered_data);
    console.log(jsonObject);

  // SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
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
        .domain([dateParser("1955-01-01"), dateParser("2016-01-01")]);

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
        .x(function(d, i) {return vis.x(dateParser((i + 1955).toString() + "-01-01")); })
        .y0(function(d) {return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    vis.svg2.selectAll("rect.bet")
        .data(["Wind", "hail", "Tornadoes"])
        .enter()
        .append("rect")
        .attr("class", "bet")
        .attr("x", 0)
        .attr("y", function(d, i){
            return i*30 + 83;
        })
        .attr("height", 25)
        .attr("width", 80)
        .attr("fill", function(d) {
            return colorScale(d.toLowerCase());
        })
        .on("click", function(d, i){
            //vis.keys = ["tornadoes", "hail", "wind"];

            if ($.inArray(d.toLowerCase(), vis.keys) < 0) {
                vis.keys.splice(vis.keys.length, 0, d.toLowerCase());
                d3.select(this).transition().attr("fill", colorScale(d.toLowerCase()));
            }
            else {
                vis.keys.splice($.inArray(d.toLowerCase(), vis.keys), 1);
                d3.select(this).transition().attr("fill", "gray");
            }


            vis.stack.keys(vis.keys);
            vis.stackedData = vis.stack(vis.altered_data);


            vis.wrangleData();


        });

	// TO-DO: Tooltip placeholder
    vis.svg2.selectAll("text")
        .data(["Wind", "Hail", "Tornadoes"])
        .enter()
        .append("text")
        .attr("x", 10)
        .attr("y", function(d, i){
            return i*30 + 100;
        })
        .attr("font-size", "12px")
        .attr("stroke", "white")
        .text(function(d, i){
            return d;
        });

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
 * The drawing function - should use the D3 update sequence (enter, update, exit)
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
        .attr("d", function(d) {
            return vis.area(d);
        });



    // TO-DO: Update tooltip text

	categories.exit().attr("fill-opacity", 0).remove();


	// Call axis functions with the new domain 
	vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
}
