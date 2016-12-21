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
    var app = angular.module('fb.menucategory', ['ngTouch','ngAnimate','ngSanitize','ui.bootstrap']);

    app.controller('fb.menucategory.menucategoryController', ['$scope','$q','$state','$timeout','$uibModal','fb.menucategory.menucategoryFactory',function($scope,$q,$state,$timeout,$uibModal,fac){

		/**
		 * 初始化数据格式
		 */
		$scope.id = null;
		$scope.categoryData = {
			name : '',
			posName : '',
			containItems : 0 ,
			type  : 'category',
			merchant : localStorage.getItem("merchant")
		};
		$scope.clearData = {};
		angular.copy($scope.categoryData,$scope.clearData);

		/** Item数据处理 **/
		$scope.mapItem = function(){
			angular.forEach($scope.assignItems,function(row){
				if( row.mposfb.category && $scope.id && row.mposfb.category == $scope.id ){
					row.isChecked = true;
				}else{
					row.isChecked = false;
				}
			});
		};
		
		/** 行选择事件 **/
		$scope.$on("selectrowCategory",function(event,row){
			$scope.id = row.id;
			$scope.showError = false;
			/** 新增 **/
			if( $scope.id== undefined){
				angular.copy($scope.clearData,$scope.categoryData);
				angular.copy($scope.clearAssignItems,$scope.assignItems);
			}
			/** 更新 **/
			else{
				/** 创建新的数据源地址 **/
				var destination = {};
				if( $scope.id== undefined){
					angular.copy($scope.clearData,$scope.categoryData)
				}else{
					angular.copy(row,destination);
					/** 继承新数据源 **/
					angular.extend($scope.categoryData,destination);
				}
			}
			$scope.mapItem();
		});

		/**  所有Item列表绑定数据源 **/
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
						if (item.isChecked)
							assign++;
						/**  判断需要修改category的item **/
						if(item.isChecked && (($scope.id == null || $scope.id == undefined) || ( $scope.id && $scope.id != item.mposfb.category ) )){
							$scope.addItem[item.id] = item.mposfb;
						}
						/** 判断需要去掉category的Item **/
						else if( !item.isChecked && $scope.id && $scope.id == item.mposfb.category ){
							$scope.deleteItem[item.id] = item.mposfb;
							delete $scope.addItem[item.id];
						}
						else if( !item.isChecked ){
							delete $scope.addItem[item.id];
						}
					});
					$scope.categoryData.containItems = assign;
				}, function () {
					console.log('Modal dismissed at: ' + new Date());
				});
			});
    	};

		/**  保存Category **/
		$scope.saveCategory = function(){
			if(!$scope.categoryData.name){
				$scope.showError = true;
				return;
			}
			$scope.$parent.isLoading = true;
			fac.saveCategory({
				id : $scope.id,
				categoryData : $scope.categoryData,
				addItem : $scope.addItem,
				deleteItem : $scope.deleteItem	
			},function(returnObj){
				if (returnObj.success) {
					$scope.hideMenuEdit();
					if($scope.id){
						$scope.$parent.isLoading = false;
						$scope.$parent.initCategory(0,20);
					}else{
						setTimeout(function(){
							$scope.$parent.isLoading = false;
							$scope.$parent.initCategory(0,20);
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

		/** 删除Category **/
		$scope.deleteCategory = function(){
			$scope.$parent.isLoading = true;
			if( $scope.id ){
				fac.deleteCategory({
					id : $scope.id
				},function(returnObj){
					$scope.$parent.isLoading = false;
					if(returnObj.success){
						$scope.$parent.initCategory($scope.$parent.pageCategory.start,$scope.$parent.pageCategory.pageSize);
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
    
	app.factory('fb.menucategory.menucategoryFactory', ['$http',function($http){
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
			saveCategory : function(params,callback){
				$http({
					method: 'POST',
					url: '/saveCategory',
					data:params
				}).success(function(data, header, config, status) {
					if (data) {
						return callback && callback(data);
					}
				});
			},
			/** 删除Category **/
			deleteCategory : function(params,callback){
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