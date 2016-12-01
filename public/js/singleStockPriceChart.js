
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
    self.margin = {top: 10, right: 100, bottom: 30, left: 100};

    //Gets access to the div element created for this chart from HTML
    var divelectoralVotes = d3.select("#two-stocks").classed("content", true);
    self.svgBounds = divelectoralVotes.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = 400;

    self.svg = divelectoralVotes.select('#stock-prices');

    // Parse the time of the pattern yyyymmdd
    self.parseDate = d3.timeParse('%Y%m%d');

    self.valueLineGen = function(xScl, yScl) {
        return d3.line()
            // .curve(d3.curveMonotoneY)
            // .interpolate('basis')
            .x(function(d) { return xScl(d.Date); })
            .y(function(d) { return yScl(d.Close); });
    };

    self.svgContent = self.svg
        .attr('width', self.svgWidth + self.margin.left + self.margin.right)
        .attr('height', self.svgHeight + self.margin.top + self.margin.bottom)
        .append('g')
        .attr('transform', 'translate(' +
            self.margin.left + ', ' +
            self.margin.top + ')');

    // // Add path.
    self.price0 = self.svgContent
        .append('g')
        .attr('id', 'p0')
        .append('path')
        .style('stroke', 'blue')
        .style('fill', 'none');

    self.price1 = self.svgContent
        .append('g')
        .attr('id', 'p1')
        .append('path')
        .style('stroke', 'red')
        .style('fill', 'none');
};


/**
 * Creates the stacked bar chart, text content and tool tips for electoral vote chart
 *
 // * @param electionResult election data for the year selected
 // * @param colorScale global quantile scale based on the winning margin between republicans and democrats
 */
