"use strict";

angular.module("myApp",
	[
		'ui.router'
		, 'ngCookies'
		, 'chieffancypants.loadingBar'
		, 'ngAnimate'
		, 'ui.sortable'
		, 'ngFileUpload'
		,
	])
	.config(function ($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise("/top");

		$stateProvider
			.state("top", {
				"url": "/top"
				, "templateUrl": "views/top/top.html"
			})
			.state("imagePut", {
				"url": "/imagePut"
				, "templateUrl": "views/imagePut/imagePut.html"
				, "params": {
					'isParams': null
					, 'timeStandardHour': null
					, 'timeStandardMin': null
					, 'timeEvents': null
				}
			})
			.state("pngPut", {
				"url": "/pngPut"
				, "templateUrl": "views/pngPut/pngPut.html"
				, "params": {
					'isParams': null
					, 'timeStandardHour': null
					, 'timeStandardMin': null
					, 'timeEvents': null
				}
			})
			.state('error', {
				"url": "/:path"
				, "templateUrl": '404 ERR <a ui-sref="top">back</a>'
			});

	})
	.factory('httpService', ['$log', function ($str) {
		return null;
	}]);
