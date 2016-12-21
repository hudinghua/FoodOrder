'use strict';

var fbApp = angular.module('fbApp',['ui.utils','ui.router','oc.lazyLoad'])
    .config(['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
        function($controllerProvider,   $compileProvider,   $filterProvider,   $provide){
            fbApp.controller = $controllerProvider.register;
            fbApp.directive  = $compileProvider.directive;
            fbApp.filter     = $filterProvider.register;
            fbApp.factory    = $provide.factory;
            fbApp.service    = $provide.service;
            fbApp.constant   = $provide.constant;
            fbApp.value      = $provide.value;
        }
    ]);
fbApp.service('socketMg',['$rootScope','$http',function($rootScope,$http){
    $http.get('/config.json').success(function (config) {
        var socket = io.connect('http://'+config.socketIP+':'+config.socketPort);

        this.startFloor = function(){
            socket.emit('floor',{bucket : localStorage.getItem("merchant")});
        };

        this.startDish = function(id){
            socket.emit('dish',{id : id,bucket : localStorage.getItem("merchant")});
        };

        socket.on('floor', function (data) {
            $rootScope.$broadcast("floorChange", data);
        });

        socket.on('dish', function (data) {
            $rootScope.$broadcast("dishChange", data);
        });
    }.bind(this));
}]);

angular.module("ngTouch", [])
    .directive("ngTouchstart", function () {
        return {
            controller: function ($scope, $element, $attrs) {
                $element.bind('touchstart', onTouchStart);

                function onTouchStart(event) {
                    var method = $element.attr('ng-touchstart');
                    $scope.$event = event;
                    $scope.$apply(method);
                };
            }
        };
    }).directive("ngTouchmove", function () {
    return {
        controller: function ($scope, $element, $attrs) {
            $element.bind('touchstart', onTouchStart);

            function onTouchStart(event) {
                event.preventDefault();
                $element.bind('touchmove', onTouchMove);
                $element.bind('touchend', onTouchEnd);
            };

            function onTouchMove(event) {
                var method = $element.attr('ng-touchmove');
                $scope.$event = event;
                $scope.$apply(method);
            };

            function onTouchEnd(event) {
                event.preventDefault();
                $element.unbind('touchmove', onTouchMove);
                $element.unbind('touchend', onTouchEnd);
            };
        }
    };
}).directive("ngTouchend", function () {
    return {
        controller: function ($scope, $element, $attrs) {
            $element.bind('touchend', onTouchEnd);

            function onTouchEnd(event) {
                var method = $element.attr('ng-touchend');
                $scope.$event = event;
                $scope.$apply(method);
            };
        }
    };
}).directive("inertiaScroll",function(){
    return {
        restrict: "EA",
        scope: {},
        link: function(scope, ele, attrs) {
            var el = ele[0],
                elParentWidth = el.parentNode.offsetWidth,
                elWidth, maxRightLeft;
            var currentX, startX, moveX, endX, startTime, endTime;
            var speedDecay = 0.02;
            var lastMoveTime, secondLastMoveTime;
            var stopMoveInterval;
            var stopInertiaMove = false;


            el.addEventListener("touchstart",function(e){
                stopInertiaMove = true;
                currentX = el.offsetLeft;
                startX = e.touches[0].pageX;
                elWidth = el.offsetWidth;
                maxRightLeft = elParentWidth - elWidth;
                startTime = Date.now();
            });
            el.addEventListener("touchmove",function(e){
                moveX = e.touches[0].pageX;
                secondLastMoveTime = lastMoveTime;
                var cX = currentX + moveX - startX;
                if (cX <= 0 && cX >= maxRightLeft-0) {
                    el.style.left = cX + "px";
                }
                lastMoveTime = Date.now();
            });
            el.addEventListener("touchend",function(e){
                endX = e.changedTouches[0].pageX;
                endTime = Date.now();
                if (secondLastMoveTime) {
                    stopMoveInterval = endTime - secondLastMoveTime;
                } else {
                    stopMoveInterval = endTime - lastMoveTime;
                }
                currentX = currentX + (endX - startX);
                var speed = (endX - startX) / (endTime - startTime);
                var speedAbs = Math.abs(speed);
                function inertiaMove() {
                    if (speedAbs < 0 || stopInertiaMove) {
                        /*if (currentX >= 0) {
                         el.style.left = currentX + "px";
                         currentX = currentX - 1;
                         }*/
                        return;
                    }
                    var distance = speedAbs * 20;
                    if (speed < 0) {
                        currentX -= distance;
                    }else{
                        currentX += distance;
                    }
                    if (currentX <= 0 && currentX >= maxRightLeft-0) {
                        el.style.left = currentX + "px";
                    }
                    speedAbs -= speedDecay;
                    setTimeout(inertiaMove, 50);
                }
                if (stopMoveInterval < 100) {
                    stopInertiaMove = false;
                    inertiaMove();
                }
            });
        }
    };
});














