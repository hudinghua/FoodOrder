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
    var app = angular.module('fb.setting', ['ngTouch','ui.bootstrap','xeditable']);
    
    app.controller('fb.setting.settingController', ['$scope','$state','$stateParams','$timeout',function($scope,$state,$stateParams,$timeout){
        $scope.$parent.isShowList = false;
        $scope.$parent.isMeunShow = false;
        $scope.$parent.isSelf = true;
        $scope.$parent.setingTheme = true;
        
        var hash = location.hash;
        $scope.tabs = [{id:1001,name:'Restaurant',nick:'restaurant'},
                        {id:1002,name:'Staff',nick:'staff'},
                        {id:1003,name:'Floorplan',nick:'floorplan'},
                        {id:1004,name:'Menu',nick:'menu'},
                        {id:1005,name:'Receipt',nick:'receipt'},
                        {id:1006,name:'Checkout',nick:'checkout'}];

        $scope.triggerTab = function(tab){
            if ($scope.currentTabId === 1003) {
                $scope.$broadcast("unFloorplanTab",tab);
            }else{
                $scope.currentTabId = tab.id;
                $state.go('app.settings.'+tab.nick);
            }
        };
        $scope.isActive = function(tabid){
            return tabid === $scope.currentTabId;
        };
        if (hash === "#/app" || hash === '#/app/settings') {
            $scope.triggerTab({id:1001,name:'Restaurant',nick:'restaurant'});
            $state.go('app.settings.restaurant');
        }
        $scope.tabs.forEach(function(router){
            if (hash === '#/dish/' || hash === '#/dish') {
                if ($stateParams && $stateParams.jump && $stateParams.jump === "checkout") {
                    $scope.triggerTab({id:1006,name:'Checkout',nick:'checkout'});
                    return;
                }
                $scope.triggerTab({id:1001,name:'Restaurant',nick:'restaurant'});
                return;
            }
            if (hash === '#/app/history/' || hash === '#/app/history') {
                $scope.triggerTab({id:1001,name:'Restaurant',nick:'restaurant'});
                return;
            }
            if (hash === '#/app/settings/'+router.nick) {
                $scope.triggerTab(router);
            }
        });
        
    }]);
	return app;
 }));