SingleStockPricesChart.prototype.updatePrices = function(ticker0, ticker1, chartType)
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


            if (chartType === 'lines') {
                // Set the ranges
                var x = d3.scaleTime().range([0, self.svgWidth]);
                var y = d3.scaleLinear().range([self.svgHeight, 0]);

                // x axist
                var xExt0 = d3.extent(dailyStockPrice0, function(d) { return d.Date; });
                var xExt1 = d3.extent(dailyStockPrice1, function(d) { return d.Date; });

                var xLowerBound = xExt0[0] > xExt1[0] ? xExt0[0] : xExt1[0];
                var xUpperBound = xExt0[1] < xExt1[1] ? xExt0[1] : xExt1[1];
                x.domain([xLowerBound, xUpperBound]);
                var filteredDailyStockPrice0 = dailyStockPrice0.filter(function(d) { return d.Date >= xLowerBound && d.Date <= xUpperBound; });
                var filteredDailyStockPrice1 = dailyStockPrice1.filter(function(d) { return d.Date >= xLowerBound && d.Date <= xUpperBound; });
                console.log(xLowerBound);
                console.log(filteredDailyStockPrice0[0].Date);
                console.log(filteredDailyStockPrice1[0].Date);

                // y axist
                var yExt0 = d3.extent(filteredDailyStockPrice0, function(d) { return d.Close; });
                var yExt1 = d3.extent(filteredDailyStockPrice1, function(d) { return d.Close; });

                var yUpperBound = yExt0[1] < yExt1[1] ? yExt1[1] : yExt0[1];
                y.domain([0, yUpperBound]);


                // Remove the X Axis
                self.svgContent.selectAll('.x-axis').remove();
                // Remove the Y Axis
                self.svgContent.selectAll('.y-axis').remove();

                var xAxis = d3.axisBottom(x).ticks(10);
                var yAxis = d3.axisLeft(y).ticks(5);

                // var axes = self.svgContent.append('g');

                self.svgContent.append('g')
                    .attr('class', 'x-axis')
                    .attr('id', 'x')
                    .attr('transform', 'translate(0,' + self.svgHeight + ')')
                    // .transition().duration(3000)
                    .call(xAxis);

                self.svgContent.append('g')
                    .attr('class', 'y-axis')
                    .attr('id', 'y')
                    // .transition().duration(3000)
                    .call(yAxis);

                var valueLine = self.valueLineGen(x, y);
                self.price0.transition().duration(3000).attr('d', valueLine(filteredDailyStockPrice0));
                self.price1.transition().duration(3000).attr('d', valueLine(filteredDailyStockPrice1));
            } else if ( chartType == 'separate') {
                function oneLine(gid, data, x, y) {
                    var g = d3.select('#' + gid);
                    // Remove the X Axis
                    g.selectAll('.x-axis').remove();
                    // Remove the Y Axis
                    g.selectAll('.y-axis').remove();

                    var xAxis = d3.axisBottom(x).ticks(10);
                    var yAxis = d3.axisLeft(y).ticks(5);

                    var valueLine = self.valueLineGen(x, y);

                    if (gid == 'upper') {
                        g.append("g")
                            .attr("class", "x-axis")
                            .attr("transform", "translate(0," + (self.svgHeight/2 - 10) + ")")
                            .transition().duration(3000)
                            .call(xAxis);

                        g.append("g")
                            .attr("class", "y-axis")
                            .transition().duration(3000)
                            .call(yAxis);

                        self.price0.transition().duration(3000).attr('d', valueLine(data));
                    } else {
                        g.append("g")
                            .attr("class", "x-axis")
                            .attr("transform", "translate(0," + self.svgHeight + ")")
                            .transition().duration(3000)
                            .call(xAxis);

                        g.append("g")
                            .attr("class", "y-axis")
                            .transition().duration(3000)
                            .call(yAxis);

                        self.price1.transition().duration(3000).attr('d', valueLine(data));
                    }

                }

                self.svgContent.selectAll('.x-axis').remove();
                self.svgContent.selectAll('.y-axis').remove();
                self.svgContent.select('#upper').remove();
                self.svgContent.select('#lower').remove();

                var x0 = d3.scaleTime()
                    .range([0, self.svgWidth])
                    .domain(d3.extent(dailyStockPrice0, function(d) { return d.Date; }));

                var y0 = d3.scaleLinear()
                    .range([self.svgHeight/2 - 10, 10])
                    .domain([0, d3.max(dailyStockPrice0, function(d) { return d.Close; })]);

                var upper = self.svgContent.append('g').attr('id', 'upper');
                oneLine('upper', dailyStockPrice0, x0, y0);

                console.log('hi');

                var x1 = d3.scaleTime()
                    .range([0, self.svgWidth])
                    .domain(d3.extent(dailyStockPrice1, function(d) { return d.Date; }));

                var y1 = d3.scaleLinear()
                    .range([self.svgHeight, self.svgHeight/2 + 10])
                    .domain([0, d3.max(dailyStockPrice1, function(d) { return d.Close; })]);

                var lower = self.svgContent.append('g').attr('id', 'lower');
                oneLine('lower', dailyStockPrice1, x1, y1);
            } else if ( chartType == 'normalized') {
                function oneLine(gid, data, x, y) {
                    var g = d3.select('#' + gid);
                    // Remove the X Axis
                    g.selectAll('.x-axis').remove();
                    // Remove the Y Axis
                    g.selectAll('.y-axis').remove();

                    var xAxis = d3.axisBottom(x).ticks(10);
                    var yAxis = d3.axisLeft(y).ticks(5);

                    var valueLine = self.valueLineGen(x, y);

                    if (gid == 'upper') {
                        g.append("g")
                            .attr("class", "x-axis")
                            .attr("transform", "translate(0," + self.svgHeight + ")")
                            .transition().duration(3000)
                            .call(xAxis);

                        g.append("g")
                            .attr("class", "y-axis")
                            // .attr("transform", 'translate(' + self.svgWidth + ', 0)')
                            .transition().duration(3000)
                            .call(yAxis);

                        self.price0.transition().duration(3000).attr('d', valueLine(data));
                    } else {
                        g.append("g")
                            .attr("class", "x-axis")
                            .attr("transform", "translate(0," + self.svgHeight + ")")
                            .transition().duration(3000)
                            .call(xAxis);

                        g.append("g")
                            .attr("class", "y-axis")
                            .attr("transform", 'translate(' + self.svgWidth + ', 0)')
                            .transition().duration(3000)
                            .call(yAxis);

                        self.price1.transition().duration(3000).attr('d', valueLine(data));
                    }

                }

                self.svgContent.selectAll('.x-axis').remove();
                self.svgContent.selectAll('.y-axis').remove();
                self.svgContent.select('#upper').remove();
                self.svgContent.select('#lower').remove();

                var xCommon = d3.scaleTime().range([0, self.svgWidth]);

                // x axist
                var xExt0 = d3.extent(dailyStockPrice0, function(d) { return d.Date; });
                var xExt1 = d3.extent(dailyStockPrice1, function(d) { return d.Date; });

                var xLowerBound = xExt0[0] > xExt1[0] ? xExt0[0] : xExt1[0];
                var xUpperBound = xExt0[1] < xExt1[1] ? xExt0[1] : xExt1[1];
                xCommon.domain([xLowerBound, xUpperBound]);
                var filteredDailyStockPrice0 = dailyStockPrice0.filter(function(d) { return d.Date >= xLowerBound && d.Date <= xUpperBound; });
                var filteredDailyStockPrice1 = dailyStockPrice1.filter(function(d) { return d.Date >= xLowerBound && d.Date <= xUpperBound; });

                var y0 = d3.scaleLinear()
                    .range([self.svgHeight, 0])
                    .domain([0, d3.max(filteredDailyStockPrice0, function(d) { return d.Close; })]);

                var upper = self.svgContent.append('g').attr('id', 'upper');
                oneLine('upper', filteredDailyStockPrice0, xCommon, y0);


                var y1 = d3.scaleLinear()
                    .range([self.svgHeight, 0])
                    .domain([0, d3.max(filteredDailyStockPrice1, function(d) { return d.Close; })]);

                var lower = self.svgContent.append('g').attr('id', 'lower');
                oneLine('lower', filteredDailyStockPrice1, xCommon, y1);
            }
        });
    });
};

