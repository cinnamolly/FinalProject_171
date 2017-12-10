
// Will be used to the save the loaded JSON data
var allData = [];
var areaData = [];
var climateData = [];


var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");


// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%Y");

// Set ordinal color scale
var colorScale = d3.scaleOrdinal(['#e31a1c','#D82492','#06A7A4','#b2df8a','#152394','#a6cee3','#fdbf6f','#ff7f00','#cab2d6']).domain(["Blizzard", "Flood", "Hail", "Hurricane", "Thunderstorm", "Tornado", "Tropical Storm", "Tsunami", "Wildfire"]);

// Variables for the visualization instances
var areachart, timeline, climate, line;


// Start application by loading the data
//loadData();

loadCsvData();



function loadCsvData(){
    d3.queue()
        .defer(d3.json, "data/thw_data.json")
        .defer(d3.csv, "data/variance.csv")
        .defer(d3.csv, "data/171_totalData.csv")
        .await(function(error, file1, file2, file3) {
            if (!error){
                areaData = file1.data;
                climateData = file2;
                allData = file3;

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
    areachart = new StackedAreaChart("stacked-area-chart", areaData);

    timeline = new Timeline("timeline", areaData);

    line = new LineChart("line-chart", climateData, allData);
}


function brushed() {

    // Get the extent of the current brush
    var selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    areachart.x.domain(selectionRange.map(timeline.x.invert));

    areachart.wrangleData();
}

function pic1() {
    var selected = d3.select("#ranking-type").property("value","DAMAGE");
    var selectedState = d3.select("#state-type").property("value", "NJ");
    lineUpdate();
    line.pic1();
}
function pic2() {
    var selected = d3.select("#ranking-type").property("value","DAMAGE");
    var selectedState = d3.select("#state-type").property("value", "MO");
    lineUpdate();
    line.pic2();
}
function pic3() {
    var selected = d3.select("#ranking-type").property("value","DAMAGE");
    var selectedState = d3.select("#state-type").property("value", "LA");
    lineUpdate();
    line.pic3();
}



d3.select("#ranking-type").on("change", lineUpdate);
d3.select("#state-type").on("change", lineUpdate);

function lineUpdate() {

    var selected = d3.select("#ranking-type").property("value");

    var selectedState = d3.select("#state-type").property("value");
    console.log(selectedState)
    line.updateVis(selected, selectedState);
}
