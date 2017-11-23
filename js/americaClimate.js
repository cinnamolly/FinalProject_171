var margin = { top: 0, right: 0, bottom: 0, left: 60 };
var america, climateData;
var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var climateVis;

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
        console.log(climateData);
        console.log("bet");
        console.log(america);
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
    america = america.sort(function(a,b){
        return a.id - b.id;
    });

    america[8].id = 0;

    america = america.sort(function(a,b){
        return a.id - b.id;
    });

    america[19].geometry.coordinates = [america[19].geometry.coordinates[4]];

    america[21].geometry.coordinates = [america[21].geometry.coordinates[1]];

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
    climateVis = climateData.filter(function(d){
        var dt = +formatDate(d.date);
        return dt === timeScale(selection);
    });
    console.log("climate")
    console.log(climateVis)

    var max_avg = d3.max(climateVis, function(d){ return d.avgTemp});
    var min_avg = d3.min(climateVis, function(d){ return d.avgTemp});
    var color = d3.scaleOrdinal()
        .domain([min_avg, max_avg])
        .range(["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"]);
    var map = svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(america, function(d){
            return d.id;
        });
    console.log(america);
    map.enter().append("path")
        .attr("class", function(d){
            return "state-" + d.id.toString();
        })
        .on("mouseover", function(d){
            console.log(d3.select(this).attr("class"));
        })
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

function changeVis(){
    america = america.sort(function(a,b){
        return a.id - b.id;
    });


    //svg.select("path.state-05").attr("fill", "none");

    var map = svg
        .selectAll("path")
        .data(america, function(d){
            return d.id;
        });

    map.enter().append("path")
        .attr("class", function(d){
            return "state-" + d.id.toString();
        })
        .merge(map)
        .transition()
        .duration(3000)
        .attrTween("d", function(d, i){
            console.log(d);
            var dimensions,
                path_string;
            // specify the dimensions
            dimensions = {
                x: 10*i,
                y: 20,
                height: 3*i,
                width: 5
            };
            // calculate the path string from the dimensions
            path_string = d3.rect(dimensions);


            var interpolator = flubber.interpolate(path(d), path_string);

            return interpolator;})
        .attr("fill", function(d){
            d.id = +d.id;
            var info =climateVis[d.id];
            if (typeof info != 'undefined'){
                return color(info.avgTemp)}
            else{
                return "gray"
            }
        });

    map.exit().remove();

}

function changeVis1(){
    america = america.sort(function(a,b){
        return a.id - b.id;
    });

    var map = svg
        .selectAll("path")
        .data(america, function(d){
        return d.id;
    });
    console.log(america);
    map.enter().append("path")
        .merge(map)
        .transition()
        .duration(3000)
        .attrTween("d", function(d, i){
            var dimensions,
                path_string;
            // specify the dimensions
            dimensions = {
                x: 10*i,
                y: 20,
                height: 3*i,
                width: 5
            };
            // calculate the path string from the dimensions
            path_string = d3.rect(dimensions);


            var interpolator = flubber.interpolate(path_string, path(d));

            return interpolator;})
        //.attr("d", path)
        .attr("fill", function(d){
            d.id = +d.id;
            var info =climateVis[d.id];
            if (typeof info != 'undefined'){
                return color(info.avgTemp)}
            else{
                return "gray"
            }
        });

    map.exit().remove();



}