SingleStockPricesChart.prototype.updateFinantialStatements = function(ticker0, ticker1, statementType)
{
    var self = this;
    d3.csv('./data/statements/'+ticker0.toUpperCase()+'.csv', function(error0, leftData) {
        d3.csv('./data/statements/'+ticker1.toUpperCase() +'.csv', function(error1, rightData) {
            data_combined = d3.merge([leftData, rightData]);
            statementsDiv = d3.select("#statementsDiv");
            statements_svg = statementsDiv.select("#statementsSvg");
            statements_svg_bars_group = statements_svg.select("#bars");

            // We construct the bounds
            var svgBounds = d3.select("#statementsSvg").node().getBoundingClientRect(),
                xAxisWidth = 100,
                yAxisHeight = 70;
            var svg_width = statements_svg.attr("width");
            var svg_height = statements_svg.attr("height");


            // Choose the max and min of the y-axis labels to rescale the yaxis
            var maxValue = d3.max(data_combined, function (d) { return parseFloat(d[statementType]); });


            // Create two colorScales: Blue for the first company, and Red for the second company
            var colorScaleBlue = d3.scaleLinear()
                .domain([0, maxValue])
                .range(['#097ecc', '#043352']);

            var colorScaleRed = d3.scaleLinear()
                .domain([0, maxValue])
                .range(["#fcbba1", "#860308"]);

            // Define Transitions
            var t = d3.transition().duration(2000);

            // Define x and y Scales, and x,y Axes
            var y_extension = 1.05;
            var yScale = d3.scaleLinear()
                .domain([0, y_extension *maxValue]).range([svgBounds.height - xAxisWidth, 0]);
            var xScale = d3.scaleBand()
                .domain([2015,2014,2013,2012,2011]).range([svgBounds.width, yAxisHeight]).padding(0);
            var xAxis = d3.axisBottom()
                .scale(xScale);
            var yAxis = d3.axisLeft()
                .scale(yScale);

            // Define the padding for the x-axis for the ticks to appear
            var padding = 100;

           // Now we plot them in the picture by calling x and y axes
            statements_svg.select("#xAxis")
                .attr("transform", "translate(0,"+(svgBounds.height-padding)+")")
                .call(xAxis);

            statements_svg.select("#yAxis")
                .attr("transform", "translate(" + yAxisHeight + ",0)")
                .transition(t)
                .call(yAxis);


            // Select the select button (whose id="statementsSelect") in the statements Div
            statements_select = statementsDiv.select("#statementsSelect");
            console.log(statements_select);

            // Add Names to the Select Button. Manually Constuct All the options.
            attrs_to_show = ["Cash Ratio",
                             "Current Ratio",
                             " Quick Ratio",
                             "Growth Margin",
                             "Sales Growth",
                             "Operation Income/Current Debt",
                             "Total Debt/EBITDA",
                             "Total Debt/Asset",
                             "Total Debt/Equity",
                             "Receivable Days",
                             "Inventory Management",
                             "Effective Tax Rate"];

            // The total proportional of space we want the bar in the x-direction to occupy is q
            q = 0.75;
            bars_total_x_space = q * svg_width;
            blank_x_space = (1 - q) * svg_width;
            each_bar_width = q * bars_total_x_space / (data_combined.length);
            // console.log(each_bar_width);

            // Define two quantities for adjustments for bars in the svg //
            var tick_position_increment = (svg_width - yAxisHeight) / leftData.length;
            var initial_position_increment = yAxisHeight - tick_position_increment/2;


            // Now we let all the bars in and give them data //
            var bars = statements_svg_bars_group.selectAll("rect").data(data_combined);
            bars = bars.enter()
                .append('rect')
                .attr('y', svgBounds.height - xAxisWidth)
                .merge(bars);

            // We need to implement transitions to all bars
            bars.exit().remove();


            // The above two lines is hard math, but notice that these two terms
            // are defined in terms of previous quantities. So no additional
            // adjustment needs to be done, even we were to make future changes

            // Set Attributes to Bars
            bars
                .attr('x', function (d,i) {
                    if (i%2==0) {
                        return tick_position_increment*(i/2+1)-(each_bar_width- initial_position_increment)
                    }
                    else {
                        return tick_position_increment*(i+1)/2+initial_position_increment
                    }
                })
                .attr('width', each_bar_width)
                .classed('noData', function(d) {
                    return d[statementType] === undefined || isNaN(d[statementType]) || d[statementType] < 0;
                });

            bars.transition(t)
                .attr('height', function (d) {
                    if      (d[statementType]==undefined) {return (svg_height - xAxisWidth) /3;}  // no <ticker>.csv
                    else if (isNaN(d[statementType]))     {return  (svg_height - xAxisWidth) /3;}  // no this entry
                    else if (d[statementType] >= 0)         {return svgBounds.height - xAxisWidth - yScale(d[statementType])}
                    else if (d[statementType] < 0)          {return Math.abs(d[statementType])/maxValue*50}
                })
                .attr('y', function (d) {
                    if (d[statementType]==undefined)  { return (svg_height- xAxisWidth) * 2/3; }  // no this entry
                    else if (isNaN(d[statementType])) { return (svg_height- xAxisWidth) * 2/3; }  // no this entry of certain year
                    else if (d[statementType]>=0)     { return yScale(d[statementType]); }
                    else if (d[statementType]<0)      { return svg_height- xAxisWidth; }
                })
                .style('fill', function (d,i) {
                    if      (isNaN(d[statementType])) { return "grey"; }
                    else if (d[statementType]<0)      { return "yellow"; }
                    else if (i%2==0)                  { return colorScaleBlue(d[statementType]); }
                    else                              { return colorScaleRed(d[statementType]); }
                })
                .attr("id", function(d,i) { return "bar" + i.toString() });


            // Create all the above bars texts
            var above_bars_texts = statements_svg.select("#texts").selectAll("text")
                .data(data_combined.map(function(d) {
                    return d[statementType] === undefined ? 'NA' : d[statementType];
                }));

            // Now merge
            above_bars_texts = above_bars_texts.enter()
                .append("text")
                .attr("y", svg_height - xAxisWidth)
                .attr("x", function(d,i){
                    if (i%2 == 0) {
                        return  1/8* each_bar_width+ tick_position_increment*(i/2+1)-(each_bar_width- initial_position_increment);
                    } else {
                        return 1/8* each_bar_width+tick_position_increment*(i+1)/2+initial_position_increment;
                    }
                })
                .merge(above_bars_texts);

            // Now exit and remove //
            above_bars_texts.exit().remove();

            // Set texts's attributes //
            x_left_adjustment_ratio = 1/12;
            above_bars_texts
                .attr("class", "abovebarstexts")
                .text(function(d){
                    if (isNaN(d)) { return "NA"; }
                    else          { return parseFloat(d).toFixed(2); }
                })
                .transition(t)
                .attr("x", function(d,i){
                    if (i%2 == 0) {
                        return  x_left_adjustment_ratio* each_bar_width+ tick_position_increment*(i/2+1)-(each_bar_width- initial_position_increment)
                    } else {
                        return x_left_adjustment_ratio* each_bar_width+tick_position_increment*(i+1)/2+initial_position_increment;
                    }
                })
                .attr('y', function (d) {
                    if      (isNaN(d)) { return (svg_height- xAxisWidth) *2/3; }
                    else if (d < 0)    { return svg_height - xAxisWidth; }
                    else               { return svg_height - xAxisWidth - d/(y_extension*maxValue)*(svg_height-xAxisWidth); } // position
                })
                .style("fill", function(d,i){
                    if      (isNaN(d)) { return "gray"; }
                    else if (d < 0)    { return "purple"; }
                    else if (i%2 == 0) { return colorScaleBlue(d); }
                    else               { return colorScaleRed(d); }
                });
        });
    });
};



SingleStockPricesChart.prototype.chooseData = function()
{
    var self = this;
    var ticker0 = document.getElementById('dataset-'+0).value;
    var ticker1 = document.getElementById('dataset-'+1).value;
    var chartType = document.getElementById('types').value;
    var statementType = document.getElementById('statementsSelect').value;

    self.updatePrices(ticker0, ticker1, chartType);
    self.updateFinantialStatements(ticker0, ticker1, statementType);
};
