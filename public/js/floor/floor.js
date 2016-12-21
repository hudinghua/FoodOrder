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
    var app = angular.module('fb.floor', ['ngTouch']);
    /**
     * FloorPlan logical control
     */
    app.controller('fb.floor.floorController', ['$scope','$rootScope','$state','$timeout','fb.floor.floorFactory','socketMg',function($scope,$rootScope,$state,$timeout,fac,socketMg){
        //default show <Floorplan View>
        $scope.isMeunShow = false;
        $scope.isShowList = true;
        $scope.isList = false;
        $scope.isSelf = true;
        $scope.slideMenu = function(){
            $scope.isMeunShow = true;
        };

        /***  socket 事件  start   modify 2016-09-29  warren.li ***/
        setTimeout(function () {
            socketMg.startFloor();
        },2000);

        $scope.$on("floorChange", function(event, data) {
            var layoutData = data.layoutData;
            var orderData = data.orderData;
            if(layoutData.success && orderData.success){
                layoutData = layoutData.results;
                orderData  = orderData.results;
                init($scope,layoutData,orderData);
                $scope.$apply();
                setTimeout(function () {
                    socketMg.startFloor();
                },1000);
            }
        });

        /***  socket 事件  end    ***/

        //<Floorplan View> and <List View> Mutual switching
        $scope.touchToggleList = function(){
            if($scope.isList){
                $scope.isList = false;
                $('#tb-container').mCustomScrollbar("scrollTo",0);
            }else{
                $scope.isList = true;
            }
        };
        //Trigger table transfer parameters
        $scope.touchZoneFold = function(event){
            $scope.$broadcast('triggerSidebar',event,$scope.desktops);
        };
        //Choose a table and animated slideInRight
        $scope.tableSelect = function(dt){
            if (dt==='') {
                //$scope.isOrderShow = true;
                $scope.$broadcast('triggerCreateTable',{},'add');
                return;
            }
            if (dt.status === 0) {
                $scope.$broadcast('triggerCreateTable',$scope.desktops,dt);
            }else if (dt.status === 1 || dt.status === 2) {
                $state.go('dish',{table:dt,abledt:$scope.desktops},{reload : true});
            }

        };

        //Render the table at the interface
        function doRefresh(){
            fac.getUserInfo(function(rst){
                if (rst && rst.success) {
                    fac.getTable(function(data){
                        var maxW = 0,maxH = 0,
                            fW = 0,fH = 0;
                        fac.getOrder(function(rst){
                            init($scope,data,rst);
                        });
                    });
                }else{
                    window.location.href = location.protocol +'//'+ location.host +'/login.html';
                }
            });
        }
        doRefresh();
        function init ($scope,tables,orders){
            var maxW = 0,maxH = 0,
                fW = 0,fH = 0;
            tables.map(function(tb){
                /*if(tb.width < 100){
                    tb.width += 20;
                }
                if(tb.height < 100){
                    tb.height += 20;
                }*/

                if (maxW < tb.xposition) {
                    maxW = tb.xposition;
                    fW = tb.width;
                }
                if (maxH < tb.yposition) {
                    maxH = tb.yposition;
                    fH = tb.height;
                }
                tb.style = {
                    'width':tb.width,
                    'height':tb.height,
                    'top':tb.yposition,
                    'left':tb.xposition,
                    'background-color':'#37474F'
                };
                angular.extend(tb,{
                    status:0,
                    customers:0,
                    number:''
                });
                orders.forEach(function(obj){
                    if (tb.tableNo === obj.mposfb.table) {
                        angular.extend(tb,{
                            customers:obj.mposfb.customers,
                            number:obj.mposfb.number,
                            order:obj
                        });
                        if (obj.mposfb.items_count > 0) {
                            tb.status = 1;//green
                            angular.extend(tb.style,{'background-color':'#009688'});
                        }else{
                            tb.status = 2;//yellow
                            angular.extend(tb.style,{'background-color':'#FFB300'});
                        }
                        return;
                    }
                });
                return tb;
            });
            var w = maxW + fW + 50,
                h = maxH + fH + 110;
            $scope.tableCfg = {
                width:w >= document.body.clientWidth?w:document.body.clientWidth,
                height:h >= (document.body.clientHeight-112)?h:(document.body.clientHeight-112)
            };
            $scope.desktops = tables;
            $scope.orderData = tables;
        };
        fac.querySeting(function(rst){
            if (rst.results.length > 0) {
                localStorage.setItem("isAddItem",angular.isDefined(rst.results[0].mposfb.isAddItem)?rst.results[0].mposfb.isAddItem:true);
                localStorage.setItem("clientip",rst.results[0].mposfb.currentIp);
            }else{
                localStorage.setItem("isAddItem",true);
                localStorage.setItem("clientip",'');
            }
        });

    }]);
    /**
     * Request a service and return an object
     */
    app.factory('fb.floor.floorFactory', ['$http',function($http){
        return {
            getUserInfo:function(callback){
                $http({
                    method: 'POST',
                    data:{merchant:localStorage.getItem("merchant")},
                    url: '/getUserInfo'
                }).success(function(data, header, config, status) {
                    return callback && callback(data);
                }).error(function(data,header,config,status){
                    return callback && callback(data);
                });
            },
            getTable:function(callback){
                $http({
                    method: 'POST',
                    data:{merchant:localStorage.getItem("merchant")},
                    url: '/getLayout'
                }).success(function(data, header, config, status) {
                    if (data.success) {
                        return callback && callback(data.results);
                    }
                });
            },
            querySeting:function(callback){
                $http({
                    method: 'POST',
                    data:{merchant:localStorage.getItem("merchant")},
                    url: '/getCheckout'
                }).success(function(data, header, config, status) {
                    if (data.success) {
                        return callback && callback(data);
                    }
                });
            },
            getOrder:function(callback){
                /*$http({
                 method: 'GET',
                 url: '/order.json'
                 }).success(function(data, header, config, status) {
                 if (data.success) {
                 return callback && callback(data.results);
                 }
                 });
                 return;*/
                $http({
                    method: 'POST',
                    data:{merchant:localStorage.getItem("merchant")},
                    url: '/queryOrder'
                }).success(function(data, header, config, status) {
                    if (data.success) {
                        return callback && callback(data.results);
                    }
                });
            }
        };
    }]);
    /**
     * a collection of UI components
     */
    app.directive('bbposMenu',[function(){
            return {
                restrict: "EA",
                replace: true,
                transclude: true,
                templateUrl:'tpl/menu.html',
                controller:'fb.menu.menuController',
                link: function(scope, el, attrs) {

                }
            };
        }])
        .directive('bbposAddorder',[function(){
            return {
                restrict: "EA",
                replace: true,
                transclude: true,
                templateUrl:'tpl/openorder.html',
                controller:'fb.addorder.addorderController',
                link: function(scope, el, attrs) {

                }
            };
        }])
        .directive('tablePanel',function(){
            return {
                restrict: "EA",
                replace: true,
                transclude: true,
                templateUrl:'floor/table.html',
                controller:function($scope, $element){

                },
                link: function(scope, el, attrs) {
                    
                }
            };
        })
        .directive('toaster',function(){
            return {
                restrict: "EA",
                replace: true,
                transclude: true,
                scope:{"isSlide":"="},
                template:'<div class="toaster-bottom" ng-class={"toaster-slide":isSlide}>Table occupied.</div>',
                controller:function($scope, $element){

                },
                link: function(scope, el, attrs,$timeout) {
                    scope.isSlide = false;
                    scope.$watch('isSlide', function(newValue, oldValue, scope) {
                        if(newValue != oldValue){
                            setTimeout(function(){
                                scope.$apply(function(){
                                    scope.isSlide = false;
                                });
                            },2500);
                        }
                    }, false);
                    
                }
            };
        });

    app.filter("tableStyle",function(){
        return function(style){
            style = {color:style["background-color"]};
            return style;
        };
    }).filter("tableMark",function(){
        return function(mark){
            if (mark === '') {
                mark = 'No order';
            }
            return mark;
        };
    }).filter("timeAmPm",function(){
        return function(time){
            time = new Date(time);
            return time;
        };
    });

    app.run(["$templateCache", function($templateCache) {
        $templateCache.put('floor/table.html',
            ['<div class="desktop">',
                '<section class="tbwrap">',
                    '<span class="title">{{dt.name}}</span>',
                    '<div class="tbp">',
                        '<i class="icon-ic-people-black iconstyle"></i>&nbsp;&nbsp;<span class="people">{{dt.customers}}/{{dt.guests}}</span>',
                    '</div>',
                    '<div class="tbp"><i class="icon-ic-receipt-black iconstyle"></i>&nbsp;&nbsp;<span class="people">#{{dt.number}}</span></div>',
                '</section>',
            '</div>'].join(''));
    }]);

    return app;
}));