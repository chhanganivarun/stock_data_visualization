
/**
 * Constructor for the SingleStockPriceChart
 *
 // * @param shiftChart an instance of the ShiftChart class
 */
function SingleStockPriceChart(i)
{
    var self = this;
    self.i = i;
    self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
SingleStockPriceChart.prototype.init = function()
{
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#two-stocks").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    console.log(self.svgBounds);
    console.log(self.svgBounds.width);
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    console.log(self.svgWidth);
    self.svgHeight = 150;

    //creates svg element within the div
    if (self.i === 0) {
        self.svg = divelectoralVotes.select("#leftChart");
    } else {
        self.svg = divelectoralVotes.select("#rightChart");
    }

    // Parse the time of the pattern yyyymmdd
    self.parseDate = d3.timeParse('%Y%m%d');

    // Set the ranges
    self.x = d3.scaleTime().range([0, self.svgWidth]);
    self.y = d3.scaleLinear().range([self.svgHeight, 0]);

    // var xAxis = d3.axisBottom(x).ticks(23);
    // var yAxis = d3.axisLeft(y).ticks(5);

    self.xAxis = d3.axisBottom(self.x);
    self.yAxis = d3.axisLeft(self.y);

    self.valueline = d3.line()
        .x(function(d) { return self.x(d.Date); })
        .y(function(d) { return self.y(d.Close); });

    self.svg
        .attr('width', self.svgWidth + self.margin.left + self.margin.right)
        .attr('height', self.svgHeight + self.margin.top + self.margin.bottom)
        .append('g')
        .attr('transform', 'translate('
            + self.margin.left
            + ', ' + self.margin.top + ')');

    // Add path.
    self.line = self.svg.append('g')
        .attr("class", "line")
        .append("path")
        .style('fill', 'none')
        .style('stroke', 'steelblue');

    // Add bar group.
    self.barsGroup = self.svg.append('g')
        .attr("class", "bars");
        // .style('fill', 'none')
        // .style('stroke', 'steelblue');

    // Add the X Axis
    self.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + self.svgHeight + ")")
        .call(self.xAxis);

    // Add the Y Axis
    self.svg.append("g")
        .attr("class", "y-axis")
        .call(self.yAxis);
};

/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 // * @param electionResult election data for the year selected
 // * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
SingleStockPriceChart.prototype.update = function(dailyStockPrice, chartType)
{
    var self = this;

    dailyStockPrice.forEach(function(d) {
        d.Date = self.parseDate(d.Date);
        d.Close = +d.Close;
    });

    // Scale the range of the data
    self.x.domain(d3.extent(dailyStockPrice, function(d) { return d.Date; }));
    self.y.domain([d3.min(dailyStockPrice, function(d) { return +d.Close; }),
        d3.max(dailyStockPrice, function(d) { return +d.Close; })]);

    // Remove the X Axis
    self.svg.select('.x-axis').remove();
    // Remove the Y Axis
    self.svg.select('.y-axis').remove();

    self.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + self.svgHeight + ")")
        .call(self.xAxis);

    self.svg.append("g")
        .attr("class", "y-axis")
        .call(self.yAxis);


    // Add the valueline path.
    if (chartType === 'line-charts') {
        self.line.attr("d", self.valueline(dailyStockPrice));
    } else {
        self.barsGroup
            .selectAll('rect')
            .data(dailyStockPrice);
            // .attr('transform', 'translate(' + xAxisWidth + ', ' + 0 + ')')

        bars = bars.enter().append('rect').merge(bars);

        bars
            .transition().duration(2000)
            .attr('x', function (d) {
                return d.Date
            })
            .attr('y', function (d) {
                return yScale(d[selectedDimension])
            })
            .attr('width', width)
            .attr('height', function (d) {
                return hCore - yScale(d[selectedDimension])
            })
            .style('fill', function (d) {
                var self = d3.select(this);
                if (!self.classed('selected')) {
                    return colorScale(d[selectedDimension]);
                } else {
                    return '#d20a11'; // TODO: Try to remove the hard code.
                }
            });
    }

};


SingleStockPriceChart.prototype.chooseData = function()
{
    var self = this;
    var ticker = document.getElementById('dataset-'+self.i).value;
    var chartType = document.getElementById('types').value;
    console.log(chartType);

    d3.text('data/daily/table_'+ticker+'.csv', function(error, text) {
        // Date	Open	High	Low	Close	Adj Close*	Volume
        var dailyStockPrice = d3.csvParseRows(text, function (d) { return {'Date': d[0], 'Close': d[5]}; });
        self.update(dailyStockPrice, chartType);
    });
};

