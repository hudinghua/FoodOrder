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
    var app = angular.module('fb.floorplan', ['ngTouch','ngAnimate','ngSanitize','ui.bootstrap']);
    
    app.controller('fb.floorplan.floorplanController', ['$scope','$state','$uibModal','fb.floorplan.floorplanFactory',function($scope,$state,$uibModal,fac){
        //{tableNo:'M',byname:'M1',server:'test',seat:1,left:20,top:40,width:80,height:80,rotate:0,chairTpl:[{ctop:false,cright:false,cbottom:false,cleft:true}]}
        $scope.desks = [];
        $scope.isHasChange = false;//FloorPlan中數據是否有改變
        $scope.isLoading = true;
        fac.getPlan(function(rst){
            $scope.isLoading = false;
            if (rst.success) {
                if (rst.results.length > 0) {
                    var res = rst.results[0];
                    $scope.planId = res.id;
                    var zones = res.mposfb.designData[0].zones[0];
                    $scope.planSize = {
                        W:zones.width,
                        H:zones.height
                    };
                    $scope.oldZones = angular.copy(zones);
                    $scope.oldPlanSize = angular.copy($scope.planSize);
                    zones.tables.forEach(function(desk){
                        $scope.desks.push({
                            tableNo:desk.tableNo,
                            byname:desk.name,
                            server:desk.server,
                            seat:desk.guests,
                            left:desk.xposition,
                            top:desk.yposition,
                            width:desk.width,
                            height:desk.height,
                            rotate:desk.rotate,
                            tplId:desk.tplId,
                            chairTpl:desk.chairTpl
                        });
                    });
                }else{
                    $scope.planId = "";
                    $scope.oldZones = {
                        height:1800,
                        tables:[],
                        width:2000,
                        xposition:0,
                        yposition:0
                    };
                    $scope.planSize = { W:2000, H:1800 };
                    $scope.desks = [];
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
        var mouseTime = 0,mouseFlag = false;
        $scope.editDeskstart = function(){
            mouseTime = new Date().getTime();
            mouseFlag = true;
        };
        $scope.editDeskmove = function(){
            if (mouseFlag) {
                var mt = new Date().getTime() - mouseTime;
                if (mt >= 150) {
                    $scope.hidePlanEdit();
                }
            }
            
        };
        $scope.editDeskend = function(desk){
            var mt = new Date().getTime() - mouseTime;
            if (mt < 150) {
                $scope.editDesk(desk);
            }
            mouseTime = 0;
            mouseFlag = false;
            updatePosition(desk);
        };
        $scope.$on("unFloorplanTab",function(event,tab){
            hasChange($scope.oldZones,$scope.desks);
            var pscope = $scope.$parent;
            if(!$scope.isHasChange){
                pscope.currentTabId = tab.id;
                $state.go('app.settings.'+tab.nick);
                return false;
            }
            var model = $uibModal.open({
                templateUrl : 'tpl/modelIsSaveOrder.html',
                size : 'sm',
                controller:function($scope){
                    $scope.title = "Save Floorplan?";
                    $scope.save = function(){
                        model.close();
                        $state.go('app.settings.floorplan');
                    };
                    $scope.discard = function(){
                        model.dismiss('cancel');
                        pscope.currentTabId = tab.id;
                        $state.go('app.settings.'+tab.nick);
                    };
                    $scope.cancel = function(){
                        model.dismiss('cancel');
                    };
                }
            });
            model.result.then(function(){
                $scope.saveDesk();
            },function(){
                model.dismiss('cancel');
            });
        });

        function hasChange(oZ,desks){
            if (oZ) {
                var nZ = [],
                    oT = oZ.tables,
                    ds = angular.copy(desks);
                for(var i = 0,L = desks.length;i < L;i++){
                    if (ds[i].chairTpl.$$hashKey) {
                        delete ds[i].chairTpl.$$hashKey;
                    }
                    nZ.push({
                        "tableNo": ds[i].tableNo,
                        "name": ds[i].byname,
                        "guests": ds[i].seat,
                        "xposition": ds[i].left,
                        "yposition": ds[i].top,
                        "width": ds[i].width,
                        "height": ds[i].height,
                        "type": "table",
                        "rotate":ds[i].rotate,
                        "tplId":ds[i].tplId,
                        "server":ds[i].server,
                        "chairTpl":ds[i].chairTpl,
                    });
                }
                for (var i = nZ.length - 1; i >= 0; i--) {
                    for (var j = oT.length - 1; j >= 0; j--) {
                        if (oT[i].tableNo === nZ[j].tableNo) {
                            if((oT[i].xposition !== nZ[i].xposition) || (oT[i].yposition !== nZ[i].yposition)){
                                $scope.isHasChange = true;
                            }
                            break;
                        }
                    }
                    if ($scope.isHasChange) {
                        break;
                    }
                }
                if ($scope.oldPlanSize && $scope.planSize) {
                    if ($scope.oldPlanSize.W !== $scope.planSize.W || $scope.oldPlanSize.H !== $scope.planSize.H) {
                        $scope.isHasChange = true; 
                    }
                }
            }
        };

        $scope.saveDesk = function(){
            $scope.isLoading = true;
            hasChange($scope.oldZones,$scope.desks);
            if (!$scope.isHasChange) {
                $scope.isLoading = false;
                return false;
            }
            var saveParams = [];
            for(var i = 0,L = $scope.desks.length;i < L;i++){
                saveParams.push({
                    "tableNo": $scope.desks[i].tableNo,
                    "name": $scope.desks[i].byname,
                    "guests": $scope.desks[i].seat,
                    "xposition": $scope.desks[i].left,
                    "yposition": $scope.desks[i].top,
                    "width": $scope.desks[i].width,
                    "height": $scope.desks[i].height,
                    "type": "table",
                    "rotate":$scope.desks[i].rotate,
                    "tplId":$scope.desks[i].tplId,
                    "server":$scope.desks[i].server,
                    "chairTpl":$scope.desks[i].chairTpl,
                });
            }
            fac.savePlan({id:$scope.planId,desks:saveParams,size:$scope.planSize},function(rst){
                $scope.isLoading = false;
                if (rst.success) {
                    $scope.oldZones = angular.copy({
                        width:$scope.planSize.W,
                        height:$scope.planSize.H,
                        tables:saveParams,
                        xposition:0,
                        yposition:0
                    });
                    $scope.oldPlanSize = angular.copy({
                        W:$scope.planSize.W,
                        H:$scope.planSize.H
                    });
                    $scope.isHasChange = false;
                    $scope.planId = rst.id;
                    $uibModal.open({
                        templateUrl : 'tpl/modelSuccessful.html',
                        size : 'sm',
                        controller : function($scope){
                            $scope.title = 'Success alert';
                            $scope.content = 'Save successfully';
                        }
                    });
                    $scope.hidePlanEdit();
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
        $scope.editDesk = function(desk){
            $scope.isEdit = true;
            if (desk === '') {
                $scope.byname = '';
                desk = {};
            }else{
                $scope.byname = desk.byname;
            }
            $scope.$broadcast('selectDesk', desk);
        };
        $scope.hidePlanEdit = function(){
            $scope.isEdit = false;
            $scope.byname = '';
        };
        function updatePosition(desk){
            var fpEl = $(".hall"),
                deskEls = fpEl.find(".desk-panel");
            for(var i = 0,L = deskEls.length;i < L;i++){
                if(deskEls[i].dataset.table === desk.byname){
                    desk.top = 20*Math.round(deskEls[i].offsetTop/20);
                    desk.left = 20*Math.round(deskEls[i].offsetLeft/20);
                    break;
                }
            }
        };
    }]);
    app.factory('fb.floorplan.floorplanFactory', ['$http',function($http){
        return {
            getPlan:function(callback){
                $http({
                    method: 'POST',
                    url: '/getPlan',
                    data:{merchant:localStorage.getItem("merchant")}
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            savePlan:function(params,callback){
                $http({
                    method: 'POST',
                    url: '/savePlan',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            }
        };
    }]);
    app.directive('dragDesk', function() {
        return {
            restrict: 'A',
            link: function(scope, elem) {
                var dragNode = elem[0];
                if (dragNode) {
                    new Drag(dragNode,scope);
                }
            }
        };
    }).directive('bbposPlanEdit',[function(){
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            scope:{
                table:"@",
                hidePlanEdit:"&hidePlanEdit"
            },
            templateUrl:'tpl/settings/floorplan_edit.html',
            controller:'fb.floorplanedit.floorplaneditController',
            link: function(scope, el, attrs) {
                
            }
        };
    }]).directive('contenteditable', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                element.bind('keyup', function() {
                    scope.$apply(function() {
                        var html=element.html();
                        ctrl.$setViewValue(html);
                    });
                });
            }
        };
    });;
    
	return app;
 }));