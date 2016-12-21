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
    var app = angular.module('fb.checkout', ['ngTouch','xeditable','ngAnimate','ngSanitize','ui.bootstrap']);
    
    app.controller('fb.checkout.checkoutController', ['$scope','$uibModal','fb.checkout.checkoutFactory',function($scope,$uibModal,fac){
        $scope.isLoading = true;
        $scope.isDisable = true;
        var only = {
            id:'',
            created_by:'',
            created_at:''
        };
        var oldOnly = {};

        $scope.ipData = [];
        $scope.isAddItem = false;
        $scope.currentIp = "";

        $scope.oldData = [];
        $scope.oldIsAddItem = false;
        $scope.oldCurrentIp = "";

        fac.query(function(rst){
            console.log("Checkout Data:",rst);
            $scope.isLoading = false;
            if (!rst.success) {
                $scope.isDisable = true;
                $uibModal.open({
                    templateUrl : 'tpl/modelFailed.html',
                    size : 'sm',
                    controller : function($scope){
                        $scope.title = 'Failed alert';
                        $scope.content = 'Failed to get data';
                    }
                });
            }else{
                $scope.isDisable = false;
                if (rst.results.length > 0) {
                    only = {
                        id:rst.results[0].mposfb.id,
                        created_by:rst.results[0].mposfb.created_by,
                        created_at:rst.results[0].mposfb.created_at
                    };

                    $scope.ipData = rst.results[0].mposfb.data;
                    $scope.isAddItem = angular.isDefined(rst.results[0].mposfb.isAddItem)?rst.results[0].mposfb.isAddItem:true;
                    $scope.currentIp = rst.results[0].mposfb.currentIp;

                    $scope.oldData = angular.copy($scope.ipData);
                    $scope.oldIsAddItem = angular.copy($scope.isAddItem);
                    $scope.oldCurrentIp = angular.copy($scope.currentIp);
                    oldOnly = angular.copy(only);
                }
            }
            console.log(only);
        });

        $scope.checkName = function(data){
            if (data.trim()==='') {
                return 'Device name can not be empty!';
            }
            /*for (var i = $scope.ipData.length - 1; i >= 0; i--) {
                if ($scope.ipData[i].name !== "" && $scope.ipData[i].name === data.trim()) {
                    return 'Device name can not be repeat!';
                }
            }*/
        };
        $scope.checkIp = function(data){
            if (data.trim()==='') {
                return 'Device IP can not be empty!';
            }else{
                var re=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
                if(re.test(data.trim())){
                    if( RegExp.$1 <256 && RegExp.$2<256 && RegExp.$3<256 && RegExp.$4<256){
                        for (var i = $scope.ipData.length - 1; i >= 0; i--) {
                            if ($scope.ipData[i].deviceip !== "" && $scope.ipData[i].deviceip === data.trim()) {
                                return 'Device IP can not be repeat!';
                            }
                        }
                        return true;
                    }else{
                        return 'Please enter a valid device IP address';
                    }
                }else{
                    return 'Please enter a valid device IP address';
                }
            }
        };
        $scope.rowAdd = function(){
            $scope.inserted = {name:'',deviceip:''};
            $scope.ipData.push($scope.inserted);
        };
        $scope.rowSave = function(row){
            var rows = [];
        };
        $scope.rowDelete = function(row){
            $scope.ipData.splice($scope.ipData.indexOf(row),1);
            if (row.deviceip === $scope.currentIp) {
                $scope.currentIp = '';
            }
        };
        $scope.rowCancel = function(row){
            if (row.deviceip === "" && row.name === "") {
                $scope.ipData.splice($scope.ipData.indexOf(row),1);
            }
        };
        $scope.rowSelected = function(row){
            $scope.currentIp = row.deviceip;
        };


        $scope.save = function(){
            var rows = [];
            $scope.ipData.forEach(function(ip){
                if (ip.deviceip !== "" && ip.name !== "") {
                    delete ip.$$hashKey;
                    rows.push(ip);
                }
            });
            if (rows.length === 0) {
                return false;
            }
            var params = {
                data:rows,
                isAddItem:$scope.isAddItem,
                currentIp:$scope.currentIp
            };
            angular.extend(params,only);
            console.log("params:",params);
            $scope.isLoading = true;
            $scope.isDisable = true;
            fac.save(params,function(rst){
                $scope.isLoading = false;
                $scope.isDisable = false;
                if (rst.success) {
                    localStorage.setItem("isAddItem",$scope.isAddItem);
                    localStorage.setItem("clientip",$scope.currentIp);
                    only = {
                        id:rst.id,
                        created_by:rst.created_by,
                        created_at:rst.created_at
                    };
                    $scope.ipData = rows;

                    $scope.oldData = angular.copy($scope.ipData);
                    $scope.oldIsAddItem = angular.copy($scope.isAddItem);
                    $scope.oldCurrentIp = angular.copy($scope.currentIp);
                    oldOnly = angular.copy(only);
                }else{
                    $uibModal.open({
                        templateUrl : 'tpl/modelFailed.html',
                        size : 'sm',
                        controller : function($scope){
                            $scope.title = 'Failed alert';
                            $scope.content = 'Save failed';
                        }
                    });
                }
                console.log("return save:",only);
            });
        };
        $scope.reset = function(){
            $scope.ipData = angular.copy($scope.oldData);
            $scope.isAddItem = angular.copy($scope.oldIsAddItem);
            $scope.currentIp = angular.copy($scope.oldCurrentIp);
            only = angular.copy(oldOnly);
        };

    }]);
    app.factory('fb.checkout.checkoutFactory', ['$http',function($http){
        return {
            save:function(params,callback){
                $http({
                    method: 'POST',
                    url: '/saveCheckout',
                    data: params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            query:function(callback){
                $http({
                    method: 'POST',
                    data:{merchant:localStorage.getItem("merchant")},
                    url: '/getCheckout'
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            }
        };
    }]);
    app.run(function(editableOptions) {
        editableOptions.theme = 'bs3';
    });
	return app;
 }));