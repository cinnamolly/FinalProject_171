

/*
 * ChoroplethMap - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */
//
// ChoroplethMap = function(_parentElement){
//     this.parentElement = _parentElement;
//     this.displayData = []; // see data wrangling
//
//     // DEBUG RAW DATA
//     console.log(this.data);
//
//     this.initVis();
// }
//
//
//
// /*
//  * Initialize visualization (static content, e.g. SVG area or axes)
//  */
//
// ChoroplethMap.prototype.initVis = function(){
    //var vis = this;

var margin = { top: 0, right: 0, bottom: 0, left: 60 };
var america;
 var width = 800 - margin.left - margin.right;
 var height = 400 - margin.top - margin.bottom;

    // SVG drawing area
    var svg = d3.select("#choro").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var projection = d3.geoMercator()
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(scale(0.4,width,height))
        //.projection(projection);
//projection.center();
    //projection.scale(300);
    // TO-DO: Stacked area layout
    // TO-DO: (Filter, aggregate, modify data)
d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
    if (error) throw error;

    svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("fill", "gray")
        .attr("d", path);
});

function scale (scaleFactor,width,height) {
    return d3.geoTransform({
        point: function(x, y) {
            this.stream.point( (x - width/2) * scaleFactor + width/2 , (y - height/2) * scaleFactor + height/2);
        }
    });
}
// };



/*
 * Data wrangling
 */

// ChoroplethMap.prototype.wrangleData = function(){
//     var vis = this;
//
//     // In the first step no data wrangling/filtering needed
//     vis.displayData = vis.stackedData;
//
//     // Update the visualization
//     vis.updateVis();
// }
//


/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

function updateVis(){
    var map = svg.append("g").selectAll("path")
        .data(america);

}
