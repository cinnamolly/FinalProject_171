var margin = { top: 0, right: 0, bottom: 0, left: 0 };
var america, climateData;
var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var climateVis;

// SVG drawing area
var incidentByState = {};
var states_alpha = ["NULL","Alabama","Hawaii","NULL","Arizona","Arkansas","California","NULL","Colorado","Connecticut","Delaware","NULL","Florida","Georgia","NULL","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","NULL","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","NULL","Washington","West Virginia","Wisconsin","Wyoming"];
var states_pure_alpha = ["Alabama","Hawaii","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii", "Hawaii", "Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

var svg = d3.select("#choro").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(-150,-60)");
var time_labels=["0", "1980", "2016"];
var label1 = ["Severe","Variance"]
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

var labels = ["Severe Weather Event", "Severe Weather Event","4.0", "3.0", "1.0", "-1.0", "-2.0", "-3.0", "-4.0"]
var div = d3.select("#choro").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
queue()
    .defer(d3.json, "https://unpkg.com/us-atlas@1/us/10m.json")
    .defer(d3.csv, "data/variance.csv")
    .defer(d3.csv, "data/171_totalData.csv")
    .await(function(error, us, climate, incidents){
        america = topojson.feature(us, us.objects.states).features;
        climateData = climate;
        climateData.forEach(function(d){
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
    if ($('#button').text() === "Choropleth"){
        console.log("yay");
        changeVis1();
    }

    var timeScale = d3.scaleLinear()
        .domain([0,36])
        .range([1980, 2016]);
    var selection = +d3.select("#dateRange")._groups[0][0].value;
    d3.select("#dateRange-value").text(timeScale(selection));
    var formatDate = d3.timeFormat("%Y")
    climateData.forEach(function(d){
        d.date = +d.date;
        d.avgTemp = +d.avgTemp;
    });

    climateVis = climateData.filter(function(d){
        return +d.date === timeScale(selection);
    });


    var climateByState = {};

    climateVis.forEach(function(d){
        var interior = {}
        interior['date'] = d.date;
        interior['avgTemp'] = d.avgTemp;
        climateByState[d.state] = interior;
    })


    var c = 0;
    var selected = d3.select("#ranking").property("value");

    var nodeFilter = nodes.filter(function(d){
        if (selected === "all") {
            return (+d.year === timeScale(selection)) && ((d.damage !== "0") || (d.damage !== "0K"));
        }
        return (d.event === selected && +d.year === timeScale(selection)) && ((d.damage !== "0") || (d.damage !== "0K"))
    })
    var nodeFilter = nodeFilter.filter(function (d) {
        c = c + 1
        if (c === 10) {
            c = 0
            return d;
        }
    })

    nodeFilter.forEach(function(d){
        var st = (d.state).toLowerCase()
        st = st.charAt(0).toUpperCase() + st.slice(1)
        var n = st.indexOf(" ");
        if (n!== -1){
            st = st.slice(0,n) + " " +st.charAt(n+1).toUpperCase() + st.slice(n+2)
        }
        if (incidentByState[st]){
            if (selected === "all"){
                incidentByState[st] += 1}
            else if(d.event === selected){
                incidentByState[st] += 1
            }
        }
        else{
            if (selected === "all"){
                incidentByState[st] = 1}
            else if(d.event === selected){
                incidentByState[st] = 1
            }
        }
    })

    var max_avg = d3.max(climateVis, function(d){ return d.avgTemp});
    var min_avg = d3.min(climateVis, function(d){ return d.avgTemp});

    var color = d3.scaleOrdinal()
        .domain([min_avg, max_avg])
       // .range(["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"])
    .range(['#c51b7d','#de77ae','#f1b6da','#fde0ef','#c7eae5','#80cdc1','#35978f','#01665e']);

    var text3 = svg.selectAll("g")
        .data(label1)
        .enter()
        .append("text")
    text3.attr("class", "label")
        .attr("x", 85)
        .attr("y", -460)
        .attr("transform", "translate(300,150) rotate(90)")
        .attr("fill", "white")
        .text(function(d){
            return d;
        });
    var text = svg.selectAll("g")
        .data(labels)
        .enter()
        .append("text")
    text.attr("class", "label")
        .attr("x", 820)
        .attr("y", function(d,i){
            return i*36+80
        })
        .attr("fill", "white")
        .text(function(d){
            return d;
        });
    var text2 = svg.selectAll("g")
        .data(time_labels)
        .enter()
        .append("text")
    text2.attr("class", "label")
        .attr("x", function(d, i){
            return 760*i -610;
        })
        .attr("y", 70)
        .attr("fill", "white")
        .text(function(d){
            return d;
        });


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
            var st = states_alpha[d.id]
            div.transition()
                .duration(200)
                .style("opacity", .9)
            div.html(st+ "<br/> Incidents: " + incidentByState[st])
                .style("top", (d3.event.pageY-5680)+"px")
                .style("left",(d3.event.pageX)+"px");


        })
        .on("mouseout",function(d){
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .merge(map)
        .transition()
        .duration(1000)
        .attr("d", path)
        .attr("fill", function(d){
            d.id = +d.id;
            var st = states_alpha[d.id]
            if (st !== "NULL"){
                var info = climateByState[st];
                if (typeof info != 'undefined'){
                    return color(+info.avgTemp)}
                else{
                    return "gray"
                }
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
            .attr("transform", function (d) {
                var p = projection([d.longitude, d.latitude])
                if (p != null) {
                    var x = p[0] * .7 + 215
                    var y = p[1] * .7 + 155
                    return "translate(" + x + "," + y + ")";
                }
                return;
            })
            .attr("fill", "#152394")
            .attr("stroke", "black");

    if (d3.select("#myCheckbox").property("checked")) {
        svg.selectAll(".node1").attr("fill-opacity", 0.0)
            .attr("stroke-opacity", 0.0);
    }
    else{
        svg.selectAll(".node1").attr("fill-opacity", 0.5)
            .attr("stroke-opacity", 0.5);

    }
    node.exit().transition().attr("r", 0).remove();

    map.exit().remove();


    d3.select(".choropleth svg").selectAll("rect")
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

    d3.select(".choropleth svg")
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
    document.getElementById("ranking").disabled = true;
    document.getElementById("myCheckbox").disabled = true;
    document.getElementById("dateRange").disabled = true;


    var max_incidents = d3.max(d3.values(incidentByState));
    var min_incidents = d3.min(d3.values(incidentByState));
    console.log(min_incidents)
    console.log(max_incidents)
    var numIncidents = d3.scaleLinear()
        .domain([min_incidents, max_incidents])
        // .range(["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"])
        .range([0, 150]);

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
    var climateByState = {};

    climateVis.forEach(function(d){
        var interior = {}
        interior['date'] = d.date;
        interior['avgTemp'] = d.avgTemp;
        climateByState[d.state] = interior;
    })
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
        .on("mouseover", function(d){
            var st = states_alpha[d.id]
            console.log("HERE")
            div.transition()
                .duration(200)
                .style("opacity", .9)
            div.html(st+ "<br/> Incidents: " + incidentByState[st])
                .style("top", (d3.event.pageY-5680)+"px")
                .style("left",(d3.event.pageX)+"px");
        })
        .on("mouseout",function(d){
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .duration(3000)
        .attrTween("d", function(d, i) {
            console.log(d.id)
            var s = states_alpha[d.id]
            if (s !== "NULL") {
                var c = incidentByState[s]
                //console.log(s)
                var h = numIncidents(c)
                console.log(h)
                var dimensions,
                    path_string;
                // specify the dimensions
                if (h===0){
                    h = 1;
                }
                dimensions = {
                    x: 12 * i + 140,
                    y: height - h,
                    height: h,
                    width: 9
                };

                console.log(dimensions)

                // calculate the path string from the dimensions
                //if (typeof dimensions != 'undefined') {
                console.log(s)
                path_string = d3.rect(dimensions);
                var interpolator = flubber.interpolate(path(d), path_string);
                console.log(interpolator)
                return interpolator;
            }
            })
        .attr("fill", function(d){
            d.id = +d.id;
            var st = states_alpha[d.id]
            if (st !== "NULL"){
                var info = climateByState[st];
                if (typeof info != 'undefined'){
                    return color(+info.avgTemp)}
                else{
                    return "gray"
                }
            }
        });
    map.exit().remove();

}

function changeVis1(){
    document.getElementById("ranking").disabled = false;
    document.getElementById("myCheckbox").disabled = false;
    document.getElementById("dateRange").disabled = false;
    document.getElementById("dateRange").style.color = "green";

    var max_incidents = d3.max(d3.values(incidentByState));
    var min_incidents = d3.min(d3.values(incidentByState));
    console.log(min_incidents)
    console.log(max_incidents)
    var numIncidents = d3.scaleLinear()
        .domain([min_incidents, max_incidents])
        // .range(["#d73027","#f46d43","#fdae61","#fee090","#e0f3f8","#abd9e9","#74add1","#4575b4"])
        .range([0, 150]);
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

    var climateByState = {};

    climateVis.forEach(function(d){
        var interior = {}
        interior['date'] = d.date;
        interior['avgTemp'] = d.avgTemp;
        climateByState[d.state] = interior;
    })
    if(d3.select("#myCheckbox").property("checked") === false) {
        svg.selectAll(".node1").attr("fill-opacity", .5).attr("stroke-opacity", 0.5).attr("fill", "#152394").attr("stroke", "black").attr("r", 0).transition().delay(3000).attr("r", 5);
    }
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
        .on("mouseover", function(d){
            console.log(d3.select(this).attr("class"));
            var st = states_alpha[d.id]
            console.log("HERE")
            div.transition()
                .duration(200)
                .style("opacity", .9)
            div.html(st+ "<br/> Incidents: " + incidentByState[st])
                .style("top", (d3.event.pageY-5680)+"px")
                .style("left",(d3.event.pageX)+"px");
        })
        .on("mouseout",function(d){
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .duration(3000)
        .attrTween("d", function(d, i){
            console.log(d.id)
            var s = states_alpha[d.id]
            if (s !== "NULL") {
                var c = incidentByState[s]
                //console.log(s)
                var h = numIncidents(c)
                console.log(h)
                var dimensions,
                    path_string;
                // specify the dimensions
                if (h===0){
                    h = 1;
                }
                dimensions = {
                    x: 12 * i + 140,
                    y: height - h,
                    height: h,
                    width: 9
                };

                console.log(dimensions)

                // calculate the path string from the dimensions
                //if (typeof dimensions != 'undefined') {
                console.log(s)
                path_string = d3.rect(dimensions);
                var interpolator = flubber.interpolate(path_string, path(d));
                console.log(interpolator)
                return interpolator;
            }
        })
        //.attr("d", path)
        .attr("fill", function(d){
            d.id = +d.id;
            var st = states_alpha[d.id]
            if (st !== "NULL"){
                var info = climateByState[st];
                if (typeof info != 'undefined'){
                    return color(+info.avgTemp)}
                else{
                    return "gray"
                }
            }
        });
    map.exit().remove();



}
