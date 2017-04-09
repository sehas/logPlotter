//start with chrome : chrome.exe --allow-file-access-from-files  --user-data-dir=D:\tmp\chromeTmp  --disable-web-security


/////////////////////////////////////////////////////////////////
////////////////////// Simple factory to make D3js avaiable
/////////////////////////////////////////////////////////////////
angular.module('d3', []).factory('d3Service', ['$q',
    function($q) {
        //create promise of D3
        //var d = $q.defer();
        return window.d3;
    }]);


var module = angular.module('GraphApp', [ 'ngMaterial','ngSanitize', 'Parsers','angularChart','d3', 'GraphManager']);
module.config(function($mdThemingProvider) {
    // Update the theme colors to use themes on font-icons
    $mdThemingProvider.theme('default')
    // .primaryPalette("blue")
    // .accentPalette('green')
    // .warnPalette('red')
    ;
});

/////////////////////////////////////////////////////////////////
////////////////////// Service to handle file upload. provide feedback (start, progress and error) of loading process
/////////////////////////////////////////////////////////////////
module.factory('fileHandler', [ '$log', '$q', function($log, $q) {
    var factory = {};
    var onLoad = function(reader, deferred, scope) {
        return function() {
            deferred.resolve(reader.result);
        };
    };
    var onError = function(reader, deferred, scope) {
        return function(e) {
            deferred.reject(reader.result);
        };
    };
    var onProgress = function(reader, scope) {
        return function(event) {
            scope.$broadcast("fileProgress", {
                total : event.total,
                loaded : event.loaded
            });
        };
    };
    var getReader = function(deferred, scope) {
        var reader = new FileReader();
        reader.onload = onLoad(reader, deferred, scope);
        //reader.onloadend = onLoad(reader, deferred, scope);
        reader.onerror = onError(reader, deferred, scope);
        reader.onprogress = onProgress(reader, scope);
        return reader;
    };
    var readAsDataURL = function(file, scope) {
        var deferred = $q.defer();
        var reader = getReader(deferred, scope);
        reader.readAsDataURL(file);
        return deferred.promise;
    };
    var readAsText = function(file, scope) {
        var deferred = $q.defer();
        var reader = getReader(deferred, scope);
        reader.readAsText(file);
        return deferred.promise;
    };
    factory.readAsDataURL = readAsDataURL;
    factory.readAsText = readAsText;
    return factory;
} ]);
/////////////////////////////////////////////////////////////////
////////////////////// Service to handle file upload. provide feedback (start, progress and error) of loading process
/////////////////////////////////////////////////////////////////
module.factory('logger', [ '$log', function($log) {
    var logger = {};
    var logs=[];
    var log=function(level, ...message){
        logs.push({"level":level||"info","message":message[0].join('')});
        return logger;
    };
    var info = function(...message) {
        return log("info",message);
    };
    var warn = function(...message) {
        return log("warning",message);
    };
    var error = function(...message) {
        return log("error",message);
    };
    logger.info = info;
    logger.warn = warn;
    logger.error = error;
    logger.getLogs=function(){return logs};
    logger.clear=function(){logs.length=0;return logger;};
    return logger;
} ]);

/////////////////////////////////////////////////////////////////
//////////////////////Color service : provide a lis of (d3) colors
/////////////////////////////////////////////////////////////////
module.factory('colorService',['d3Service', function(d3Service){
    var colors=d3Service.scale.category20();
    return {
        getColor:function(idx) {
            return colors(idx);
        },
        getColors:function(){
            return colors.range();
        }
    };
}]);

/////////////////////////////////////////////////////////////////
////////////////////// chart types provider
/////////////////////////////////////////////////////////////////
module.constant('CHART_TYPES',[{"type":"bar","name":"Bar chart", "icon":"equalizer"},
    {"type":"line","name":"Line", "icon":"timeline"},
    {"type":"spline","name":"Bezier", "icon":"looks"},
    {"type":"scatter","name":"Dots", "icon":"grains"}
]);

/////////////////////////////////////////////////////////////////
////////////////////// Default category
/////////////////////////////////////////////////////////////////
module.constant('DEFAULT_CATEGORY',{"format":"process","type":"spline","color":null,"show":true});

