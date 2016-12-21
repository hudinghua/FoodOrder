/*
* @author hudinghua
* @date   2016/07/24
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
    var app = angular.module('fb.menu', []);
	app.controller('fb.menu.menuController', ['$scope','$state','$timeout','fb.menu.menuFactory',function($scope,$state,$timeout,fac){
        $scope.isMeunShow = false;
        $scope.saleTrigger = function(){
            $scope.isShowList = true;
            $scope.isMeunShow = false;
            $scope.isSelf = true;
            $scope.setingTheme = false;
            $('#tb-container').mCustomScrollbar("scrollTo",0);
        };
    	$scope.$on('triggerSidebar',function(event,evt){
            if (evt && evt.target.className==="icon icon-ic-menu-black") {
                $scope.isMeunShow = true;
            }else{
                $scope.isMeunShow = false;
            }
    	});
    	$scope.user = {
    		userName:localStorage.getItem("user"),
    		role:localStorage.getItem("role"),
    		isDef:true,
    		isShow:false,
    		logo:{}
    	};
        $scope.goRestaurant = function(){
            $state.go('app.settings.restaurant');
            $scope.isMeunShow = false;
            $timeout(function(){
                $scope.$$childTail.currentTabId = 1001;
            },500);
        };
        /*fac.getUserImg({id:localStorage.getItem("userid")},function(data){
            angular.extend($scope.user,{logo:data,isDef:false,isShow:true});
        });*/

        $scope.logout = function(){
            fac.logout(function(rst){
                window.location.href = location.protocol +'//'+ location.host +'/login.html';
            });
        };
    }]);
	app.factory('fb.menu.menuFactory', ['$http',function($http){

		return {
			getMenu:function(params,callback){
            	$http({
                    method: 'POST',
                    data:{merchant:localStorage.getItem("merchant")},
                    url: '/getUserInfo'
                }).success(function(data, header, config, status) {
                    if (data.success) {
                        return callback && callback(data);
                    }
                });
            },
            getUserImg:function(params,callback){
            	$http({
                    method: 'POST',
                    url: '/getAttachment',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            logout:function(callback){
                $http({
                    method: 'POST',
                    url: '/logout'
                }).success(function(data, header, config, status) {
                    if (data.success) {
                        return callback && callback(data);
                    }
                });
            }
		};
	}]);



    return app;
}));