"use strict";

var topCtrl = (function () {

	function topCtrl(
		$scope
		, $cookies
		, cfpLoadingBar
		, $timeout
		, $state
		, Upload
		, COMMON_DEF
	) {

		$scope.timeEvents = [];
		$scope.$timeout = $timeout;
		$scope.COMMON_DEF = COMMON_DEF;

		$scope.init = function () {

			//ローディング開始
			cfpLoadingBar.start();

			//クッキーからデータ取得
			var timeTableData = $cookies.getObject('timeTableData');
			var timeStandardHour = $cookies.getObject('timeStandardHour');
			var timeStandardMin = $cookies.getObject('timeStandardMin');

			//クッキーにデータが存在しない場合は初期設定
			if (timeTableData == undefined || timeStandardHour == undefined || timeStandardMin == undefined) {
				$scope.firstinit();
			}
			//クッキーにデータが存在した場合は再現
			else {
				angular.forEach(timeTableData, function (value, key) {
					$scope.timeEvents.push(
						{
							cardNo: value.cardNo, text: value.text, timeMin: value.timeMin, timeStart: null, timeEnd: null,
						}
					);
				});

				//初期時間再現
				$scope.timeStandardHour = timeStandardHour;
				$scope.timeStandardMin = timeStandardMin;
			}

			//時間計算
			$scope.timeCalculation();

			//ローディング終了
			$timeout(function () {
				cfpLoadingBar.complete();
			}, 750);

		};

		//最初の画面設定、クッキーにデータがなかった場合
		$scope.firstinit = function () {

			$scope.timeStandardHour = ('0' + $scope.COMMON_DEF.SYOKI_HOUR).slice(-2);
			$scope.timeStandardMin = ('0' + $scope.COMMON_DEF.SYOKI_MIN).slice(-2);

			//テンプレート文字格納
			$scope.timeEvents = [
				{ cardNo: 1, text: "Contents_1", timeMin: 15, timeStart: null, timeEnd: null, },
				{ cardNo: 2, text: "Contents_2", timeMin: 30, timeStart: null, timeEnd: null, },
				{ cardNo: 3, text: "Contents_3", timeMin: 50, timeStart: null, timeEnd: null, }
			];

		};

		//クッキーSAVE
		$scope.dataSave = function () {
			//クッキー保管3ヶ月
			var expire = new Date();
			expire.setMonth(expire.getMonth() + 3);
			$cookies.putObject('timeTableData', $scope.timeEvents, expire);
			$cookies.putObject('timeStandardHour', $scope.timeStandardHour, expire);
			$cookies.putObject('timeStandardMin', $scope.timeStandardMin, expire);
		};

		//基準時間変更
		$scope.onClickKijyunJikanChenge = function () {
			//時間計算
			$scope.timeCalculation();
			//クッキーSAVE
			$scope.dataSave();
		};

		//ドラッグ＆ドロップ処理
		$scope.sortableOptions = {
			update: function (e, ui) {
				$scope.timeEvents;
			},
			stop: function (e, ui) {
				var cnt = 1;
				angular.forEach($scope.timeEvents, function (value, key) {
					value.cardNo = cnt;
					cnt++;
				});

				//時間計算
				$scope.timeCalculation();

				//クッキーSAVE
				$scope.dataSave();
			},
		};

		//ダウンロードPNG
		$scope.onClickDownloadPng = function () {

			//遷移
			$state.go('imagePut', {
				isParams: true
				, timeStandardHour: $scope.timeStandardHour
				, timeStandardMin: $scope.timeStandardMin
				, timeEvents: $scope.timeEvents
			});

		};

		//ダウンロードＣＳＶ
		$scope.onClickDownloadCsv = function () {

			//出力ファイル名
			var exportedFilenmae = "time_table_" + $scope.getDateText() + ".csv";
			var bom = "\uFEFF";
			var blob = new Blob([bom, $scope.getStrCsv()], {
				"type": "text/csv"
			});

			var link = document.createElement("a");
			if (link.download !== undefined) {
				var url = URL.createObjectURL(blob);
				link.setAttribute("href", url);
				link.setAttribute("download", exportedFilenmae);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}

		};

		//strデータ作成
		$scope.getStrCsv = function () {
			//カラム名
			var csv = 'No,Start,End,Minutes,Contents\r\n';
			angular.forEach($scope.timeEvents, function (value, key) {
				csv +=
					value.cardNo + ',' +
					value.timeStart + ',' +
					value.timeEnd + ',' +
					value.timeMin + ',' +
					value.text + '\r\n';
			});
			return csv;
		};

		//コピー
		$scope.onClickCopy = function () {
			var input = document.createElement('textarea');
			input.setAttribute('id', 'copyinput');
			document.body.appendChild(input);
			input.value = $scope.getStrCsv();
			copyToClipboard(input);
			document.body.removeChild(input);
			alert('copied!');
		};

		//コピー、スマホ対応
		function copyToClipboard(el) {
			el = (typeof el === 'string') ? document.querySelector(el) : el;
			if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
				var editable = el.contentEditable;
				var readonly = el.readonly;
				el.contentEditable = true;
				el.readonly = true;
				var range = document.createRange();
				range.selectNodeContents(el);
				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
				el.setSelectionRange(0, 999999);
				el.contentEditable = editable;
				el.readonly = readonly;
			} else {
				el.select();
			}
			document.execCommand('copy');
		};

		//アップロードＣＳＶ
		$scope.onClickUploadCsv = function () {
			$scope.$timeout(function () {
				//アップロードダイアログを表示
				document.getElementById("upload_file").click();
			});
		};

		//CSVパース
		$scope.parseFile = function (files) {

			if (files == undefined) {
				return;
			}

			//ローディング開始
			cfpLoadingBar.start();

			Papa.parse(files, {
				delimiter: ",",
				header: true,
				comments: "#",
				skipEmptyLines: true,
				complete: function (res) {

					//ローディング終了
					$timeout(function () {
						cfpLoadingBar.complete();
					}, 750);

					//データ復元
					if (res != undefined) {
						$scope.dataRestore(res.data);
					}
				},
				//エラー時
				error: function (err) {
				}
			});
		};

		//復元
		$scope.dataRestore = function (data) {

			//初期化
			$scope.firstinit();
			$scope.timeEvents = [];

			//最初の行からStartTime取得
			var result = data[0].Start.split(':');
			$scope.timeStandardHour = result[0];
			$scope.timeStandardMin = result[1];

			//格納
			angular.forEach(data, function (value, key) {
				$scope.timeEvents.push(
					{
						cardNo: Number(value.No)
						, text: value.Contents
						, timeMin: Number(value.Minutes)
						, timeStart: null
						, timeEnd: null
					}
				)
			});

			//時間計算
			$scope.timeCalculation();

			//クッキーSAVE
			$scope.dataSave();

		};

		//PDF 
		$scope.onClickPdf = function () {

			pdfMake.fonts = {
				IPAgothic: {
					normal: 'ipaexg.ttf',
					bold: 'ipaexg.ttf',
					italics: 'ipaexg.ttf',
					bolditalics: 'ipaexg.ttf'
				},
				IPAmincho: {
					normal: 'ipaexm.ttf',
					bold: 'ipaexm.ttf',
					italics: 'ipaexm.ttf',
					bolditalics: 'ipaexm.ttf'
				}
			}

			var strBody = Array();
			strBody.push([
				{ text: "No", bold: true }
				, { text: "Start", bold: true }
				, { text: "End", bold: true }
				, { text: "Minutes", bold: true }
				, { text: "Contents", bold: true }
			]);

			angular.forEach($scope.timeEvents, function (value, key) {
				strBody.push([String(value.cardNo), value.timeStart, value.timeEnd, String(value.timeMin), value.text]);
			});

			var docDefinition = {
				defaultStyle: {
					font: 'IPAgothic'
				},
				content: [
					{
						table: {
							headerRows: 1, widths: ['auto', 'auto', 'auto', 'auto', 'auto']
							, body: strBody
						}
					}
				]
			};
			pdfMake.createPdf(docDefinition).open();
		};

		//リセット
		$scope.onClickReset = function () {
			$scope.firstinit();
			$scope.timeCalculation();
			$scope.dataSave();
		};

		//スマホ用INPUT対応
		$scope.onClickInputArea = function (target) {
			document.getElementById(target).focus();
		};

		//PNG画像
		$scope.onClickPng = function () {

			//遷移
			$state.go('pngPut', {
				isParams: true
				, timeStandardHour: $scope.timeStandardHour
				, timeStandardMin: $scope.timeStandardMin
				, timeEvents: $scope.timeEvents
			});

		};

		//追加
		$scope.onClickTimeAreaAdd = function () {
			var cnt = $scope.timeEvents.length + 1;
			$scope.timeEvents.push(
				{ cardNo: cnt, text: "Contents_" + cnt, timeMin: 15, timeStart: null, timeEnd: null, }
			);

			//時間計算
			$scope.timeCalculation();
			//クッキーSAVE
			$scope.dataSave();

		};

		//削除
		$scope.onClickTimeAreaDelete = function (cardNo) {
			$scope.timeEvents.splice(cardNo - 1, 1);
			$scope.timeCalculation();
			$scope.dataSave();
		};

		//時間計算
		$scope.timeCalculation = function () {

			var timeStandard = new Date("2000/1/1 " + $scope.timeStandardHour + ":" + $scope.timeStandardMin + ":00");
			var time = timeStandard;
			var cnt = 0;

			angular.forEach($scope.timeEvents, function (value, key) {
				cnt++;
				value.cardNo = cnt;
				var hour = time.getHours();
				var minute = time.getMinutes();
				value.timeStart = ('0' + hour).slice(-2) + ":" + ('0' + minute).slice(-2);
				time = new Date(+new Date(time) + (value.timeMin * 60 * 1000));
				hour = time.getHours();
				minute = time.getMinutes();
				value.timeEnd = ('0' + hour).slice(-2) + ":" + ('0' + minute).slice(-2);

			});

		};

		//日時取得
		$scope.getDateText = function () {

			var weeks = new Array('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');

			var now = new Date();

			var year = now.getYear();
			var month = now.getMonth() + 1;
			var day = now.getDate();
			var week = weeks[now.getDay()];
			var hour = now.getHours();
			var min = now.getMinutes();
			var sec = now.getSeconds();

			if (year < 2000) { year += 1900; }

			if (month < 10) { month = "0" + month; }
			if (day < 10) { day = "0" + day; }
			if (hour < 10) { hour = "0" + hour; }
			if (min < 10) { min = "0" + min; }
			if (sec < 10) { sec = "0" + sec; }

			var str = year + month + day + '_' + week + '_' + hour + min + sec;

			return str;

		};

		$scope.init();

	}

	return topCtrl;

}());

angular.module("myApp")
	.controller("topCtrl", [
		"$scope"
		, "$cookies"
		, "cfpLoadingBar"
		, "$timeout"
		, "$state"
		, "Upload"
		, "COMMON_DEF"
		, topCtrl
	]);