/////////////////////////////////////////////////////////////////
//  Main controller
/////////////////////////////////////////////////////////////////
module.controller('GraphCtrl', [ '$scope', '$log', 'fileHandler', 'processParser','graphManager','colorService','logger', 'CHART_TYPES', 'DEFAULT_CATEGORY', '$mdDialog','$mdBottomSheet','$mdToast','$timeout',
    function($scope, $log, fileHandler, processParser, graphManager, colorService, logger, CHART_TYPES, DEFAULT_CATEGORY, $mdDialog, $mdBottomSheet, $mdToast, $timeout) {
        /////////////////////////////////////////////////////////////////
        ////////////////////// setup
        // optional (direct access to c3js API http://c3js.org/reference.html#api) with  $scope.instance
        /////////////////////////////////////////////////////////////////
        /*
         *                 "date": {
                    "axis": 'x',
                    "dataType":"timeseries",
                    "dataFormat":"%Y-%m-%dT%H:%M:%S%Z",
                    "displayFormat":"%d/%m %H:%M"
                }
         */
        $scope.chartOptions={
            "data": [],
            "dimensions": {
            },
            "chart":{
                "subchart": {
                    "show": true,
                    "selector": true
                }}
        };
        // series list
        //$scope.categories=[];
        $scope.colors=colorService.getColors();
        var graphManager = graphManager;
        $scope.categories=graphManager.categories();
        //wait... a random delay for rendering, then resize
        $timeout(function(){
            //addCategory(angular.extend({"name":'dummy', "label":"Dummy Category","length":3}, DEFAULT_CATEGORY), [{'date':new Date(),'dummy':1},{'date':new Date(new Date().getTime()+10000),'dummy':3},{'date':new Date(new Date().getTime()+20000),'dummy':2}]);
            var container=document.querySelector('#chartContainer');
            //graphManager.resize({"height":container.clientHeight ,"width":container.clientWidth});
graphManager.resize();
            addCategory(angular.extend({"name":'dummy', "label":"Dummy Category","length":3}, DEFAULT_CATEGORY), {x:[new Date(),new Date(new Date().getTime()+10000),new Date(new Date().getTime()+20000)], y:[100,200,150]});}
            ,200);

        //log management
        $scope.logs=logger.getLogs();
        $scope.clearLog=function(){
            logger.clear();
        };
        //logger.info("an info"," messge").warn("a warn message").error("an error message");
        /////////////////////////////////////////////////////////////////
        ////////////////////// import a file
        /////////////////////////////////////////////////////////////////
        $scope.import = function(importer) {
            $scope.progress = {
                "loaded" : 0,
                "total" : 0,
                "ratio" : function() {
                    return this.total ? 100 * (this.loaded / this.total) : 0;
                }
            };
            $scope.parsePorgress={"parsed":0, "status":"none"};
            fileHandler.readAsText(importer.dataFile, $scope).then(function(result) {
                logger.info('import done');
                logger.info('parsing...');
                processParser.parse(result).then(function(result){
                    logger.info('Parsing done. ', result.x.length ,' records parsed');
                    $scope.parsePorgress={"parsed":result.x.length, "status":"done"};
                    //delete attribute 'dataFile' before merging object
                    delete importer['dataFile'];
                    var cat=angular.extend({"name":importer.format+$scope.categories.length,"label":"Processes #"+$scope.categories.length, "length":result.x.length},importer);
                    addCategory(cat , result);
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('category '+cat.label+' imported')
                        .position('bottom left' )
                        .hideDelay(3000)
                    );
                },function(error){
                    logger.error('parsing fail:', error);
                    $scope.parsePorgress={"parsed":status.parsed, "status":"error"};
                },function(status){
                    if (status.error) {
                        logger.warn('Parsing issue at line ',status.line,' source:', status.source);
                    } else{
                        $scope.parsePorgress={"parsed":status.parsed, "status":"pending"};
                    }
                });
            });
        };
        $scope.$on("fileProgress", function(e, progress) {
            $scope.progress.loaded = progress.loaded
            $scope.progress.total = progress.total;
        });
        /////////////////////////////////////////////////////////////////
        ////////////////////// main controller
        /////////////////////////////////////////////////////////////////
        /**
         * pick a color
         */
        $scope.select=function(col){
            $mdDialog.hide(col);
        };
        $scope.showColorPicker = function(ev, cat) {
            $mdDialog.show({
                contentElement: '#colorPicker',
                parent: angular.element(document.body),
                targetEvent: ev,
                hasBackdrop :false,
                clickOutsideToClose: true
            }).then(function(answer){cat.color=answer});
        };
        /**
         * add a (graph) category
         */
        function addCategory(cat, data){
            //set auto color if no color defined
            cat.color=cat.color || colorService.getColor(Object.keys($scope.categories).length);
            //$scope.categories.push(cat);
            //$scope.chartOptions.dimensions[cat.name]=cat;
            //$scope.chartOptions.data=$scope.chartOptions.data.concat(data);
            graphManager.add(cat, data);
        }
        /**
         * select a category
         */
        $scope.selectCategory=function(cat) {
            $scope.categories.selected=cat;
            // show detail (bottom sheet) screen
            $mdBottomSheet.show({
                templateUrl: 'categoryDetail.html',
                clickOutsideToClose: true,
                controllerAs : "ctrl",
                controller : [ '$mdBottomSheet', 'CHART_TYPES', categoryCtrl]
            }).then(function(cat){
                //success interpredted as 'delete'
                $scope.categories.selected=null;
                graphManager.remove(cat);
                $log.info("container size",document.querySelector('#chartContainer').clientHeight );

                logger.warn(cat.label, ' deleted');
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('category '+cat.label+' deleted')
                    .position('bottom left' )
                    .hideDelay(3000)
                );

            },function() {
                //reject interpredted as nothing to do
                $log.debug(cat.name, 'edited');
            });

            /**
             * Category edit controller
             */
            function categoryCtrl( $mdBottomSheet, CHART_TYPES ) {
                this.category = cat;
                this.chartTypes=CHART_TYPES;
                this.showColorPicker = $scope.showColorPicker;
                /**
                 * Delete a grap category
                 */
                this.deleteCategory = function(ev) {
                    var confirm = $mdDialog.confirm()
                        .title('Confirm deletion ?')
                        .htmlContent("The category <b>"+this.category.name +"</b> will be permanently deleted")
                        .ariaLabel('delete')
                        .targetEvent(ev)
                        .ok('Delete')
                        .cancel('Cancel');

                    $mdDialog.show(confirm).then(function() {
                        $mdBottomSheet.hide($scope.categories.selected);
                    }, function() {
                        $log.debug("don't delete");
                    });
                };
            }
        };
        /**
         * import dialog
         */
        $scope.showImportDialog = function(ev) {
            $mdDialog.show({
                controller: 'ImportCtrl',
                templateUrl: 'importCategory.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            })
                .then(function(answer) {
                    logger.info("importing ", answer.dataFileName, ", type ", answer.format, '...');
                    $scope.import(answer);
                }, function() {
                    logger.warn("import cancelled");
                });
        };

        $log.info("container size",document.querySelector('#chartContainer').clientHeight );

    } ]);

