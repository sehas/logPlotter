/**
 * http://usejsdoc.org/
 */
var module = angular.module('Parsers', []);
module.factory('processParser', [ '$log', '$q', '$timeout', function($log, $q, $timeout) {
	var factory = {};

	var notify = function(deferred, current) {
		deferred.notify({
			"parsed" : current
		});
	};

    /**
     * for each item matching the pattern '2017-12-31T23:15:59,123', append  date to an array named 'x', and value to an array named 'y'
     */
	var parse = function parse(result) {
		var deferred = $q.defer();
		$timeout(function() {
			var parsed={"x":[], "y":[]};
			var re=/(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d{4}),(\d+)/g;
			var match;
			var i=0;
			notify(deferred, i);
			while(match=re.exec(result)){
				notify(deferred, i++);
                parsed.x.push(new Date(match[1]));
                parsed.y.push(parseInt(match[2]));
            };
			deferred.resolve(parsed);
		}, 0);
		return deferred.promise;

	};
	
	factory.parse=parse;
	
	return factory;

} ]);

module.factory('processParserOld', [ '$log', '$q', '$timeout', function($log, $q, $timeout) {
	var factory = {};

	var notify = function(deferred, current) {
		deferred.notify({
			"parsed" : current
		});
	};

    /**
     * for each item matching the pattern '2017-12-31T23:15:59,123', create a object {'date':aDate,varName:aInteger}
     */
	var parse = function parse(result, name) {
		var localName=name || "cnt";
		var deferred = $q.defer();
		$timeout(function() {
			var parsed=[];
			var re=/(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d[+-]\d{4}),(\d+)/g;
			var match;
			var i=0;
			notify(deferred, i);
			while(match=re.exec(result)){
				notify(deferred, i++);
				var point={"date":new Date(match[1])};
				point[localName]=parseInt(match[2]);
				parsed.push(point);
			};
/*
			var lines = result.split('\n');
			$log.info(lines);
			notify(deferred, lines.length, 0);
			lines.forEach(function(item, index) {
				notify(deferred, lines.length, index);
				//$log.info("item:",item);
				var match=re.exec(item);
				if(!match) {
					deferred.notify({"error":"parse failure","line":(index+1), "source":item});
					return;
					}
				parsed.push({"date":new Date(match[1]), "cnt":parseInt(match[2])});
			});
*/			
			deferred.resolve(parsed);
		}, 0);
		return deferred.promise;

	};
	
	factory.parse=parse;
	
	return factory;

} ]);

//without split
//var data="a,12\nc,13\ne,\nf,14\n";
//console.info(data);
//var re=/(\w+),(\d+)\n/g;
//var matches1=[];
//var matches2=[];
//var match;
//  while (match = re.exec(data)) {
//    matches1.push(match[1]);
//    matches2.push(match[2]);
//  }
//
//
//console.log("1",matches1);
//console.log("2",matches2);
