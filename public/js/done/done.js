/*
* @author hudinghua
* @date   2016/08/011
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
    var app = angular.module('fb.done', ['ui.bootstrap']);
    /**
    * done logical control 
    */
    app.controller('fb.done.doneController', ['$scope','$state','$stateParams','$modal','fb.done.doneFactory',function($scope,$state,$stateParams,$modal,fac){
        console.log('done',$stateParams);//$rougeParams
        $scope.chargeParam = $stateParams.chargeParam;
        if (!$stateParams.chargeParam) {
            $state.go('app');
            return false;
        }
        var modalInstance = $modal.open({
            templateUrl : 'tpl/donedetail.html',
            size : 'lg-plus',
            controller : function($scope){
            	console.log('model',$scope);
                $scope.chargeParam = $stateParams.chargeParam;
                angular.extend($scope.chargeParam,{CustomerName:localStorage.getItem("username")});
            	$scope.backFloor = function(){
            		modalInstance.dismiss('cancel');
            		$state.go('app');
            	};
            }
        });
    }]);

    app.factory('fb.done.doneFactory', ['$http',function($http){
    	return {

    	};
    }]);
    return app;
 }));