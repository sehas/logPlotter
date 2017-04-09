/**
 * http://usejsdoc.org/
 */
/////////////////////////////////////////////////////////////////
////////////////////// Simple factory to make C3 avaiable
/////////////////////////////////////////////////////////////////
angular.module('c3', []).factory('c3Service', ['$q',
    function($q) {
        //create promise of D3
        //var d = $q.defer();
        return window.c3;
    }]);


/////////////////////////////////////////////////////////////////
////////////////////// C3 adapter
/////////////////////////////////////////////////////////////////
angular.module('GraphManager', ['c3']).factory('graphManager', [ '$log', '$q', '$timeout','c3Service','$rootScope', function($log, $q, $timeout, c3Service, $rootScope) {
    var instance;
    var categories=[];
    var defaultOptions={ 
        "data":{
            "json":{},
        },
        "axis": {
            "x": {
                "type": 'timeseries',
                "tick": {
                    "format": '%Y-%m-%d'
                }
            }
        },
        "tooltip": {
            "format": {
                "title":function (d) {return d.toISOString(); }
            }
        },
        "zoom":{"enabled":true},
        "subchart":{"show":true}
    };
    var init=function(options) {
        instance=c3Service.generate( angular.extend(options||{},defaultOptions));
    }

    var getNames=function(cat){
        return {"x":'x'+cat.name,"y":cat.name};

    }
    /**
     * update attributes of a graph category
     */
    var autoUpdate=function(newCat, oldCat) {
        var names=getNames(oldCat);
        if(newCat.color !== oldCat.color) {
            instance.data.colors({[names.y]: newCat.color});
        }
        if(newCat.show !== oldCat.show) {
            var options={"withLegend": true};
            if(newCat.show){
                instance.show(names.y, options);
            } else {
                instance.hide(names.y, options);
            }
        }
        if(newCat.type !== oldCat.type) {
            instance.transform(newCat.type,names.y);
        }
        if(newCat.label !== oldCat.label) {
            instance.data.names({[names.y]:newCat.label});
        }
    }

    var add=function(cat, data){
        var names=getNames(cat);
        instance.load({
            "xs":{[names.y]:names.x},
            "colors":{[names.y]:cat.color},
            "types":{[names.y]:cat.type},
            "names":{[names.y]:cat.label},
            "columns":[
                [names.x].concat(data.x),
                [names.y].concat(data.y)
            ]
        });


        categories.push(cat);
        // watch the category, and reflect changes to the graph
        $rootScope.$watch(function() {
            return cat;
        },autoUpdate, true);
    }
    var remove=function(cat){
        var names=getNames(cat);
        instance.unload({"ids":names.y});
        categories.splice(categories.indexOf(cat),1);

    };
    var resize = function (size) {
        instance.resize(size);
    };
    //public API
    var graphManager={};
    graphManager.instance=init();
    graphManager.categories=function(){return categories};
    graphManager.add=add;
    graphManager.remove=remove;
    graphManager.resize=resize;
    //$log.info("initial onresize", instance.config.onresize);
    return graphManager;
}]);
