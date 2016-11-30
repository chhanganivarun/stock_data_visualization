
/**
 * Constructor for the SingleStockPriceChart
 *
 // * @param shiftChart an instance of the ShiftChart class
 */
// function SingleStockPriceChart(i)
function SingleStockPricesChart()
{
    var self = this;
    self.init();
}

/**
 * Initializes the svg elements required for this chart
 */
SingleStockPricesChart.prototype.init = function()
{
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#two-stocks").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 400;

    self.svg = divelectoralVotes.select('#stock-prices');

    // Parse the time of the pattern yyyymmdd
    self.parseDate = d3.timeParse('%Y%m%d');

    // Set the ranges
    self.x = d3.scaleTime().range([0, self.svgWidth]);
    self.y = d3.scaleLinear().range([self.svgHeight, 0]);

    self.valueLine = d3.line()
        .x(function(d) { return self.x(d.Date); })
        .y(function(d) { return self.y(d.Close); });

    self.svg
        .attr('width', self.svgWidth + self.margin.left + self.margin.right)
        .attr('height', self.svgHeight + self.margin.top + self.margin.bottom)
        .append('g')
        .attr('transform', 'translate(' +
            self.margin.left + ', ' +
            self.margin.top + ')');

    // // Add path.
    self.price0 = self.svg.select('#appl')
        // .classed("lineChart", true)
        .classed('s0', true)
        .select('path')
        .style('stroke', 'red')
        .style('fill', 'none');

    self.price1 = self.svg.select('#goog')
        // .classed("lineChart", true)
        .classed('s1', true)
        .select('path')
        .style('stroke', 'black')
        .style('fill', 'none');

    self.oldTickers = ['appl', 'goog'];

};


/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 // * @param electionResult election data for the year selected
 // * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
