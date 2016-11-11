/**
 * Constructor for the Year Chart
 *
 * @param indexOfSnP500Data data corresponding to index of S&P 500
 */
function IndexOfSPChart(indexOfSnP500Data)
{
    var self = this;

    self.indexOfSnP500Data = indexOfSnP500Data;
    self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
IndexOfSPChart.prototype.init = function()
{

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 50};
    var divyearChart = d3.select("#index-of-SP500-chart").classed("fullView", true);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divyearChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 200;

    //creates svg element within the div
    self.svg = divyearChart.append('svg')
        .attr('width', self.svgWidth)
        .attr('height', self.svgHeight);
};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */
IndexOfSPChart.prototype.update = function()
{
    var self = this;

    // Parse the time of the pattern yyyy-mm-dd
    var parseDate = d3.timeParse('%Y-%m-%d');

    // Set the ranges
    var x = d3.scaleTime().range([0, self.svgWidth]);
    var y = d3.scaleLinear().range([self.svgHeight, 0]);

    var xAxis = d3.axisBottom(x).ticks(23);

    var yAxis = d3.axisLeft(y).ticks(5);

    var valueline = d3.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.Close); });

    self.svg
        .attr('width', self.svgWidth + self.margin.left + self.margin.right)
        .attr('height', self.svgHeight + self.margin.top + self.margin.bottom)
        .append('g')
        .attr('transform', 'translate('
            + self.margin.left
            + ', ' + self.margin.top + ')');

    self.indexOfSnP500Data.forEach(function(d) {
        d.Date = parseDate(d.Date);
        d.Close = +d.Close;
    });

    // Scale the range of the data
    x.domain(d3.extent(self.indexOfSnP500Data, function(d) { return d.Date; }));
    y.domain([d3.min(self.indexOfSnP500Data, function(d) { return +d.Close; }),
              d3.max(self.indexOfSnP500Data, function(d) { return +d.Close; })]);

    // Add the valueline path.
    self.svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(self.indexOfSnP500Data))
        .style('fill', 'none')
        .style('stroke', 'steelblue');

    // Add the X Axis
    self.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + self.svgHeight + ")")
        .call(xAxis);

    // Add the Y Axis
    self.svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
};
