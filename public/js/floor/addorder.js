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
    var app = angular.module('fb.addorder', []);
    /**
    * FloorPlan logical control 
    */
    app.controller('fb.addorder.addorderController', ['$scope','$state','$timeout','fb.addorder.addorderFactory',function($scope,$state,$timeout,fac){
        //default show addorder module
    	$scope.$on('triggerSidebar',function(event,evt,desks){
            if (evt && evt.target.className==="addcover") {
                $scope.currentTable = {tableNo:''};
                $scope.guest = '';
                $scope.server.selected = '';
                $scope.tableItems = desks;
                return;
            }
            if (evt && evt.target.className==="dtcover") {
                return;
            }
    		$scope.isOrderShow = false;
    	});
        $scope.isOrderShow = false;
        //$scope.createOrderId = fac.generateMixed(6);
        $scope.currentTable = {tableNo:''};
        $scope.userName = localStorage.getItem("username");
        $scope.$on('triggerCreateTable',function(event,desks,dt){
            if (!$scope.isOrderShow) {
                $scope.createOrderId = fac.generateMixed(6);
                if($.isArray($scope.orderData)) {
                    $scope.orderData.forEach(function(nO){
                        if (nO.number === $scope.createOrderId) {
                            $scope.createOrderId = fac.generateMixed(6);
                        }
                    });
                }
            }
            $scope.isOrderShow = true;
            if (dt === 'add') {
                return;
            }
            $scope.tableItems = desks;
            if (angular.isDefined(dt)) {
                $scope.currentTable = dt;
                $scope.tableChange(dt);
                $scope.server.selected = dt.server;
            }
        });
        $scope.tableChange = function(tb){
            var guests = [];
            for (var i = 1,l = tb.guests; i <= l; i++) {
                guests.push(i);
            }
            $scope.maxGuest = tb.guests;
            $scope.guests = guests;
        };
        $scope.server = {
            options: [],
            selected: ''
        };
        fac.getStaff(function(rst){
            if (rst.success) {
                if (rst.results.length > 0) {
                    for (var i = rst.results.length - 1; i >= 0; i--) {
                        $scope.server.options.push(rst.results[i].mposfb.name);
                    }
                }
            }
        });

        $scope.createbtn = {
            text:"OPEN",
            isCreate:false
        };
        $scope.createOrder = function(){
            if (!angular.isDefined($scope.currentTable.tableNo) || $scope.currentTable.tableNo==='') {
                $('#forInputTable').popover('show');
                return;
            }
            if (!angular.isDefined($scope.guest) || $scope.guest===null || $scope.guest==='') {
                $('#forInputGuest').popover('show');
                return;
            }
            $scope.createbtn = {
                text:"Open...",
                isCreate:true
            };

            var emptyData = {
                customers:$scope.guest,
                guests:$scope.maxGuest,
                number:$scope.createOrderId,
                status:0,
                isopen:true,
                order:{
                    id:'',
                    mposfb:{
                        merchant:localStorage.getItem("merchant"),
                        amount:0,
                        customers:$scope.guest,
                        dishes:0,
                        is_payment:false,
                        items:[],
                        items_count:0,
                        number:$scope.createOrderId,
                        table:$scope.currentTable.tableNo,
                        note:$scope.note,
                        server:$scope.server.selected
                    },
                    tableNo:$scope.currentTable.tableNo
                }
            };
            fac.saveOrder({params:JSON.stringify(emptyData.order)},function(rst){
                $scope.createbtn = {
                    text:"OPEN",
                    isCreate:false
                };
                angular.forEach($scope.desktops, function(dt){
                    if (dt.name === $scope.currentTable.tableNo) {
                        dt.style["background-color"] = "#ffb300";
                        dt.status = 2;
                        dt.number = $scope.createOrderId;
                        emptyData.order.id = rst.id;
                        dt.order = emptyData.order;
                        dt.customers = $scope.guest;
                    }
                }); 
                $scope.isOrderShow = false;
                $scope.guest = '';
                $scope.isSlide = true;
            });
            if(localStorage.getItem("isAddItem")==="true"){
                fac.startOrder({id:$scope.createOrderId});
            }
            
        };

        $scope.touchStartOrder = function(){
            if(event.target.tagName.toLowerCase()!=="input"){
                $(".btn-bg").focus();
            }
        }
    }]);
    /**
    * Request a service and return an object
    */
    app.factory('fb.addorder.addorderFactory', ['$http',function($http){
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
            startOrder:function(params,callback){
                if(localStorage.getItem("clientip")){
                    var url = "http://" + localStorage.getItem("clientip") + ":8080/pos?Action=StartOrder&Format=Json&Order=" + params.id;
                    $http.get(url).success(function(data){
                        if (data.Status === "Success") {
                            return callback && callback(data);
                        }
                    });
                }
            },
            saveOrder:function(params,callback){
                $http({
                    method: 'POST',
                    url: '/saveOrder',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data.success) {
                        return callback && callback(data);
                    }
                });
            },
            generateMixed:function(n){
                var res = [],
                    chars = ['0','1','2','3','4','5','6','7','8','9'];
                for(var i = 0; i < n ; i ++) {
                    var id = Math.ceil(Math.random()*9);
                    res.push(chars[id]);
                }
                return res.join("");
            }
        };
    }]);

    app.filter("unTable",function(){
        return function(tb){
            var _tb = [];
            if (tb) {
                tb.forEach(function(otb){
                    if (otb.status === 0) {
                        _tb.push(otb);
                    }
                });
            }
            return _tb;
        };
    });

    return app;
 }));