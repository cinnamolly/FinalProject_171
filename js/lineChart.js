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
    console.log(this.climateData);
    //console.log(this.tornData);

    this.initVis();
}

LineChart.prototype.initVis = function() {
    var vis = this;

    vis.temp = {};
    vis.parseDate = d3.timeParse("%Y");
    vis.dateParser = d3.timeParse("%Y-%m-%d");

    vis.margin = { top: 40, right: 30, bottom: 60, left: 60 };

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    vis.selectedState = "AL";
    vis.selected = "DEATHS_DIRECT";

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
        .attr("transform", "translate(" + (800 - vis.margin.left - 30) + ",0)")
        .attr("class", "y-axis2 axis");

    console.log(vis.temp);

    vis.temp = insertRelevantData(vis.temp, vis.allData,["DEATHS_DIRECT"]);

    this.updateVis(vis.selected, vis.selectedState);
}


LineChart.prototype.updateVis = function(selected, selectedState) {
    var vis = this;
    vis.selected = selected;
    vis.selectedState = selectedState;

    vis.displayData = vis.temp[states[vis.selectedState]];

    console.log(vis.temp);

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
        .attr("stroke", "#152394")
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
    values.forEach(function (t) {
        data.forEach(function (d) {
            if (d["STATE"] !== "") {
                if (d["STATE"] in temp) {
                    if (typeof temp[d["STATE"]][(+d["YEAR"] - 1980)] !== 'undefined') {
                        if (t in temp[d["STATE"]][(+d["YEAR"] - 1980)])
                        {
                            temp[d["STATE"]][(+d["YEAR"] - 1980)][t] += +d[t];
                        }
                        else {
                            temp[d["STATE"]][(+d["YEAR"] - 1980)][t] = +d[t];
                        }
                    }
                }
            }
        });
    });

    return temp;
}
