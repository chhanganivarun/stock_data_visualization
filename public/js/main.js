/*
 * Root file that handles instances of all the charts and loads the visualization
 */

// var firstStockPriceChart = new SingleStockPriceChart(0);
// var secondStockPriceChart = new SingleStockPriceChart(1);

// var stockPriceChart = new SingleStockPriceChart();

(function(){
    var instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        //Creating instances for each visualization

        //load the data corresponding to all the election years
        //pass this data and instances of all the charts that update on year selection to yearChart's constructor
        d3.csv('data/S&P500Index.csv', function (error, indexOfSnP500Data) {
            //pass the instances of all the charts that update on selection change in IndexOfSPChart
            var indexOfSnP500Chart = new IndexOfSPChart(indexOfSnP500Data);
            indexOfSnP500Chart.update();
        });

        var singleStockPricesChart = new SingleStockPricesChart();

        d3.text('data/tickers.txt',
            function(error, content)
            {
                var tickers = content.split('\n').map(function (d) { return d.trim(); });
                var defaultOptionName = ['aapl', 'goog'];

                var i;
                for (i in defaultOptionName) {
                    d3.select('#plot-selector-'+i).select('#dataset-'+i)
                        .selectAll('option').data(tickers)
                        .enter().append('option')
                        .attr('value', function(d) { return d; })
                        .text(function(d) { return d; })
                        .property("selected",
                            function(d) { return defaultOptionName[i] === d; });

                }

                d3.select('#dataset-0').on('change', function() {singleStockPricesChart.chooseData();});
                d3.select('#dataset-1').on('change', function() {singleStockPricesChart.chooseData();});
                d3.select('#types').on('change', function() {singleStockPricesChart.chooseData();});

                d3.select('#statementsSelect').on('change', function() {singleStockPricesChart.chooseData();});

                singleStockPricesChart.chooseData();
            });
    }

    /**
     *
     * @constructor
     */
    function Main(){
        if(instance  !== null){
            throw new Error("Cannot instantiate more than one Class");
        }
    }

    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function(){
        var self = this;
        if(self.instance == null){
            self.instance = new Main();

            //called only once when the class is initialized
            init();
        }
        return instance;
    };

    Main.getInstance();
})();