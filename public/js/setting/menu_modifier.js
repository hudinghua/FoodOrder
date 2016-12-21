/*
* @author hudinghua
* @date   2016/08/24
*/
(function(angular, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['angular'], function(angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
}(window.angular || null, function(angular) {
    'use strict';
    var app = angular.module('fb.menumodifier', ['ngTouch','ngAnimate','ngSanitize','ui.bootstrap']);

    app.controller('fb.menumodifier.menumodifierController', ['$scope','$q','$state','$uibModal','fb.menumodifier.menumodifierFactory',function($scope,$q,$state,$uibModal,fac){

		/**
		 * 初始化数据格式
		 */
		$scope.id = null;
		$scope.modifierData = {
			"max": 0,
			"min": 0,
			"name": "",
			"posName": "",
			"options": [],
			"single": true,
			"summary": "",
			"type": "modifier",
			 merchant : localStorage.getItem("merchant")
		};
		$scope.clearData = {};
		angular.copy($scope.modifierData,$scope.clearData);

		/** Item数据处理 **/
		$scope.mapItem = function(){
			angular.forEach($scope.assignItems,function(row){
				if( row.mposfb.modifiers && $scope.id && row.mposfb.modifiers.indexOf($scope.id)>-1){
					row.isChecked = true;
				}else{
					row.isChecked = false;
				}
			});
		};

		/** 行选择事件 **/
		$scope.$on("selectrowModifier",function(event,row){
			$scope.id = row.id;
			$scope.showError = false;
			/** 创建新的数据源地址 **/
			var destination = {};
			if( $scope.id== undefined){
				angular.copy($scope.clearData,$scope.modifierData)
			}else{
				angular.copy(row,destination);
				delete destination.id;
				/** 继承新数据源 **/
				if(destination.options){
					angular.forEach(destination.options,function(row){
						var floatValue =  parseFloat(row.price);
						row.price = floatValue==NaN?0:floatValue;
					});
				}
				angular.extend($scope.modifierData,destination);
			}
			if ($scope.modifierData.options) {
                $scope.modifierData.options.push({name:"",price:0});
            }else{
                $scope.modifierData.options = [];
                $scope.modifierData.options.push({name:"",price:0});
            }
			$scope.mapItem();
		});

		$scope.assignItems = [];

		/**  查询所有的Item **/
		$scope.refreshItems = function(){
			var deferred = $q.defer();
			fac.queryAllItem({
				merchant : localStorage.getItem("merchant")
			},function(returnObj){
				$scope.assignItems = returnObj.results;
				$scope.clearAssignItems = [];
				angular.copy($scope.assignItems,$scope.clearAssignItems);
				deferred.resolve(returnObj.results);
			});
			return deferred.promise;
		};
		$scope.refreshItems();

		/**  assign Item 操作 **/
		$scope.addItem = {},$scope.deleteItem = {};
    	$scope.assignItem = function(){
			$scope.refreshItems().then(function(){
				$scope.mapItem();
				var modalInstance = $uibModal.open({
					animation: true,
					templateUrl:'tpl/assignItems.html',
					controller: function($scope,items){
						$scope.assignItems = items;
						$scope.assignRow = function(item){
							item.isChecked = !item.isChecked;
						};
						$scope.ASSIGN = function () {
							modalInstance.close($scope.assignItems);
						};
						$scope.CANCEL = function () {
							modalInstance.dismiss('cancel');
						};
					},
					size: '',
					resolve: {
						items: function () {
							return $scope.assignItems;
						}
					}
				});
				modalInstance.result.then(function (rst) {
					var assign = 0;
					angular.forEach(rst, function(item){
						if (item.isChecked) {
							assign++;
						}
						/**  判断需要修改modifier的item **/
						if(item.isChecked && (($scope.id == null || $scope.id == undefined) || ( $scope.id && item.mposfb.modifiers.indexOf($scope.id)==-1 ) )){
							$scope.addItem[item.id] = item.mposfb;
						}
						/** 判断需要去掉modifier的Item **/
						else if( !item.isChecked && $scope.id && item.mposfb.modifiers.indexOf($scope.id)>-1 ){
							$scope.deleteItem[item.id] = item.mposfb;
							delete $scope.addItem[item.id];
						}
						else if( !item.isChecked ){
							delete $scope.addItem[item.id];
						}
					});
					$scope.modifierData.assignedItems = assign;
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			});
    	};


		/** 价格操作 **/
        $scope.delPrice = function(dr){
			$scope.modifierData.options.splice($scope.modifierData.options.indexOf(dr),1);
        };
        $scope.priceEdit = function(nVal){
            var lastRow = $scope.modifierData.options.slice(-1);
            if (lastRow.length > 0) {
                if (lastRow[0].name !== '' && lastRow[0].name != undefined) {
                    $scope.modifierData.options.push({name:"",price:0});
                }
            }
        };

		/**  保存Modifier **/
		$scope.saveModifier = function(){
			if(!$scope.modifierData.name){
				$scope.showError = true;
				return;
			}
			$scope.$parent.isLoading = true;
			if($scope.modifierData.max>1)
				$scope.modifierData.single = false;
			if ($scope.modifierData.options.length > 0) {
                $scope.modifierData.options.splice(-1);
            }
			fac.saveModifier({
				id : $scope.id,
				modifierData : $scope.modifierData,
				addItem : $scope.addItem,
				deleteItem : $scope.deleteItem
			},function(returnObj){

				if (returnObj.success) {
					$scope.hideMenuEdit();
					if($scope.id){
						$scope.$parent.isLoading = false;
						$scope.$parent.initModifier(0,20);
					}else{
						setTimeout(function(){
							$scope.$parent.isLoading = false;
							$scope.$parent.initModifier(0,20);
						},500)
					}
					$scope.id = returnObj.id;
					$uibModal.open({
						templateUrl : 'tpl/modelSuccessful.html',
						size : 'sm',
						controller : function($scope){
							$scope.title = 'Success alert';
							$scope.content = 'Save successfully';
						}
					});
				}else{
					$scope.$parent.isLoading = false;
					$uibModal.open({
						templateUrl : 'tpl/modelFailed.html',
						size : 'sm',
						controller : function($scope){
							$scope.title = 'Failed alert';
							$scope.content = 'Save failed';
						}
					});
				}
			});
		};

		/** 删除Modifier **/
		$scope.deleteModifier = function(){
			$scope.$parent.isLoading = true;
			if( $scope.id ){
				fac.deleteModifier({
					id : $scope.id
				},function(returnObj){
					$scope.$parent.isLoading = false;
					if(returnObj.success){
						$scope.$parent.initModifier($scope.$parent.pageModify.start,$scope.$parent.pageModify.pageSize);
						$uibModal.open({
							templateUrl : 'tpl/modelSuccessful.html',
							size : 'sm',
							controller : function($scope){
								$scope.title = 'Success alert';
								$scope.content = 'Delete successfully';
							}
						});
					}else{
						$uibModal.open({
							templateUrl : 'tpl/modelFailed.html',
							size : 'sm',
							controller : function($scope){
								$scope.title = 'Failed alert';
								$scope.content = 'Delete failed';
							}
						});
					}
				});
			}else{
				$scope.$parent.isLoading = false;
			};
			$scope.hideMenuEdit();
		};


    }]);
	app.factory('fb.menumodifier.menumodifierFactory', ['$http',function($http){
        return {
			/** 查询所有的Item **/
			queryAllItem : function(params,callback){
				$http({
					method: 'POST',
					url: '/queryAllItem',
					data:params
				}).success(function(data, header, config, status) {
					if (data) {
						return callback && callback(data);
					}
				});
			},
			/** 保存Category以及Item Assign **/
			saveModifier : function(params,callback){
				$http({
					method: 'POST',
					url: '/saveModifier',
					data:params
				}).success(function(data, header, config, status) {
					if (data) {
						return callback && callback(data);
					}
				});
			},
			/** 删除Modifier **/
			deleteModifier : function(params,callback){
				$http({
					method: 'POST',
					url: '/deleteDoc',
					data:params
				}).success(function(data, header, config, status) {
					if (data) {
						return callback && callback(data);
					}
				});
			}

		};
    }]);

    return app;
}));