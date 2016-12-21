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
    var app = angular.module('fb.staff', ['ngTouch','xeditable','ngAnimate','ngSanitize','ui.bootstrap']);
    
    app.controller('fb.staff.staffController', ['$scope','$uibModal','fb.staff.staffFactory',function($scope,$uibModal,fac){
        $scope.isLoading = true;

        $scope.checkStaffName = function(data){
            if (data.trim()==='') {
                return 'Staff Name can not be empty!';
            }
            if (data.trim().length < 4) {
                return 'Staff ID at least 4 lengths!';
            }
            if (data.trim().length > 24) {
                return 'Staff ID up to 24 lengths!';
            }
            var reg = new RegExp(/^([a-zA-Z0-9]|[.\s]){3,23}$/);
            if (!reg.test(data.trim())) {
                return 'Please enter the letters or numbers!';
            }
            for (var i = $scope.staff.length - 1; i >= 0; i--) {
                if ($scope.staff[i].id !== '' && $scope.staff[i].name === data.trim()) {
                    return 'Staff Name can not be repeat!';
                }
            }
        };
        $scope.checkStaffID = function(data){
            if (data.trim()==='') {
                return 'Staff ID Name can not be empty!';
            }
            if (data.trim().length < 4) {
                return 'Staff ID at least 4 lengths!';
            }
            if (data.trim().length > 24) {
                return 'Staff ID up to 24 lengths!';
            }
            var reg = new RegExp(/^([a-zA-Z0-9]|[!@#$%^&*.,]){3,23}$/);
            if (!reg.test(data.trim())) {
                return 'Please enter the letters or numbers,allowing special symbols (*.,!@#$%^&)!';
            }
            for (var i = $scope.staff.length - 1; i >= 0; i--) {
                if ($scope.staff[i].id !== '' && $scope.staff[i].staff_id === data.trim()) {
                    return 'Staff ID can not be repeat!';
                }
            }
        };
        $scope.checkPasscode = function(data){
            if (data.trim()==='') {
                return 'Staff ID Name can not be empty!';
            }
            if (data.trim().length < 4) {
                return 'Staff ID at least 4 lengths!';
            }
            if (data.trim().length > 24) {
                return 'Staff ID up to 24 lengths!';
            }
            var reg = new RegExp(/^([a-zA-Z0-9]|[!@#$%^&*.,]){3,23}$/);
            if (!reg.test(data.trim())) {
                return 'Please enter the letters or numbers, allowing special symbols (*.,!@#$%^&)!';
            }
        };
        
        $scope.rowSave = function(row){
            $scope.isLoading = true;
            fac.saveStaff(row,function(rst){
                $scope.isLoading = false;
                if (rst.success) {
                    row.id = rst.id;
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
            });
        };
        $scope.rowAdd = function(){
            $scope.inserted = {id:'',name:'',staff_id:'',pin:'1234'};
            $scope.staff.push($scope.inserted);
        };
        $scope.rowDelete = function(row){
            fac.deleteStaff({id:row.id},function(rst){
                if (rst.success) {
                    $scope.staff.splice($scope.staff.indexOf(row),1);
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
        };
        $scope.rowCancel = function(row){
            if (row.id==='') {
                $scope.staff.splice($scope.staff.indexOf(row),1);
            }
        };
        fac.getStaff(function(rst){
            $scope.isLoading = false;
            $scope.staff = [];
            if (rst.success) {
                if (rst.results.length > 0) {
                    var staffs = [];
                    rst.results.forEach(function(dr){
                        staffs.push(dr.mposfb);
                    });
                    staffs.sort(function(a, b){
                        return new Date(b.modify_at.replace(/-/g, "/")) - new Date(a.modify_at.replace(/-/g, "/"));
                    });
                    $scope.staff = staffs;
                }
            }else{
                $uibModal.open({
                    templateUrl : 'tpl/modelFailed.html',
                    size : 'sm',
                    controller : function($scope){
                        $scope.title = 'Failed alert';
                        $scope.content = 'Failed to get data';
                    }
                });
            }
        });
    }]);
    app.factory('fb.staff.staffFactory', ['$http',function($http){
        return {
            getStaff:function(callback){
                $http({
                    method: 'POST',
                    url: '/getStaff',
                    data:{merchant:localStorage.getItem("merchant")}
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            saveStaff:function(params,callback){
                $http({
                    method: 'POST',
                    url: '/saveStaff',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            deleteStaff:function(params,callback){
                $http({
                    method: 'POST',
                    url: '/deleteStaff',
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