
// Will be used to the save the loaded JSON data
var allData = [];
var tornData = [];
var hailData = [];
var windData = [];
var climateData = [];


var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");


// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%Y");

// Set ordinal color scale
var colorScale = d3.scaleOrdinal(['#a6cee3','#152394','#06A7A4','#b2df8a','#D82492','#e31a1c','#fdbf6f','#ff7f00','#cab2d6']).domain(["Blizzard", "Flood", "Hail", "Hurricane", "Thunderstorm", "Tornado", "Tropical Storm", "Tsunami", "Wildfire"]);

// Variables for the visualization instances
var areachart, timeline, climate, line;


// Start application by loading the data
//loadData();

loadCsvData();



function loadCsvData(){
    d3.queue()
        .defer(d3.json, "data/thw_data.json")
        .defer(d3.csv, "data/variance.csv")
        .defer(d3.csv, "data/1950-2016_torn.csv")
        .defer(d3.csv, "data/1955-2016_hail.csv")
        .defer(d3.csv, "data/1955-2016_wind.csv")
        .await(function(error, file1, file2, file3, file4, file5) {
            if (!error){
                allData = file1.data;
                climateData = file2;
                tornData = file3;
                hailData = file4;
                windData = file5;

                console.log(file1);
            }

            createVis();
        });

    // d3.csv("data/thw_data.csv", function(error, csvData){
    //     if (!error){
    //         allData = csvData;
    //     }
    //
    //     createVis();
    // });
}


function createVis() {

	// TO-DO: Instantiate visualization objects here
    //climate = new ChoroplethMap("choro");
    areachart = new StackedAreaChart("stacked-area-chart", allData);

    timeline = new Timeline("timeline", allData);

    line = new LineChart("line-chart", allData, climateData, tornData, hailData, windData);
}


function brushed() {

    // Get the extent of the current brush
    var selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    areachart.x.domain(selectionRange.map(timeline.x.invert));

    areachart.wrangleData();
}


d3.select("#ranking-type").on("change", lineUpdate);
d3.select("#state-type").on("change", lineUpdate);

function lineUpdate() {

    var selected = d3.select("#ranking-type").property("value");
    var selectedState = d3.select("#state-type").property("value");

    line.updateVis(selected, selectedState);
}
