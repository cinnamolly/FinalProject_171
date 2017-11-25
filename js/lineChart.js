/*
 * LineChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

var states_hash =
    {
        'Alabama': 'AL',
        'Alaska': 'AK',
        'American Samoa': 'AS',
        'Arizona': 'AZ',
        'Arkansas': 'AR',
        'California': 'CA',
        'Colorado': 'CO',
        'Connecticut': 'CT',
        'Delaware': 'DE',
        'District Of Columbia': 'DC',
        'Federated States Of Micronesia': 'FM',
        'Florida': 'FL',
        'Georgia': 'GA',
        'Guam': 'GU',
        'Hawaii': 'HI',
        'Idaho': 'ID',
        'Illinois': 'IL',
        'Indiana': 'IN',
        'Iowa': 'IA',
        'Kansas': 'KS',
        'Kentucky': 'KY',
        'Louisiana': 'LA',
        'Maine': 'ME',
        'Marshall Islands': 'MH',
        'Maryland': 'MD',
        'Massachusetts': 'MA',
        'Michigan': 'MI',
        'Minnesota': 'MN',
        'Mississippi': 'MS',
        'Missouri': 'MO',
        'Montana': 'MT',
        'Nebraska': 'NE',
        'Nevada': 'NV',
        'New Hampshire': 'NH',
        'New Jersey': 'NJ',
        'New Mexico': 'NM',
        'New York': 'NY',
        'North Carolina': 'NC',
        'North Dakota': 'ND',
        'Northern Mariana Islands': 'MP',
        'Ohio': 'OH',
        'Oklahoma': 'OK',
        'Oregon': 'OR',
        'Palau': 'PW',
        'Pennsylvania': 'PA',
        'Puerto Rico': 'PR',
        'Rhode Island': 'RI',
        'South Carolina': 'SC',
        'South Dakota': 'SD',
        'Tennessee': 'TN',
        'Texas': 'TX',
        'Utah': 'UT',
        'Vermont': 'VT',
        'Virgin Islands': 'VI',
        'Virginia': 'VA',
        'Washington': 'WA',
        'West Virginia': 'WV',
        'Wisconsin': 'WI',
        'Wyoming': 'WY'
    };

LineChart = function(_parentElement, file1, file2, file3, file4, file5){
    this.parentElement = _parentElement;
    this.allData = file1;
    this.climateData = file2;
    this.tornData = file3;
    this.hailData = file4;
    this.windData = file5;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    console.log(this.climateData);
    console.log(this.tornData);

    this.initVis();
}

LineChart.prototype.initVis = function() {
    var vis = this;

    vis.temp = {};
    vis.parseDate = d3.timeParse("%Y");
    vis.dateParser = d3.timeParse("%Y-%m-%d");

    vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    vis.selectedState = "AL";
    vis.selected = "fat";

    vis.climateData.forEach(function (d) {
        if (states_hash[d.state] in vis.temp) {
            if (typeof vis.temp[states_hash[d.state]][(+(d.date.substring(0, 4)) - 1950)] !== 'undefined')
            {
                vis.temp[states_hash[d.state]][(+(d.date.substring(0, 4)) - 1950)].avgTemp = +d.avgTemp * (9.0 / 5.0) + 32.0;
            }
            else {
                var innertemp = {};
                innertemp.date = d.date.substring(0, 4);
                innertemp.avgTemp = +d.avgTemp * (9.0 / 5.0) + 32.0;
                vis.temp[states_hash[d.state]][(+(d.date.substring(0, 4)) - 1950)] = innertemp;
            }
        }
        else {
            vis.temp[states_hash[d.state]] = new Array(67);
            var innertemp = {};
            innertemp.date = d.date.substring(0, 4);
            innertemp.avgTemp = +d.avgTemp * (9.0 / 5.0) + 32.0;
            vis.temp[states_hash[d.state]][(+(d.date.substring(0, 4)) - 1950)] = innertemp;
        }

        d.date = dateParser(String(d.date));
        d.avgTemp = +d.avgTemp * (9.0 / 5.0) + 32.0
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
        .domain([parseDate("1950"), parseDate("2016")]);

    vis.svg.append("g")
        .attr("transform", "translate(0," + vis.height + ")")
        .attr("class", "x-axis axis");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.svg.append("g")
        .attr("transform", "translate(" + (800 - vis.margin.left-  2) + ",0)")
        .attr("class", "y-axis2 axis");

    vis.temp = insertRelevantData(vis.temp, vis.tornData,["fat", "loss"]);
    vis.temp = insertRelevantData(vis.temp, vis.hailData,["fat", "loss"]);
    vis.temp = insertRelevantData(vis.temp, vis.windData,["fat", "loss"]);


    this.updateVis("fat", "AL");
}


LineChart.prototype.updateVis = function(selected, selectedState) {
    var vis = this;
    vis.selected = selected;
    vis.selectedState = selectedState;

    vis.displayData = vis.temp[vis.selectedState];

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
        .ticks(5)
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.yAxis2 = d3.axisLeft()
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
        .attr("stroke", "blue")
        .merge(line1).transition().duration(1000)
        .attr("d", vis.valueline);

    // Add the valueline2 path.
    var line2 = vis.svg.selectAll("#line2")
        .data([vis.displayData]);

    line2.enter().append("path")
        .attr("id", "line2")
        .attr("stroke", "green")
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
            if (d.st !== "") {
                if (d.st in temp) {
                    if (typeof temp[d.st][(+d.yr - 1950)] !== 'undefined') {
                        if (t in temp[d.st][(+d.yr - 1950)])
                        {
                            temp[d.st][(+d.yr - 1950)][t] += +d[t];
                        }
                        else {
                            temp[d.st][(+d.yr - 1950)][t] = +d[t];
                        }
                    }
                }
            }
        });
    });

    return temp;
}
