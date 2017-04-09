angular.module('chart', []).factory('chartService', ['$log', function($log){
    var create=function( options){
        return new Chart('chart', options);
    };

    return {
        generate:create
    };
}]);

var module = angular.module('GraphApp', [ 'chart']);

/**
 *  Main controller
 */
module.controller('GraphCtrl', [ '$scope', '$log', 'chartService',
    function($scope, $log, chartService ) {
        var instance;
        $scope.cat= {
            label:"data 1 name",
            type:"line",
            show:true,
            data:[
                {x:new Date('2013-01-01'), y:30},
                {x:new Date('2013-01-03'), y:200},
                {x:new Date('2013-01-05'), y:100},
                {x:new Date('2013-01-07'), y:400},
                {x:new Date('2013-01-09'), y:150},
                {x:new Date('2013-01-11'), y:250}
            ]
        };

        $scope.cat2= {
            label:"data 2 name",
            type:"line",
            show:true,
            data:[
            ]
        };

        $scope.cat3=angular.extend({},$scope.cat);
        $scope.cat3.data=[];
        var ref=new Date('2013-01-02').getTime();

        for(var i=0;i<1000;i++){
            $scope.cat3.data.push({x:new Date(ref+i*60000), y:Math.round((1200-250) * Math.random() + 250) });
            $scope.cat2.data.push({x:new Date(ref+2000+i*60000), y:Math.round((1200-250) * Math.random() + 250) });
        }

        function init(){
            instance=chartService.generate({
                data: {
                    datasets:[
                        $scope.cat2,$scope.cat3
                    ]
                },
                options: {
                    responsive: false,
                    title:{
                        display:true,
                        text:"Chart.js Time Point Data"
                    },
                    scales: {
                        xAxes: [{
                            type: "time",
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Date'
                            }
                        }],
                        yAxes: [{
                            stacked:true,
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'value'
                            }
                        }]
                    },
                    pan: {
                        enabled: true,
                        drag: true,
                        mode: 'xy',
                        threshold: 50,
                    },
                    zoom: {
                        enabled: true,
                        mode: 'xy',
                        sensitivity: 30,
                    }
                }
            });
        }
        $scope.doit=function() {
            $log.info("coucou",instance);
            //            instance.hide("data1");
            //instance.zoom.enable(true);
            $scope.cat2.borderColor='#ff0000';
            $scope.cat2.backgroundColor='rgba(255,0,0,0.1)';
            instance.data.datasets[0].hidden = !$scope.cat.show;
            $log.info(instance.data.datasets[0].type);
            instance.update();

            $log.info("colored, hidden", !$scope.cat.show);   
        };
        init();
    }]);
