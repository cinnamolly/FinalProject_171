/*
 * LineChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

var states = {"AL":"ALABAMA","AK":"ALASKA","AS":"AMERICAN SAMOA","AZ":"ARIZONA","AR":"ARKANSAS","CA":"CALIFORNIA","CO":"COLORADO","CT":"CONNECTICUT","DE":"DELAWARE","DC":"DISTRICT OF COLUMBIA","FM":"FEDERATED STATES OF MICRONESIA","FL":"FLORIDA","GA":"GEORGIA","GU":"GUAM","HI":"HAWAII","ID":"IDAHO","IL":"ILLINOIS","IN":"INDIANA","IA":"IOWA","KS":"KANSAS","KY":"KENTUCKY","LA":"LOUISIANA","ME":"MAINE","MH":"MARSHALL ISLANDS","MD":"MARYLAND","MA":"MASSACHUSETTS","MI":"MICHIGAN","MN":"MINNESOTA","MS":"MISSISSIPPI","MO":"MISSOURI","MT":"MONTANA","NE":"NEBRASKA","NV":"NEVADA","NH":"NEW HAMPSHIRE","NJ":"NEW JERSEY","NM":"NEW MEXICO","NY":"NEW YORK","NC":"NORTH CAROLINA","ND":"NORTH DAKOTA","MP":"NORTHERN MARIANA ISLANDS","OH":"OHIO","OK":"OKLAHOMA","OR":"OREGON","PW":"PALAU","PA":"PENNSYLVANIA","PR":"PUERTO RICO","RI":"RHODE ISLAND","SC":"SOUTH CAROLINA","SD":"SOUTH DAKOTA","TN":"TENNESSEE","TX":"TEXAS","UT":"UTAH","VT":"VERMONT","VI":"VIRGIN ISLANDS","VA":"VIRGINIA","WA":"WASHINGTON","WV":"WEST VIRGINIA","WI":"WISCONSIN","WY":"WYOMING"};


LineChart = function(_parentElement, file1, file2){
    this.parentElement = _parentElement;
    this.climateData = file1;
    this.allData = file2;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    //console.log(this.climateData);
    //console.log(this.tornData);

    this.initVis();
}

LineChart.prototype.initVis = function() {
    var vis = this;

    vis.temp = {};
    vis.parseDate = d3.timeParse("%Y");
    vis.dateParser = d3.timeParse("%Y-%m-%d");

    vis.margin = { top: 40, right: 80, bottom: 60, left: 60 };

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    vis.selectedState = "AL";
    vis.selected = "DEATHS";

    vis.climateData.forEach(function (d) {
        if (d.state.toUpperCase() in vis.temp) {
            if (typeof vis.temp[d.state.toUpperCase()][(+(d.date.substring(0, 4)) - 1980)] !== 'undefined')
            {
                vis.temp[d.state.toUpperCase()][(+(d.date.substring(0, 4)) - 1980)].avgTemp = +d.avgTemp;
                    // * (9.0 / 5.0) + 32.0;
            }
            else {
                var innertemp = {};
                innertemp.date = d.date.substring(0, 4);
                innertemp.avgTemp = +d.avgTemp;
                    // * (9.0 / 5.0) + 32.0;
                vis.temp[d.state.toUpperCase()][(+(d.date.substring(0, 4)) - 1980)] = innertemp;
            }
        }
        else {
            vis.temp[d.state.toUpperCase()] = new Array(36);
            var innertemp = {};
            innertemp.date = d.date.substring(0, 4);
            innertemp.avgTemp = +d.avgTemp;
                // * (9.0 / 5.0) + 32.0;
            vis.temp[d.state.toUpperCase()][(+(d.date.substring(0, 4)) - 1980)] = innertemp;
        }

        // d.date = dateParser(String(d.date));
        // d.avgTemp = +d.avgTemp;
        // * (9.0 / 5.0) + 32.0
    });

    // SVG drawing area
    vis.svg = d3.select("." + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // SVG drawing area
    vis.svg2 = d3.select(".line-text2").append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width])
        .domain([parseDate("1980"), parseDate("2016")]);

    vis.svg.append("g")
        .attr("transform", "translate(0," + vis.height + ")")
        .attr("class", "x-axis axis");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("g")
        .attr("transform", "translate(" + (800 - vis.margin.left - 80) + ",0)")
        .attr("class", "y-axis2 axis");

    vis.temp = insertRelevantData(vis.temp, vis.allData,["DEATHS", "INJURIES", "DAMAGE"]);
    //vis.temp = insertRelevantData(vis.temp, vis.allData,["DAMAGE"]);


    this.updateVis(vis.selected, vis.selectedState);
}


LineChart.prototype.updateVis = function(selected, selectedState) {
    var colors =["#D82492", "#06a7a4"]
    var list = ["Climate Variance", "Severe Weather"]

    var data_test = [1];
    var vis = this;

    // vis.svg.append("circle")
    //     .attr("class", "Dotted")
    //     .attr("fill", "white")
    //     .attr("cy", 340)
    //     .attr("cx",340)
    //     .attr("r", 50);
    // vis.svg.append("circle")       // attach a circle
    //     .attr("cx", 200)          // position the x-centre
    //     .attr("cy", 100)          // position the y-centre
    //     .attr("r", 50)            // set the radius
    //     //.style("stroke-dasharray", ("10,3")) // make the stroke dashed
    //     .style("stroke", "red")   // set the line colour
    //     .style("fill", "none");
    vis.selected = selected;
    vis.selectedState = selectedState;
    var rect = vis.svg2.selectAll("rect")
        .data(colors)
        .enter()
        .append("rect")
        .attr("x", -60)
        .attr("y", function(d,i){
            return -40+18*i;
        })
        .attr("fill", function(d){
            return d;
        })
        .attr("stroke", "black")
        .attr("height", 15)
        .attr("width", 15);
    var t = vis.svg.selectAll(".label2")
        .data(data_test);
    t.enter().append("text")
        .attr("class", "label2")
        .merge(t)
        .transition()
        .duration(1000)
        .attr("x", 665)
        .attr("y", -7)
        .attr("fill", "white")
        .text(function(d){
            if (vis.selected === 'DAMAGE'){
                return vis.selected + "($)"
            }
            return vis.selected;
        });

    var t3 = vis.svg2.selectAll(".label4")
        .data(data_test);
    t3.enter().append("text")
        .attr("class", "label4")
        .merge(t3)
        .transition()
        .duration(1000)
        .attr("x", 46)
        .attr("y", -10)
        .attr("fill", "white")
        .style("font-size", 12)
        .text(function(d){
            if (vis.selected === 'DAMAGE'){
                console.log(vis.selected);
                return "Damage";
            }
            else if (vis.selected === 'DEATHS'){
                console.log(vis.selected);
                return "Deaths";
            }
            else{
                console.log(vis.selected);
                return "Injuries";
            }
        });

    var t2 = vis.svg2.selectAll(".label3")
        .data(list);
    t2.enter().append("text")
        .attr("class", "label3")
        .merge(t2)
        .transition()
        .duration(1000)
        .attr("x", -40)
        .attr("y", function(d,i){
            return -28+18*i;
        })
        .attr("fill", "white")
        .style("font-size", 12)
        .text(function(d){
            return d
        });

    t.exit().remove();
    t3.exit().remove();
    vis.svg.append("text")
        .attr("fill", "white")
        .attr("y", 340)
        .attr("x",340)
        .text("Year");

    vis.svg.append("text")
        .attr("fill", "white")
        .attr("y", -7)
        .attr("x",-60)
        .text("VARIANCE");

    vis.displayData = vis.temp[states[vis.selectedState]];

    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
        .domain(d3.extent(vis.displayData, function (d) {
            if (typeof d !== 'undefined') {
                return d.avgTemp;
            }
        }));

    vis.y2 = d3.scaleLinear()
        .range([vis.height, 0])
        .domain(d3.extent(vis.displayData, function (d) {
            if (typeof d !== 'undefined' && vis.selected in d) {
                return d[vis.selected];
            }
        }));

    vis.xAxis = d3.axisBottom()
        .ticks(12)
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.yAxis2 = d3.axisRight()
        .scale(vis.y2);

    vis.valueline = d3.line()
        .defined(function(d) {return typeof d !== 'undefined'})
        .x(function(d) { if (typeof d !== 'undefined') {return vis.x(parseDate(d.date));} })
        .y(function(d) { if (typeof d !== 'undefined') {return vis.y(d.avgTemp);} });

    vis.valueline2 = d3.line()
        .defined(function(d) { return typeof d !== 'undefined' && vis.selected in d; })
        .x(function(d) { return vis.x(parseDate(d.date)); })
        .y(function(d) { return vis.y2(d[vis.selected]); });

    // Add the valueline path.
    var line1 = vis.svg.selectAll("#line")
        .data([vis.displayData]);

    line1.enter().append("path")
        .attr("id", "line")
        .attr("stroke", "#D82492")
        .attr("stroke-width", 3)
        .merge(line1).transition().duration(1000)
        .attr("d", vis.valueline);

    // Add the valueline2 path.
    var line2 = vis.svg.selectAll("#line2")
        .data([vis.displayData]);

    line2.enter().append("path")
        .attr("id", "line2")
        .attr("stroke", "#06a7a4")
        .attr("stroke-width", 3)
        .merge(line2).transition().duration(1000)
        .attr("d", vis.valueline2);


    line1.exit().remove();
    line2.exit().remove();

    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
    vis.svg.select(".y-axis2").call(vis.yAxis2);
}


function insertRelevantData(temp, data, values) {
    var map = {"DEATHS": ["DEATHS_DIRECT", "DEATHS_INDIRECT"], "INJURIES": ["INJURIES_DIRECT", "INJURIES_INDIRECT"], "DAMAGE":["DAMAGE_PROPERTY", "DAMAGE_CROPS"]};

    values.forEach(function (t) {
        data.forEach(function (d) {
            if (d["STATE"] !== "") {
                if (d["STATE"] in temp) {
                    if (typeof temp[d["STATE"]][(+d["YEAR"] - 1980)] !== 'undefined') {
                        map[t].forEach(function(w) {
                            if (t in temp[d["STATE"]][(+d["YEAR"] - 1980)])
                            {
                                temp[d["STATE"]][(+d["YEAR"] - 1980)][t] += translate(d[w]);
                            }
                            else {
                                temp[d["STATE"]][(+d["YEAR"] - 1980)][t] = translate(d[w]);
                            }

                        });
                    }
                }
            }
        });
    });

    return temp;
}

function translate(value) {
    if (value[value.length - 1] === "K" || value[value.length - 1] === "k") {
        return +(value.substring(0, value.length - 1)) * 1000;
    }
    else if (value[value.length - 1] === "M") {
        return +(value.substring(0, value.length - 1)) * 1000000;
    }
    else if (value[value.length - 1] === "B") {
        return +(value.substring(0, value.length - 1)) * 1000000000;
    }
    else if (value[value.length - 1] === "T") {
        return +(value.substring(0, value.length - 1)) * 1000000000000;
    }
    else if (value[value.length - 1] === "h" || value[value.length - 1] === "H") {
        return +(value.substring(0, value.length - 1)) * 100;
    }
    else if (value[value.length - 1] === "?") {
        return +(value.substring(0, value.length - 1));
    }
    else if (value.length !== 0) {
        return +value;
    }
    else {
        return 0;
    }

}


LineChart.prototype.pic1 = function ()
{
    console.log("PIC1")
    var vis = this;
    var circ;
    var txt;
    var txt2;
    setTimeout(function(){
        txt = vis.svg.append("text")
            .attr("class", "label")
            .attr("fill", "white")
            .attr("x", 320)
            .attr("y", 30)
            //.attr("dy", "0em")
            .html("We can see that during Hurricane Sandy");
        txt2 = vis.svg.append("text")
                .attr("class", "label")
                .attr("fill", "white")
                .attr("x", 320)
                .attr("y", 42)
                .html("there was an uptick in weather variance.")
        circ= vis.svg.append("circle")       // attach a circle
            .attr("cx", 585)          // position the x-centre
            .attr("cy", 30)          // position the y-centre
            .attr("r", 50)            // set the radius
            .style("stroke-dasharray", ("10,3")) // make the stroke dashed
            .style("stroke", "red")   // set the line colour
            .style("fill", "none");
    }, 1200);

    setTimeout(function(){
            circ.transition()
            .duration(3000)
            .remove()
        txt.transition()
            .duration(3000)
            .remove()
        txt2.transition()
            .duration(3000)
            .remove()
    }, 7000);

    // d3.selectAll('circle').remove()
    //     .transition()
    //     .duration(3000);
    //document.getElementById('img').style.display='block';
}
LineChart.prototype.pic2 = function ()
{
    console.log("PIC2")
    var vis = this;
    var circ;
    var txt;
    var txt2;
    setTimeout(function(){
        txt = vis.svg.append("text")
            .attr("class", "label")
            .attr("fill", "white")
            .attr("x", 320)
            .attr("y", 30)
            //.attr("dy", "0em")
            .html("We can see that during the Joplin Tornado");
        txt2 = vis.svg.append("text")
            .attr("class", "label")
            .attr("fill", "white")
            .attr("x", 320)
            .attr("y", 42)
            .html("there was an uptick in weather variance.")
        circ= vis.svg.append("circle")       // attach a circle
            .attr("cx", 585)          // position the x-centre
            .attr("cy", 30)          // position the y-centre
            .attr("r", 50)            // set the radius
            .style("stroke-dasharray", ("10,3")) // make the stroke dashed
            .style("stroke", "red")   // set the line colour
            .style("fill", "none");
    }, 1200);

    setTimeout(function(){
        circ.transition()
            .duration(3000)
            .remove()
        txt.transition()
            .duration(3000)
            .remove()
        txt2.transition()
            .duration(3000)
            .remove()
    }, 7000);
}
LineChart.prototype.pic3 = function ()
{
    console.log("PIC3")
    var vis = this;
    var circ;
    var txt;
    var txt2;
    setTimeout(function(){
        txt = vis.svg.append("text")
            .attr("class", "label")
            .attr("fill", "white")
            .attr("x", 160)
            .attr("y", 30)
            //.attr("dy", "0em")
            .html("We can see that during Hurricane Katrina there was");
        txt2 = vis.svg.append("text")
            .attr("class", "label")
            .attr("fill", "white")
            .attr("x", 160)
            .attr("y", 42)
            .html("an uptick in climate variance surrounding the event.")
        circ= vis.svg.append("circle")       // attach a circle
            .attr("cx", 470)          // position the x-centre
            .attr("cy", 30)          // position the y-centre
            .attr("r", 50)            // set the radius
            .style("stroke-dasharray", ("10,3")) // make the stroke dashed
            .style("stroke", "red")   // set the line colour
            .style("fill", "none");
    }, 1200);

    setTimeout(function(){
        circ.transition()
            .duration(3000)
            .remove()
        txt.transition()
            .duration(3000)
            .remove()
        txt2.transition()
            .duration(3000)
            .remove()
    }, 7000);
}

