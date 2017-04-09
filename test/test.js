

angular.module('c3', []).factory('c3Service', ['$q',
    function($q) {
        //create promise of D3
        //var d = $q.defer();
        return window.c3;
    }]);

var module = angular.module('GraphApp', [ 'c3']);

/**
 *  Main controller
 */
module.controller('GraphCtrl', [ '$scope', '$log', 'c3Service',
    function($scope, $log, c3Service ) {
        var instance;
        function init(){
            instance=c3Service.generate({
                data: {

                    xs:{
                        'data1':'x1',
                        'data2':'x2',
                    },

                    columns: [
                        ['x1', '2013-01-01', '2013-01-03', '2013-01-05', '2013-01-07', '2013-01-09', '2013-01-11'],
                        ['data1', 30, 200, 100, 400, 150, 250],
                        ['x2', '2013-01-02', '2013-01-04', '2013-01-06', '2013-01-08', '2013-01-10', '2013-01-12', '2013-01-14'],
                        ['data2', 130, 340, 200, 500, 250, 350,150]
                    ],
                    names:{
                        'data1':'data 1 name'
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%Y-%m-%d'
                        }
                    }
                },
                subchart:{"show":true}
            });
        }
        init();
        /*
        $scope.cat={"show":true};
$scope.$watch('cat', function(newValue, oldValue){$log.info('show switch to',newValue.show);instance.toggle("data1")}, true);
         */
        $scope.doit=function() {
//            instance.hide("data1");
            //instance.zoom.enable(true);
            var toto=instance.data.colors({"data2": '#FF0000'});
            /*
            instance.transform('spline','data2');
                    
            instance.load({xs:{'data3':'x3'},columns: [
                        ['x3', '2013-01-01', '2013-01-03', '2013-01-05', '2013-01-07', '2013-01-09', '2013-01-11'],
                        ['data3', 210, 450, 20, 400, 350, 150,250]
                    ], colors:{'data3':'green'}, type:'bar'});
            */
         $log.info("data",toto);   
        };
    }
]);




/*
var chart = c3.generate({
    data: {

        xs:{
        'data1':'x1',
        'data2':'x2',
        },

        columns: [
            ['x1', '2013-01-01', '2013-01-03', '2013-01-05', '2013-01-07', '2013-01-09', '2013-01-11'],
            ['x2', '2013-01-02', '2013-01-04', '2013-01-06', '2013-01-08', '2013-01-10', '2013-01-12', '2013-01-14'],
            ['data1', 30, 200, 100, 400, 150, 250],
            ['data2', 130, 340, 200, 500, 250, 350,150]
        ]
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d'
            }
        }
    }
});
function doit(){
    console.info("native", chart.data());
}*/
