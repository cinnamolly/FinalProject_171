var margin = { top: 0, right: 0, bottom: 0, left: 60 };
var america, climateData;
var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

// SVG drawing area

var states_alpha = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida",
    "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana","Iowa", "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
    "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
    "New York","North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota","Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
var svg = d3.select("#choro").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var projection = d3.geoMercator()
    .translate([width / 2, height / 2]);

var path = d3.geoPath()
    .projection(scale(0.4,width,height));
var parseDate = d3.timeParse("%Y-%m-%d");
console.log(parseDate("1950-02-01"));
queue()
    .defer(d3.json, "https://unpkg.com/us-atlas@1/us/10m.json")
    .defer(d3.csv, "data/stateClimateYear.csv")
    .await(function(error, us, climate){
        america = topojson.feature(us, us.objects.states).features;
        climateData = climate;
        climateData.forEach(function(d){
            var parseDate = d3.timeParse("%Y");
            d.date = parseDate(String(d.date));
            d.avgTemp = +d.avgTemp*(9.0/5.0)+32.0
        });
        console.log(climateData)
        updateVis();
    });

function scale (scaleFactor,width,height) {
    return d3.geoTransform({
        point: function(x, y) {
            this.stream.point( (x - width/2) * scaleFactor + width/2 , (y - height/2) * scaleFactor + height/2);
        }
    });
}

function updateVis(){
    var timeScale = d3.scaleLinear()
        .domain([0,63])
        .range([1950, 2013]);
    var selection = +d3.select("#dateRange")._groups[0][0].value
    d3.select("#dateRange-value").text(timeScale(selection));
    // var date = parseDate("1950-02-01");
    // var climateVis = climateData.filter(function(d){
    //     return d.date === date;
    // });
    console.log(climateData)
    var formatDate = d3.timeFormat("%Y")
    var climateVis = climateData.filter(function(d){
        var dt = +formatDate(d.date);
        return dt === timeScale(selection);
    });
    console.log(climateVis[0])

    var max_avg = d3.max(climateData, function(d){ return d.avgTemp});
    var min_avg = d3.min(climateData, function(d){ return d.avgTemp});
    var color = d3.scaleOrdinal()
        .domain([min_avg, max_avg])
        .range(["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"]);
    var map = svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(america);
    console.log(america);
    map.enter().append("path")
        .merge(map)
        .transition()
        .duration(1000)
        .attr("d", path)
        .attr("fill", function(d){
            d.id = +d.id;
            var info =climateVis[d.id]
            if (typeof info != 'undefined'){
                return color(info.avgTemp)}
            else{
                return "gray"
            }
        });

    map.exit().remove();

}
