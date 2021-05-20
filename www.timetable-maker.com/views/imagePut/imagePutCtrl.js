"use strict";

var imagePutCtrl = (function () {
	function imagePutCtrl(
		$scope
		, cfpLoadingBar
		, $timeout
		, $state
	) {

		$scope.timeStandardHour = null;
		$scope.timeStandardMin = null;
		$scope.timeEvents = [];

		$scope.init = function () {
			//ローディング開始
			cfpLoadingBar.start();

			//パラメータがわたっていない場合はtopへ
			if ($state.params.isParams == null) {
				//トップ画面へ遷移
				$state.go('top');
			}

			$scope.timeStandardHour = $state.params.timeStandardHour;
			$scope.timeStandardMin = $state.params.timeStandardMin;
			$scope.timeEvents = $state.params.timeEvents;
			//ローディング終了
			$timeout(function () {
				cfpLoadingBar.complete();
			}, 750);

		}
		$scope.init();
	}
	return imagePutCtrl;
}());

angular.module("myApp").controller("imagePutCtrl", [
	"$scope"
	, "cfpLoadingBar"
	, "$timeout"
	, "$state"
	, imagePutCtrl
]);