/////////////////////////////////////////////////////////////////
////////////////////// import dialog controller
/////////////////////////////////////////////////////////////////
module.controller('ImportCtrl', [ '$scope', '$log', 'colorService','CHART_TYPES','DEFAULT_CATEGORY','$mdDialog',
    function($scope, $log, colorService,CHART_TYPES, DEFAULT_CATEGORY, $mdDialog) {
        $scope.importer=angular.extend({},DEFAULT_CATEGORY);
        $scope.chartTypes=CHART_TYPES;
        $scope.colors=colorService.getColors();
        $scope.import=function () {
            $mdDialog.hide($scope.importer);
        }
        $scope.cancel=function () {
            $mdDialog.cancel();
        }
    }]);

/**
 * file picker directive
 */
module.directive('apsFile', [ '$parse', '$timeout', function($parse, $timeout) {
    var chooser;
    var link = function(scope, element, attrs) {
        element.bind('click', function() {
            chooser.click()
        });
        chooser.addEventListener('change', function(e) {
            scope.file = e.target.files[0];
            scope.fileName = scope.file.name;
            scope.$apply();
            $timeout(function() {
                element.triggerHandler('change');
            }, 1000);
            /*
             * var model = $parse(attrs.ngModel); var modelSetter =
             * model.assign; scope.$apply(function() { modelSetter(scope,
             * file.name); }); model = $parse(attrs.apsFile); modelSetter =
             * model.assign; scope.$apply(function() { modelSetter(scope, file);
             * });
             */
        });
    }
    return {
        restrict : 'A',
        require : [ 'ngModel' ],
        scope : {
            fileName : '=ngModel',
            file : '=apsFile'
        },
        compile : function(element, attributes) {
            chooser = document.createElement("input");
            chooser.setAttribute('type', 'file');
            chooser.setAttribute('style', 'display:none;');
            document.body.appendChild(chooser);
            return link;
        }
    };
} ]);
// http://odetocode.com/blogs/scott/archive/2013/07/03/building-a-filereader-service-for-angularjs-the-service.aspx