SingleStockPricesChart.prototype.update = function(ticker0, ticker1, chartType)
{
    var self = this;

    d3.text('./data/daily/table_'+ticker0+'.csv', function(error0, text0) {
        // Date	Open	High	Low	Close	Adj Close*	Volume
        var dailyStockPrice0 = d3.csvParseRows(text0, function (d) { return {'Date': d[0], 'Close': d[5]}; });

        d3.text('./data/daily/table_'+ticker1+'.csv', function(error1, text1) {
            // Date	Open	High	Low	Close	Adj Close*	Volume
            var dailyStockPrice1 = d3.csvParseRows(text1, function (d) { return {'Date': d[0], 'Close': d[5]}; });


            dailyStockPrice0.forEach(function(d) {
                d.Date = self.parseDate(d.Date);
                d.Close = +d.Close;
            });

            dailyStockPrice1.forEach(function(d) {
                d.Date = self.parseDate(d.Date);
                d.Close = +d.Close;
            });


            // x axist
            var xExt0 = d3.extent(dailyStockPrice0, function(d) { return d.Date; });
            var xExt1 = d3.extent(dailyStockPrice1, function(d) { return d.Date; });
            console.log(xExt0);

            // var xLowerBound = self.parseDate(xExt0[0] > xExt1[0] ? xExt0[0] : xExt1[0]);
            // var xUpperBound = self.parseDate(xExt0[1] < xExt1[1] ? xExt0[1] : xExt1[1]);
            var xLowerBound = xExt0[0] > xExt1[0] ? xExt0[0] : xExt1[0];
            var xUpperBound = xExt0[1] < xExt1[1] ? xExt0[1] : xExt1[1];

            self.x.domain([xLowerBound, xUpperBound]);
            // self.x.domain([new Date('1900-01-01'), new Date('2016-01-01')]);
            // console.log([xLowerBound, xUpperBound]);

            // y axist
            var yExt0 = d3.extent(dailyStockPrice0, function(d) { return d.Close; });
            var yExt1 = d3.extent(dailyStockPrice1, function(d) { return d.Close; });

            var yLowerBound = yExt0[0] > yExt1[0] ? yExt1[0] : yExt0[0];
            var yUpperBound = yExt0[1] < yExt1[1] ? yExt1[1] : yExt0[1];

            self.y.domain([yLowerBound, yUpperBound]);
            // self.y.domain([0.0, 800.0]);
            console.log([yLowerBound, yUpperBound]);


            // Remove the X Axis
            self.svg.selectAll('.x-axis').remove();
            // Remove the Y Axis
            self.svg.selectAll('.y-axis').remove();

            self.xAxis = d3.axisBottom(self.x).ticks(10);
            self.yAxis = d3.axisRight(self.y).ticks(5);


            self.svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + self.svgHeight + ")")
                .call(self.xAxis);

            self.svg.append("g")
                .attr("class", "y-axis")
                .call(self.yAxis);


            // // TODO: use ticker
            // self.svg.select('.s0').select('path').attr('d', null);
            // self.svg.select('.s1').select('path').attr('d', null);

            if (chartType === 'line-charts') {
                self.price0.attr('d', self.valueLine(dailyStockPrice0));
                self.price1.attr('d', self.valueLine(dailyStockPrice1));
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
        });
    });

    //
    // dailyStockPrice.forEach(function(d) {
    //     d.Date = self.parseDate(d.Date);
    //     d.Close = +d.Close;
    // });

    // Scale the range of the data
    // self.x.domain(d3.extent(dailyStockPrice, function(d) { return d.Date; }));
    // self.y.domain([d3.min(dailyStockPrice, function(d) { return +d.Close; }),
    //     d3.max(dailyStockPrice, function(d) { return +d.Close; })]);

    // // Remove the X Axis
    // self.svg.select('.x-axis').remove();
    // // Remove the Y Axis
    // self.svg.select('.y-axis').remove();

    // self.svg.append("g")
    //     .attr("class", "x-axis")
    //     .attr("transform", "translate(0," + self.svgHeight + ")")
    //     .call(self.xAxis);
    //
    // self.svg.append("g")
    //     .attr("class", "y-axis")
    //     .call(self.yAxis);


    // // Add the valueline path.
    // if (chartType === 'line-charts') {
    //     self.line.attr("d", self.valueline(dailyStockPrice));
    // } else {
    //     self.barsGroup
    //         .selectAll('rect')
    //         .data(dailyStockPrice);
    //         // .attr('transform', 'translate(' + xAxisWidth + ', ' + 0 + ')')
    //
    //     bars = bars.enter().append('rect').merge(bars);
    //
    //     bars
    //         .transition().duration(2000)
    //         .attr('x', function (d) {
    //             return d.Date
    //         })
    //         .attr('y', function (d) {
    //             return yScale(d[selectedDimension])
    //         })
    //         .attr('width', width)
    //         .attr('height', function (d) {
    //             return hCore - yScale(d[selectedDimension])
    //         })
    //         .style('fill', function (d) {
    //             var self = d3.select(this);
    //             if (!self.classed('selected')) {
    //                 return colorScale(d[selectedDimension]);
    //             } else {
    //                 return '#d20a11'; // TODO: Try to remove the hard code.
    //             }
    //         });
    // }

};


SingleStockPricesChart.prototype.chooseData = function(idx)
{
    var self = this;
    var ticker0 = document.getElementById('dataset-'+0).value;
    var ticker1 = document.getElementById('dataset-'+1).value;
    var chartType = document.getElementById('types').value;

    self.update(ticker0, ticker1, chartType);
    // d3.text('data/daily/table_'+ticker+'.csv', function(error, text) {
    //     // Date	Open	High	Low	Close	Adj Close*	Volume
    //     var dailyStockPrice = d3.csvParseRows(text, function (d) { return {'Date': d[0], 'Close': d[5]}; });
    //     self.update(dailyStockPrice, chartType);
    // });

    // d3.text('./data/daily/table_aapl.csv', function(error0, text0) {
    //     console.log('here is OK');
    //     console.log(text0[0]);
    // });
};
