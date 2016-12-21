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
    var app = angular.module('fb.receipt', ['ngTouch']);
    
    app.controller('fb.receipt.receiptController', ['$scope','$state','fb.receipt.receiptFactory',function($scope,$state,fac){
        $scope.id = "";

        /** 初始化模板对象 **/
        $scope.receiptData = {
            header : '', 
            color : '#009688',
            showLogo : true,
            showInfo : true,
            desc : ''
        };

        $scope.cloneReceiptData = {};
    
        /** 初始化空店铺对象 **/
        $scope.restaurantData = {
             tel : '',
             net : '',
             facebook : '',
             img : ''
        };
        /** 从后台读取用户发票模板数据 **/
        fac.getReceiptTemp(function(data){
            $scope.id = data.id;
            $scope.cloneReceiptData = angular.copy(data.mposfb);
            $scope.receiptData = data.mposfb;
        });

        /** 从后台读取店铺数据 **/
        fac.getRestaurant({
            merchant:localStorage.getItem("merchant")
        },function(returnObj){
            if(returnObj.success && returnObj.results && returnObj.results.length>0){
                var resObj = returnObj.results[0];
                var resId = resObj.id;
                /** 从后台读取店铺图片数据 **/
                fac.getRestaurantImg({
                 id :　resId
                 },function(data){
                    $scope.restaurantData.img = data;
                 });
                 $scope.restaurantData = resObj.mposfb;
            }

        });
        
        /** 数据还原 **/
        $scope.reset = function(){
            $scope.receiptData = angular.copy($scope.cloneReceiptData);
        };
        
        /** 数据保存 **/
        $scope.saveReceipt = function(){
            $scope.isLoading = true;
            var receiptData = {};
            angular.extend(receiptData,$scope.receiptData,{merchant : localStorage.getItem("merchant")})
            fac.saveReciptTemp({
                id : $scope.id,
                receiptData : receiptData
            },function(returnObj){
                $scope.id = returnObj.id;
                $scope.isLoading = false;
            });
        }

    }]);
    app.factory('fb.receipt.receiptFactory', ['$http',function($http){
        return {
             /** 从后台获取当前用户的发票模板数据 **/
             getReceiptTemp : function(callback){
                 $http({
                     method: 'POST',
                     url: '/getReceiptTemp',
                     data:{
                         merchant : localStorage.getItem("merchant")
                     }
                 }).success(function(data, header, config, status) {
                     if (data.success) {

                         return callback && callback(data.results[0]);
                     }
                 });
             },
             /**  保存或更新发票模板数据  **/
             saveReciptTemp : function(params,callback){
                 $http({
                     method: 'POST',
                     url: '/saveReciptTemp',
                     data:params
                 }).success(function(data, header, config, status) {
                     if (data) {
                         return callback && callback(data);
                     }
                 });
             },
             /** 获取商铺信息 **/
             getRestaurant : function(params,callback){
                 $http({
                     method: 'POST',
                     url: '/getRestaurant',
                     data:params
                 }).success(function(data, header, config, status) {
                     if (data) {
                         return callback && callback(data);
                     }
                 });
             },
             /** 获取商铺图标 **/
             getRestaurantImg : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/getImage',
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