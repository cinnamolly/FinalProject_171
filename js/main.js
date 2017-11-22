
// Will be used to the save the loaded JSON data
var allData = [];

var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");


// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%Y");

// Set ordinal color scale
var colorScale = d3.scaleOrdinal(["#152394","#06a7a4", "#d82492"]).domain(["tornado", "hail", "wind"]);

// Variables for the visualization instances
var areachart, timeline, climate;


// Start application by loading the data
//loadData();

loadCsvData();

function loadCsvData(){
    d3.csv("data/thw_data.csv", function(error, csvData){
        if (!error){
            allData = csvData;
        }

        createVis();
    });
}


function createVis() {

	// TO-DO: Instantiate visualization objects here
    //climate = new ChoroplethMap("choro");
    areachart = new StackedAreaChart("stacked-area-chart", allData);

    timeline = new Timeline("timeline", allData);
    
}


function brushed() {

    // Get the extent of the current brush
    var selectionRange = d3.brushSelection(d3.select(".brush").node());

    // Convert the extent into the corresponding domain values
    areachart.x.domain(selectionRange.map(timeline.x.invert));

    areachart.wrangleData();
}
