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
    var app = angular.module('fb.menusetting', ['ngTouch','ngAnimate','ngSanitize','ui.bootstrap']);
    
    app.controller('fb.menusetting.menusettingController', ['$scope','$state','fb.menusetting.menusettingFactory',function($scope,$state,fac){
        $scope.isLoading = true;
        /** Item category modifier 列表绑定的数据源**/
        $scope.items = [];$scope.categorys = [];$scope.modifiers = [];
        
        /** 所有的Item **/
        fac.queryAllItem({
            merchant : localStorage.getItem("merchant")
        },function(returnObj){
            $scope.allItem = returnObj.results;
        });
        
        /**
         * 查询所有的category类型
         */
        fac.queryAllCategory({
            merchant : localStorage.getItem("merchant")
        },function(returnObj){
            $scope.itemCategory = returnObj.results;
            if($scope.itemCategory.length>0)
                fac.itemConcatCategory($scope.items,$scope.itemCategory);
        });

        /**
         * 查询Item数据
         * **/
        $scope.initQueryItem = function(start,limit){
            $scope.isLoading = true;
            fac.queryItem({
                merchant : localStorage.getItem("merchant"),
                start : start || 0,
                limit : limit || 20
            },function(returnObj){
                $scope.isLoading = false;
                $scope.page.start = returnObj.start;
                $scope.page.total = returnObj.count;
                $scope.page.end = returnObj.start+returnObj.count;
                $scope.page.pageSize = returnObj.limit;
                $scope.page.currentPage = $scope.page.start / $scope.page.pageSize + 1;
                for (var i = returnObj.results.length - 1; i >= 0; i--) {
                    returnObj.results[i].name = returnObj.results[i].mposfb.name;
                }
                $scope.items = $scope.items.concat(returnObj.results);
                if($scope.items.length>0)
                    fac.itemConcatCategory($scope.items,$scope.itemCategory);
            });
        };
        $scope.initQueryItem();

        /**
         * 查询Category数据列表
         **/
        $scope.initCategory = function(start,limit){
            $scope.isLoading = true;
            fac.queryCategory({
                merchant : localStorage.getItem("merchant"),
                start : start || 0,
                limit : limit || 20
            },function(returnObj){
                $scope.isLoading = false;
                $scope.pageCategory.start = returnObj.start;
                $scope.pageCategory.total = returnObj.count;
                $scope.pageCategory.end = returnObj.start+returnObj.count;
                $scope.pageCategory.pageSize = returnObj.limit;
                $scope.pageCategory.currentPage = $scope.pageCategory.start / $scope.pageCategory.pageSize + 1;
                $scope.categorys = $scope.categorys.concat(returnObj.results);
                fac.queryAllItem({
                    merchant : localStorage.getItem("merchant")
                },function(returnObj){
                    $scope.allItem = returnObj.results;
                    fac.categoryConcatItem($scope.categorys,$scope.allItem);
                });
            });
        };

        /**
         * 查询Modifier数据列表
         */
        $scope.initModifier = function(start,limit){
            $scope.isLoading = true;
            fac.queryModifier({
                merchant : localStorage.getItem("merchant"),
                start : start || 0,
                limit : limit || 20
            },function(returnObj){
                $scope.isLoading = false;
                $scope.pageModify.start = returnObj.start;
                $scope.pageModify.total = returnObj.count;
                $scope.pageModify.end = returnObj.start+returnObj.count;
                $scope.pageModify.pageSize = returnObj.limit;
                $scope.pageModify.currentPage = $scope.pageModify.start / $scope.pageModify.pageSize + 1;
                $scope.modifiers = $scope.modifiers.concat(returnObj.results);
                fac.queryAllItem({
                    merchant : localStorage.getItem("merchant")
                },function(returnObj){
                    $scope.allItem = returnObj.results;
                    fac.modifierConcatItem($scope.modifiers,$scope.allItem);
                });
            });
        };

        $scope.placement = {
            options: [
               'Item',
               'Category',
               'Modifier Group'
            ],
            selected: 'Item'
        };
        $scope.btnText = "ADD ITEM";
        $scope.menuChane = function(sel){
            $scope.hideMenuEdit();
            switch(sel){
                case "Item":
                    $scope.btnText = "ADD ITEM";
                    $scope.initQueryItem($scope.page.start,$scope.page.pageSize);
                    break;
                case "Category":
                    $scope.btnText = "ADD CATEGORY";
                    $scope.initCategory($scope.pageCategory.start,$scope.pageCategory.pageSize);
                    break;
                case "Modifier Group":
                    $scope.btnText = "ADD MODIFIER GROUP";
                    $scope.initModifier($scope.pageModify.start,$scope.pageModify.pageSize);
                    break;
            }
        };

        /*---item page---*/
        $scope.page = {
            total:0,
            start:0,
            end:20,
            currentPage:1,
            pageSize:20
        };
        $scope.pageChanged = function() {
            $scope.page.start = ( $scope.page.currentPage - 1 )*$scope.page.pageSize;
            $scope.page.end = $scope.page.start + $scope.page.pageSize;
            $scope.initQueryItem($scope.page.start,$scope.page.pageSize);
        };
        /*---item page---*/

        /*---category page---*/
        $scope.pageCategory = {
            total:0,
            start:0,
            end:20,
            currentPage:1,
            pageSize:20
        };
        $scope.pageChangedCategory = function() {
            $scope.pageCategory.start = ( $scope.pageCategory.currentPage - 1 )*$scope.pageCategory.pageSize;
            $scope.pageCategory.end = $scope.pageCategory.start + $scope.pageCategory.pageSize;
            $scope.initCategory($scope.pageCategory.start,$scope.pageCategory.pageSize);
        };
        /*---category page---*/

        /*---modify page---*/
        $scope.pageModify = {
            total:0,
            start:0,
            end:20,
            currentPage:1,
            pageSize:20
        };
        $scope.pageChangedModify = function() {
            $scope.pageModify.start = ( $scope.pageModify.currentPage - 1 )*$scope.pageModify.pageSize;
            $scope.pageModify.end = $scope.pageModify.start + $scope.pageModify.pageSize;
            $scope.initModifier($scope.pageModify.start,$scope.pageModify.pageSize);
        };
        /*---modify page---*/

        /**  refresh event start  **/
        $scope.$on("onRefreshEvent",function(event, socrllJQ){
            /**  为0的时候为滚动条初始化数据  **/
            if(socrllJQ.mcs.topPct == 0){
                return;
            }
            switch($scope.btnText){
                case "ADD ITEM":
                    if($scope.items.length>0){
                        var totalPages  = Math.ceil($scope.page.total/$scope.page.pageSize);
                        if( totalPages > $scope.page.currentPage ){
                            $scope.page.currentPage+=1;
                            $scope.pageChanged();
                        }
                    }
                    break;
                case "ADD CATEGORY":
                    if($scope.categorys.length>0){
                        var totalPages  = Math.ceil($scope.pageCategory.total/$scope.pageCategory.pageSize);
                        if( totalPages > $scope.pageCategory.currentPage ){
                            $scope.pageCategory.currentPage+=1;
                            $scope.pageChangedCategory();
                        }
                    }
                    break;
                case "ADD MODIFIER GROUP":
                    if($scope.modifiers.length>0){
                        var totalPages  = Math.ceil($scope.pageModify.total/$scope.pageModify.pageSize);
                        if( totalPages > $scope.pageModify.currentPage ){
                            $scope.pageModify.currentPage+=1;
                            $scope.pageChangedModify();
                        }
                    }
                    break;
            }
        });
        /**  refresh event end  **/

        $scope.addItem = function(){

            switch($scope.btnText){
                case "ADD ITEM":
                    $scope.showMenuEdit({});
                    break;
                case "ADD CATEGORY":
                    $scope.showMenuCategory({});
                    break;
                case "ADD MODIFIER GROUP":
                    $scope.showMenuModifier({});
                    break;
            }
        };

        $scope.showMenuEdit = function(row){
            $scope.row = row;
            $scope.isEdit = true;
            $scope.$broadcast('selectrow', row,$scope.itemCategory);
        };
        $scope.showMenuCategory = function(row){
            $scope.rowCategory = row;
            $scope.isCategory = true;
            $scope.$broadcast('selectrowCategory', row);
        };
        $scope.showMenuModifier = function(row){
            $scope.rowModifier = row;
            $scope.isModifier = true;
            $scope.$broadcast('selectrowModifier', row);
        };
        $scope.hideMenuEdit = function(row){
            $scope.isEdit = false;
            $scope.isCategory = false;
            $scope.isModifier = false;
        };

        
    }]);
    app.factory('fb.menusetting.menusettingFactory', ['$http',function($http){
        return {
            /** 查询所有的Item **/
            queryAllItem : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/queryAllItem',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            /** 分页查询Item **/
            queryItem : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/queryItem',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            /** 分页查询Category **/
            queryCategory : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/queryCategory',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            /** 分页查询Modifier **/
            queryModifier : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/queryModifier',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            /** 查询所有的Category **/
            queryAllCategory : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/queryAllCategory',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            /** 合并Item和category数据 **/
            itemConcatCategory : function(itemArray,categoryArray){
                if( ( itemArray && itemArray.length == 0 ) || ( categoryArray && categoryArray.length == 0 )){
                    return;
                }else{
                    angular.forEach(itemArray,function(item){
                            var categoryId = item.mposfb.category;
                            angular.forEach(item.mposfb.price,function(price){
                                if (price.price) {
                                    price.price = (parseFloat(price.price) / 100).toFixed(2);
                                }
                            });
                            angular.forEach(categoryArray,function(category){
                                 if(category.id == categoryId ){
                                     item.mposfb.categoryName = category.name;
                                 }
                            });
                    });
                }
            },
            /** 合并Item和modifier数据 **/
            modifierConcatItem : function(modifierArray,itemArray){
                 angular.forEach(modifierArray,function(modifier){
                       var mId = modifier.id;
                       var assignedItems = 0;
                       angular.forEach(modifier.options,function(price){
                           if (price.price) {
                               price.price = (parseFloat(price.price) / 100).toFixed(2);
                           }
                       });
                       angular.forEach(itemArray,function(item){
                           if(item.mposfb.modifiers.indexOf(mId)>-1){
                               assignedItems++;
                           }
                       });
                       modifier.assignedItems = assignedItems;
                 });
            },
            /** 合并category和Item数据 **/
            categoryConcatItem : function(categoryArray,itemArray){
                angular.forEach(categoryArray,function(category){
                    var cId = category.id;
                    var containItems = 0;
                    angular.forEach(itemArray,function(item){
                        if(item.mposfb.category == cId){
                            containItems++;
                        }
                    });
                    category.containItems = containItems;
                });
            }
        };
    }]);
    app.directive('bbposMenuEdit',[function(){
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            scope:{
                itemid:"@",
                itemname:"@",
                itempos:"@",
                itemcategory:"@",
                itemgroup:"@",
                prices:"@",
                hideMenuEdit:"&hideMenuEdit"
            },
            templateUrl:'tpl/settings/menu_edit.html',
            controller:'fb.menuedit.menueditController',
            link: function(scope, el, attrs) {
                
            }
        };
    }]);
    app.directive('bbposMenuCategory',[function(){
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            scope:{
                categoryid:"@",
                categoryname:"@",
                categorypos:"@",
                categoryassign:"@",
                hideMenuEdit:"&hideMenuEdit"
            },
            templateUrl:'tpl/settings/menu_category.html',
            controller:'fb.menucategory.menucategoryController',
            link: function(scope, el, attrs) {
                
            }
        };
    }]).directive('bbposMenuModifier',[function(){
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            scope:{
                itemid:"@",
                itemname:"@",
                itempos:"@",
                itemcategory:"@",
                itemgroup:"@",
                prices:"@",
                hideMenuEdit:"&hideMenuEdit"
            },
            templateUrl:'tpl/settings/menu_modifier.html',
            controller:'fb.menumodifier.menumodifierController',
            link: function(scope, el, attrs) {
                
            }
        };
    }]);
    /*app.filter("menuPrice",function(){
        return function(prices){
            return prices !== "" ? JSON.parse(prices):[];
        };
    });*/
	return app;
 }));