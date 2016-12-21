/*
* @author hudinghua
* @date   2016/07/25
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
    var app = angular.module('fb.scroll', []);

    app.directive('fbScroll',function(){
        return {
            restrict: 'EA',
            link: function(scope, ele, attr) {
                scope.scrollEl = ele;
                ele.mCustomScrollbar({
                    axis: "yx",
                    setTop:0,
                    setLeft:0,
                    alwaysShowScrollbar:0,
                    autoHideScrollbar:true,
                    scrollButtons: {
                        enable: true
                    },
                    theme: "minimal-dark",
                    contentTouchScroll:10,
                    scrollbarPosition: "inside",
                    callbacks:{
                        /** 当滚动条到达底部的时候触发加载事件 modifiy 2016-12-15 warrenli**/
                        onTotalScroll : function(){
                            /*if (!scope.isList) {
                               ele.mCustomScrollbar("scrollTo",['top','left'],{timeout:0});
                               console.log(555);
                            }*/
                            /** 添加刷新Menu数据事件，后续或可以用在其他地方  modifiy 2016-12-15 warrenli**/
                            scope.$parent.$broadcast("onRefreshEvent",this);
                        }
                    }
                });
            }
        };
    })/*.directive('fbxTimeScroll',function(){
        return {
            restrict: 'EA',
            link: function(scope, ele, attr) {
                scope.scrollEl = ele;
                ele.mCustomScrollbar({
                    axis: "x",
                    setTop:0,
                    setLeft:0,
                    alwaysShowScrollbar:0,
                    autoHideScrollbar:true,
                    scrollButtons: {
                        enable: true
                    },
                    advanced:{
                        updateOnContentResize: true,
                        updateOnImageLoad: true
                    },
                    theme: "minimal-dark",
                    scrollbarPosition: "inside",
                    callbacks:{
                        onInit: function(){ 
                            ele.mCustomScrollbar("update");
                        }
                    }
                });
            }
        };
    })*/.directive('fbxScroll',function(){
        return {
            restrict: 'EA',
            link: function(scope, ele, attr) {
                scope.scrollEl = ele;
                ele.mCustomScrollbar({
                    axis: "x",
                    setTop:0,
                    setLeft:0,
                    alwaysShowScrollbar:0,
                    autoHideScrollbar:true,
                    scrollButtons: {
                        enable: true
                    },
                    theme: "minimal-dark",
                    //contentTouchScroll:10,
                    scrollbarPosition: "inside"
                });
            }
        };
    }).directive('fbyScroll',function(){
        return {
            restrict: 'EA',
            link: function(scope, ele, attr) {
                scope.scrollEl = ele;
                ele.mCustomScrollbar({
                    axis: "y",
                    setTop:0,
                    setLeft:0,
                    alwaysShowScrollbar:0,
                    autoHideScrollbar:true,
                    scrollButtons: {
                        enable: true
                    },
                    theme: "minimal-dark",
                    contentTouchScroll:10,
                    scrollbarPosition: "outside"
                });
            }
        };
    });


    return app;
 }));