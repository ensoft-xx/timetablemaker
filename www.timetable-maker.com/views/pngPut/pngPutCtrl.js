"use strict";

var pngPutCtrl = (function () {
	function pngPutCtrl(
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
				$scope.onClickGetPng();
				return cfpLoadingBar.complete();
			}, 2000);

		}

		$scope.onClickGetPng = function () {

			var element = document.getElementById("imageTarget");

			//html2canvas実行
			html2canvas(element, {
				scale: 1
			}).then(function (canvas) {
				downloadImage(canvas.toDataURL());
			});

			function downloadImage(data) {
				var fname = "time_table.png";
				var encdata = atob(data.replace(/^.*,/, ''));
				var outdata = new Uint8Array(encdata.length);
				for (var i = 0; i < encdata.length; i++) {
					outdata[i] = encdata.charCodeAt(i);
				}
				var blob = new Blob([outdata], ["image/png"]);

				document.getElementById("getImage").href = data; //base64そのまま設定
				document.getElementById("getImage").download = fname; //ダウンロードファイル名設定
				document.getElementById("getImage").click(); //自動クリック
			}

		};

		$scope.init();

	}
	return pngPutCtrl;
}());

angular.module("myApp").controller("pngPutCtrl", [
	"$scope"
	, "cfpLoadingBar"
	, "$timeout"
	, "$state"
	, pngPutCtrl
]);
