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
    var parseDate = d3.timeParse('%Y-%m-%d'),
        bisectDate = d3.bisector(function(d) { return d.Date; }).left;


    self.indexOfSnP500Data.forEach(function(d) {
        d.Date = parseDate(d.Date);
        d.Close = +d.Close;
    });

    self.indexOfSnP500Data.sort(function(a, b) {
        return a.Date - b.Date;
    });

    // Set the ranges
    var x = d3.scaleTime()
        .range([0, self.svgWidth])
        .domain(d3.extent(self.indexOfSnP500Data, function(d) { return d.Date; }));

    var y = d3.scaleLinear()
        .range([self.svgHeight, 0])
        .domain(d3.extent(self.indexOfSnP500Data, function(d) { return d.Close; }));

    var xAxis = d3.axisBottom(x).ticks(23);
    var yAxis = d3.axisLeft(y).ticks(5);

    var valueLine = d3.line()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.Close); });

    self.svg
        .attr('width', self.svgWidth + self.margin.left + self.margin.right)
        .attr('height', self.svgHeight + self.margin.top + self.margin.bottom);

    // Add the valueLine path.
    self.svg.append('path')
        .attr('class', 'line')
        .attr('d', valueLine(self.indexOfSnP500Data))
        .style('fill', 'none')
        .style('stroke', 'steelblue');

    // Add the X Axis
    self.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + self.svgHeight + ')')
        .call(xAxis);

    // Add the Y Axis
    self.svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    var focus = self.svg.append('g')
        .attr('id', 'focus-0')
        .attr('class', 'focus')
        .style('display', 'none');

    focus
        .append('circle')
        .attr('r', '5')
        .classed('focus', true);

    self.svg
        .on('mouseover', function() { focus.style('display', null); })
        .on('mouseout', function() { focus.style('display', 'none'); })
        .on('mousemove', mouseMoveF);

    function mouseMoveF() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(self.indexOfSnP500Data, x0, 1),
            d0 = self.indexOfSnP500Data[i - 1],
            d1 = self.indexOfSnP500Data[i],
            d = x0 - d0.Date > d1.Date - x0 ? d1 : d0;
        focus.attr('transform', 'translate(' + x(d.Date) + ',' + y(d.Close) + ')');
    }
};
