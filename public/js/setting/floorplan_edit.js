/*
* @author hudinghua
* @date   2016/11/02
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
    var app = angular.module('fb.floorplanedit', ['ngTouch','ngAnimate','ngSanitize','ui.bootstrap']);

    app.controller('fb.floorplanedit.floorplaneditController', ['$scope','$uibModal','$timeout','fb.floorplanedit.floorplaneditFactory',function($scope,$uibModal,$timeout,fac){
        var wh = 100;
        $scope.server = {
            options: [],
            selected: ''
        };
        fac.getStaff(function(rst){
            $scope.isLoading = false;
            $scope.staff = [];
            if (rst.success) {
                if (rst.results.length > 0) {
                    for (var i = rst.results.length - 1; i >= 0; i--) {
                        $scope.server.options.push(rst.results[i].mposfb.name);
                    }
                }
            }
        });
        $scope.serverChange = function(c){
            $scope.isServer = true;
        };

        $scope.seat = {
            options: [1,2,3,4,5,6,7,8],
            selected: 1
        };
        //Table type 下拉选择桌椅类型
        $scope.seatChange = function(c){
            $scope.isTplLoading = true;
            $scope.isSeat = true;
            //$scope.deskTpl 渲染选中类型的桌椅模板
            $scope.deskTpl = deskTemplates.filter(function(tpl){
                return tpl.seatType === c;
            });
            $scope.currentDeskTpl = {};
            $scope.optionDeskTpl = {};
            $timeout(function(){
                var tplWrap = $("#desk-templates-id");
                tplWrap.find("ul").parent().width(tplWrap.find("ul").width());
                tplWrap.mCustomScrollbar("update");
                tplWrap.mCustomScrollbar("update");
                $scope.isTplLoading = false;
            },500);
        };
        //旋转选中的桌椅模板
        $scope.rotate = function(){
            if ($.isEmptyObject($scope.optionDeskTpl)) {
                $scope.popoverDk = {
                    tpl:'Please select a table and chair of the template!',
                    isOpen:true
                };
                return false;
            }
            $scope.optionDeskTpl.rotate += 90;
            if ($scope.optionDeskTpl.rotate === 360) {
                $scope.optionDeskTpl.rotate = 0;
            }
            var style = $scope.currentDeskTpl.style,
                chairs = $scope.optionDeskTpl.chairTpl;
            switch($scope.optionDeskTpl.rotate) {
                case 0:
                    $scope.optionDeskTpl = angular.copy($scope.currentDeskTpl);
                    break;
                case 90:
                    $scope.optionDeskTpl.style = {
                        floatCss:{"float":"none"},
                        selectedCss:{
                            width: style.selectedCss.height,
                            height: style.selectedCss.width
                        }
                    };
                    break;
                case 180:
                    $scope.optionDeskTpl.style = {
                        floatCss: {"float":"left"},
                        selectedCss:{
                            width: style.selectedCss.width,
                            height: style.selectedCss.height
                        }
                    };
                    chairs.reverse();
                    break;
                case 270:
                    $scope.optionDeskTpl.style = {
                        floatCss: {"float":"none"},
                        selectedCss:{
                            width: style.selectedCss.height,
                            height: style.selectedCss.width
                        }
                    };
                    break;
            }

            for(var i = 0,L = chairs.length;i < L;i++){
                var chair = angular.copy(chairs[i]);
                if (chair["ctop"]) {
                    chairs[i]["cright"] = true;
                }else{
                    chairs[i]["cright"] = false;
                }
                if (chair["cright"]) {
                    chairs[i]["cbottom"] = true;
                }else{
                    chairs[i]["cbottom"] = false;
                }
                if (chair["cbottom"]) {
                    chairs[i]["cleft"] = true;
                }else{
                    chairs[i]["cleft"] = false;
                }
                if (chair["cleft"]) {
                    chairs[i]["ctop"] = true;
                }else{
                    chairs[i]["ctop"] = false;
                }
            }
        };
        //相对应 Table type 的模板，选择其中一个模板
        $scope.selectDeskTpl = function(dt){
            $scope.currentDeskTpl = angular.copy(dt);//独立一份选中的模板数据(与$scope.optionDeskTpl做数据对比)
            $scope.currentDeskTpl.rotate = 0;
            $scope.currentDeskTpl.style = {
                floatCss:{"float":"left"},
                selectedCss:{
                    "width": $scope.currentDeskTpl.chairTpl.length*wh + "px",
                    "height": wh+"px"
                }
            };
            $scope.optionDeskTpl = angular.copy($scope.currentDeskTpl);//独立一份当前操作的模板数据
        };

        $scope.$on("selectDesk",function(event,desk){
            $scope.currentDesk = desk;
            $scope.desk = angular.copy(desk);
            if (!$.isEmptyObject(desk)) {
                $scope.title = "Edit table";
                $scope.server.selected = $scope.desk.server;
                $scope.seat.selected = $scope.desk.seat;
                $scope.isServer = true;
                $scope.isSeat = true;
            }else{
                $scope.title = "New table";
                $scope.server.selected = '';
                $scope.seat.selected = '';
                $scope.isServer = false;
                $scope.seat.selected = 1;
                $scope.isSeat = true;
                angular.extend($scope.desk,{
                    left:0,
                    top:0,
                    tableNo:'',
                    byname:'',
                    tplId:''
                });
            }
            $scope.popoverTn = {
                isOpen:false
            };
            $scope.popoverDk = {
                isOpen:false
            };
            $scope.seatChange($scope.seat.selected);
            if ($scope.desk.tplId === '') {
                $scope.optionDeskTpl = {};
            }else{
                $scope.deskTpl.forEach(function(d){
                    if (d.tplId === $scope.desk.tplId) {
                        $scope.selectDeskTpl(d);
                        if ($scope.desk.rotate) {
                            var i = 0,l = $scope.desk.rotate/90;
                            while(i < l){
                                $scope.rotate();
                                i++;
                            }
                        }
                    }
                });
            }
        });

        $scope.save = function(){
            var isValid = true , editIdx = -1;
            var pscope = $scope.$parent,
                oscope = $scope.optionDeskTpl,
                saveParams = [];

            if (!$scope.desk.byname || $scope.desk.byname.trim() === '') {
                $scope.popoverTn = {
                    tpl:'Table number cannot be empty!',
                    isOpen:true
                };
                isValid = false;
            }
            for (var i = pscope.desks.length - 1; i >= 0; i--) {
                if ($scope.currentDesk.byname && pscope.desks[i].byname == $scope.currentDesk.byname) {
                    continue;
                }
                if(pscope.desks[i].byname == $scope.desk.byname){
                    $scope.popoverTn = {
                        tpl:'Table number already exists!',
                        isOpen:true
                    };
                    isValid = false;
                    break;
                }
            }
            if ($.isEmptyObject($scope.optionDeskTpl)) {
                $scope.popoverDk = {
                    tpl:'Please select a table and chair of the template!',
                    isOpen:true
                };
                isValid = false;
            }
            if (!isValid) { return false; }

            pscope.isLoading = true;
            var desk = {
                tableNo:$scope.desk.byname,
                byname:$scope.desk.byname,
                server:$scope.server.selected,
                seat:$scope.seat.selected,
                left:$scope.desk.left,
                top:$scope.desk.top,
                width:parseInt(oscope.style.selectedCss.width.replace(/[^0-9]/ig,"")),
                height:parseInt(oscope.style.selectedCss.height.replace(/[^0-9]/ig,"")),
                rotate:oscope.rotate,
                tplId:oscope.tplId,
                chairTpl:oscope.chairTpl
            };


            var pdesks = angular.copy(pscope.desks)
            if ($scope.title === "New table") {
                pdesks.push(angular.copy(desk));
            }
            for(var i = 0,L = pdesks.length;i < L;i++){
                if($scope.title !== "New table" && pdesks[i].tableNo === $scope.currentDesk.tableNo){
                    editIdx = i;
                    pdesks[i] = desk;
                }
                saveParams.push({
                    "tableNo": pdesks[i].tableNo,
                    "name": pdesks[i].byname,
                    "guests": pdesks[i].seat,
                    "xposition": pdesks[i].left,
                    "yposition": pdesks[i].top,
                    "width": pdesks[i].width,
                    "height": pdesks[i].height,
                    "type": "table",
                    "rotate":pdesks[i].rotate,
                    "tplId":pdesks[i].tplId,
                    "server":pdesks[i].server,
                    "chairTpl":pdesks[i].chairTpl,
                });
            }
            fac.savePlan({id:pscope.planId,desks:saveParams,size:pscope.planSize},function(rst){
                pscope.isLoading = false;
                if (rst.success) {
                    pscope.oldZones = angular.copy({
                        width:pscope.planSize.W,
                        height:pscope.planSize.H,
                        tables:saveParams,
                        xposition:0,
                        yposition:0
                    });
                    pscope.oldPlanSize = angular.copy({
                        W:pscope.planSize.W,
                        H:pscope.planSize.H
                    });
                    pscope.isHasChange = false;
                    pscope.planId = rst.id;
                    if ($scope.title === "New table") {
                        pscope.desks.push(desk);
                    }else{
                        if (editIdx >= 0) {
                            pscope.desks[editIdx] = pdesks[editIdx];
                        }
                    }
                    
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
        $scope.delete = function(){
            var pscope = $scope.$parent,
                delIdx = -1,saveParams = [];

            for (var i = pscope.desks.length - 1; i >= 0; i--) {
                if (pscope.desks[i].byname === $scope.currentDesk.byname) {
                    delIdx = i;
                    continue;
                }
                saveParams.push({
                    "tableNo": pscope.desks[i].tableNo,
                    "name": pscope.desks[i].byname,
                    "guests": pscope.desks[i].seat,
                    "xposition": pscope.desks[i].left,
                    "yposition": pscope.desks[i].top,
                    "width": pscope.desks[i].width,
                    "height": pscope.desks[i].height,
                    "type": "table",
                    "rotate":pscope.desks[i].rotate,
                    "tplId":pscope.desks[i].tplId,
                    "server":pscope.desks[i].server,
                    "chairTpl":pscope.desks[i].chairTpl,
                });
            }
            pscope.isLoading = true;
            fac.savePlan({id:pscope.planId,desks:saveParams,size:pscope.planSize},function(rst){
                pscope.isLoading = false;
                if (rst.success) {
                    pscope.planId = rst.id;
                    pscope.oldZones.tables.splice(delIdx,1);
                    pscope.desks.splice(delIdx,1);
                    pscope.isHasChange = false;
                    $scope.hidePlanEdit();
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
            //$scope.currentDesk
        };

        var deskTemplates = [
            {tplId:'t001',byname:'M',seatType:1,chairTpl:[{ctop:false,cright:false,cbottom:false,cleft:true}]},
            {tplId:'t002',byname:'M',seatType:2,chairTpl:[{ctop:true,cright:false,cbottom:false,cleft:true}]},
            {tplId:'t003',byname:'M',seatType:2,chairTpl:[{ctop:true,cright:false,cbottom:true,cleft:false}]},
            {tplId:'t004',byname:'M',seatType:3,chairTpl:[{ctop:true,cright:false,cbottom:true,cleft:true}]},
            {tplId:'t005',byname:'M',seatType:4,chairTpl:[{ctop:true,cright:true,cbottom:true,cleft:true}]},
            {tplId:'t006',byname:'M',seatType:4,chairTpl:[{ctop:true,cright:false,cbottom:true,cleft:false},{ctop:true,cright:false,cbottom:true,cleft:false}]},
            {tplId:'t007',byname:'M',seatType:5,chairTpl:[{ctop:true,cright:false,cbottom:true,cleft:true},{ctop:true,cright:false,cbottom:true,cleft:false}]},
            {tplId:'t008',byname:'M',seatType:6,chairTpl:[{ctop:true,cright:false,cbottom:true,cleft:true},{ctop:true,cright:true,cbottom:true,cleft:false}]},
            {tplId:'t009',byname:'M',seatType:6,chairTpl:[{ctop:true,cright:false,cbottom:true,cleft:false},{ctop:true,cright:false,cbottom:true,cleft:false},{ctop:true,cright:false,cbottom:true,cleft:false}]},
            {tplId:'t010',byname:'M',seatType:7,chairTpl:[{ctop:true,cright:false,cbottom:true,cleft:true},{ctop:true,cright:false,cbottom:true,cleft:false},{ctop:true,cright:false,cbottom:true,cleft:false}]},
            {tplId:'t011',byname:'M',seatType:8,chairTpl:[{ctop:true,cright:false,cbottom:true,cleft:true},{ctop:true,cright:false,cbottom:true,cleft:false},{ctop:true,cright:true,cbottom:true,cleft:false}]},
            {tplId:'t012',byname:'M',seatType:8,chairTpl:[{ctop:true,cright:false,cbottom:true,cleft:false},{ctop:true,cright:false,cbottom:true,cleft:false},{ctop:true,cright:false,cbottom:true,cleft:false},{ctop:true,cright:false,cbottom:true,cleft:false}]}
        ];
        
    }]);
    app.factory('fb.floorplanedit.floorplaneditFactory', ['$http',function($http){
        return {
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
            },
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
            }
        };
    }]);
    
    return app;
 }));