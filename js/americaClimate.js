var margin = { top: 0, right: 0, bottom: 0, left: 0 };
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
    .attr("transform", "translate(-150,-60)");

var bet = svg.append("g")
    .attr("class", "states");
var nodes=[];
var nodes_wind = [];
var nodes_torn = [];
var nodeFilter;
var projection = d3.geoAlbersUsa()
    .translate([(width/4)*.01+330, (height/4)*.01+150]);
var path = d3.geoPath()
    .projection(scale(0.6,width,height));
var parseDate = d3.timeParse("%Y-%m-%d");



queue()
    .defer(d3.json, "https://unpkg.com/us-atlas@1/us/10m.json")
    .defer(d3.csv, "data/variance.csv")
    .defer(d3.csv, "data/171_totalData.csv")
    .await(function(error, us, climate, incidents){
        america = topojson.feature(us, us.objects.states).features;
        climateData = climate;
        climateData.forEach(function(d){
            //var parseDate = d3.timeParse("%Y");
            d.date = +d.date;
            d.avgTemp = +d.avgTemp;
        });
        console.log(climateData)

        america = america.sort(function(a,b){
            return a.id - b.id;
        });

        america[8].id = 0;

        america = america.sort(function(a,b){
            return a.id - b.id;
        });

        america[19].geometry.coordinates = [america[19].geometry.coordinates[4]];

        america[21].geometry.coordinates = [america[21].geometry.coordinates[1]];
        incidents.forEach(function(d){
            var interior_data = {};
            interior_data['latitude'] = d.BEGIN_LAT;
            interior_data['longitude'] = d.BEGIN_LON;
            interior_data['event'] = d.EVENT_TYPE;
            interior_data['state'] = d.STATE;
            interior_data['year'] = d.YEAR;
            interior_data['damage'] = d.DAMAGE_PROPERTY;
            nodes.push(interior_data)
        });
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
    console.log("UPDATE VIS")
    console.log(climateData)
    var timeScale = d3.scaleLinear()
        .domain([0,36])
        .range([1980, 2016]);
    var selection = +d3.select("#dateRange")._groups[0][0].value;
    d3.select("#dateRange-value").text(timeScale(selection));
    // var date = parseDate("1950-02-01");
    // var climateVis = climateData.filter(function(d){
    //     return d.date === date;
    // });
    var formatDate = d3.timeFormat("%Y")
    console.log(climateData)
    climateVis = climateData.filter(function(d){
        console.log(d.date)
        return d.date === timeScale(selection);
    });
    console.log(climateVis)


    var nodeFilter = nodes.filter(function(d){
        return (+d.year === timeScale(selection)) && ((d.damage !== "0") || (d.damage !== "0K"));
    })
    console.log(nodeFilter)

    var max_avg = d3.max(climateVis, function(d){ return d.avgTemp});
    var min_avg = d3.min(climateVis, function(d){ return d.avgTemp});
    var color = d3.scaleOrdinal()
        .domain([min_avg, max_avg])
       // .range(["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"])
    .range(['#c51b7d','#de77ae','#f1b6da','#fde0ef','#c7eae5','#80cdc1','#35978f','#01665e']);

    var map = bet
        .selectAll("path")
        .data(america, function(d){
            return d.id;
        });

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
    var node = svg.selectAll(".node1")
        .data(nodeFilter);
    node.enter().append("circle")
        .attr("class", "node1")
        .merge(node)
        .transition()
        .duration(1000)
        .attr("r", 5)
        .attr("transform", function(d) {
            var p = projection([d.longitude, d.latitude])
            if (p != null)
            {
                var x = p[0]*.7+215
                var y = p[1]*.7+155
                return "translate(" +x+","+y+")";
            }
            return;
        })
        .attr("fill", "#152394")
        .attr("stroke", "black")
        .attr("fill-opacity", 0.5)
        .attr("stroke-opacity", 0.5);

    node.exit().transition().attr("r", 0).remove();

    map.exit().remove();

    console.log(color.range());

    d3.select("svg").selectAll("rect")
        .data(color.range())
        .enter()
        .append("rect")
        .attr("x", 625)
        .attr("y", function(d, i){
            return i *30 + 80;
        })
        .attr("fill", function(d){
            return d;
        })
        .attr("height", 30)
        .attr("width", 30);

    d3.select("svg")
        .append("circle")
        .attr("cx", 640)
        .attr("cy", 50)
        .attr("r", 5)
        .attr("fill","#152394")
        .attr("stroke", "black")
        .attr("fill-opacity", 0.5)
        .attr("stroke-opacity", 0.5);


}

function visTrans(){
    if ($('#button').text() === "Bar Chart"){
        changeVis();
    }else{
        changeVis1();
    }

}

function changeVis(){

    $("#button").text("Choropleth");
    var max_avg = d3.max(climateVis, function(d){ return d.avgTemp});
    var min_avg = d3.min(climateVis, function(d){ return d.avgTemp});
    var color = d3.scaleOrdinal()
        .domain([min_avg, max_avg])
        .range(['#c51b7d','#de77ae','#f1b6da','#fde0ef','#c7eae5','#80cdc1','#35978f','#01665e']);
    console.log("CHANGE VIS");
    svg.selectAll(".node1").attr("fill", "none").attr("stroke", "none");
    //svg.selectAll(".node2").attr("fill", "none").attr("stroke", "none");
    //svg.selectAll(".node3").attr("fill", "none").attr("stroke", "none");
    // node.exit().remove();
    // node_t.exit().remove();
    // node_w.exit().remove();

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

            var dimensions,
                path_string;
            // specify the dimensions
            dimensions = {
                x: 10*i+150,
                y: height - 3*i,
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
    $("#button").text("Bar Chart");
    var max_avg = d3.max(climateVis, function(d){ return d.avgTemp});
    var min_avg = d3.min(climateVis, function(d){ return d.avgTemp});
    var color = d3.scaleOrdinal()
        .domain([min_avg, max_avg])
        .range(['#c51b7d','#de77ae','#f1b6da','#fde0ef','#c7eae5','#80cdc1','#35978f','#01665e']);
    console.log("CHANGE VIS 1")
    //svg.selectAll(".node1").attr("fill-opacity", 0).attr("stroke-opacity", 0).transition().delay(3000).attr("fill-opacity", 0.7).attr("stroke-opacity", 0.7).attr("fill", "#06a7a4").attr("stroke", "black");
    //svg.selectAll(".node2").attr("fill-opacity", 0).attr("stroke-opacity", 0).transition().delay(3000).attr("fill-opacity", 0.7).attr("stroke-opacity", 0.7).attr("fill", "#152394").attr("stroke", "black");
    //svg.selectAll(".node3").attr("fill-opacity", 0).attr("stroke-opacity", 0).transition().delay(3000).attr("fill-opacity", 0.7).attr("stroke-opacity", 0.7).attr("fill", "#d82492").attr("stroke", "black");
    // node.exit().remove();
    // node_t.exit().remove();
    // node_w.exit().remove();


    svg.selectAll(".node1").attr("fill-opacity", .5).attr("stroke-opacity", 0.5).attr("fill", "#152394").attr("stroke", "black").attr("r", 0).transition().delay(3000).attr("r",5);
   // svg.selectAll(".node2").attr("fill-opacity", .5).attr("stroke-opacity", 0.5).attr("r", 0).attr("fill", "#152394").attr("stroke", "black").transition().delay(3000).attr("r",5);
    //svg.selectAll(".node3").attr("fill-opacity", .5).attr("stroke-opacity", 0.5).attr("r", 0).attr("fill", "#152394").attr("stroke", "black").transition().delay(3000).attr("r",5);
    america = america.sort(function(a,b){
        return a.id - b.id;
    });

    var map = svg
        .selectAll("path")
        .data(america, function(d){
        return d.id;
    });

    map.enter().append("path")
        .merge(map)
        .transition()
        .duration(3000)
        .attrTween("d", function(d, i){
            var dimensions,
                path_string;
            // specify the dimensions
            dimensions = {
                x: 10*i+150,
                y: height - 3*i,
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
