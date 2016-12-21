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
    var app = angular.module('fb.menuedit', ['ngTouch','ngAnimate','ngSanitize','ui.bootstrap']);

    app.controller('fb.menuedit.menueditController', ['$scope','$state','$timeout','$uibModal','fb.menuedit.menueditFactory',function($scope,$state,$timeout,$uibModal,fac){
        /**
         * 初始化数据格式 
         */
        $scope.id = null;
        $scope.imgDefault = "data:image/jpg;base64,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";
        $scope.imgBase64 = $scope.imgDefault;
        $scope.isUpload = false;
        $scope.hasImage = false;
        $scope.loadingImage = false;
        $scope.itemData = {
            name : '',
            id : '',
            posName : '',
            category : '',
            modifiers : [],
            price : [],
            type  : 'item',
            merchant : localStorage.getItem("merchant")
        };
        $scope.clearData = {};
        angular.copy($scope.itemData,$scope.clearData);

        $scope.categorys = [];

        $scope.modifiers = [];

        $scope.queryModifier = function(){
            fac.queryAllModifier({
                merchant : localStorage.getItem("merchant")
            },function(returnObj){
                $scope.modifiers = returnObj.results;
            });
        };
        $scope.queryCategory = function(){
            fac.queryAllCategory({
                merchant : localStorage.getItem("merchant")
            },function(returnObj){
                $scope.categorys = returnObj.results;
            });
        };

                
        $scope.popover = {
        	isPrice:false,
        	priceTpl:''
        };

        /** 图片操作 **/

        $scope.deleteImage = function(){
            $scope.imgBase64 = $scope.imgDefault;
            $scope.hasImage = false;
            $scope.isUpload = true;
        };
        $scope.uploadImage = function(){
            var f = document.getElementById("file0");
            f.click();
        };
        $scope.file_changed = function(element) {
                $scope.loadingImage = true;
                var photofile = element.files[0];
                if(!photofile)
                    return;
                /** 压缩图片大小 **/
                lrz(photofile, {width: 128,height:128}, function (results) {
                    $scope.imgBase64 = results.base64;
                    $scope.isUpload = true;
                    $scope.loadingImage = false;
                });
        };


        /** 行选择事件 **/
        $scope.$on("selectrow",function(event,row,itemCategory){
            $scope.id = row.id;
            $scope.queryCategory();
            $scope.queryModifier();
            $scope.showError = false;
            /** 创建新的数据源地址 **/
            var destination = {};
            if( $scope.id== undefined){
                angular.copy($scope.clearData,$scope.itemData)
                $scope.imgBase64 = $scope.imgDefault;
                $scope.hasImage = false;
            }else{
                angular.copy(row.mposfb,destination);
                if(destination.categoryName)
                    $scope.isSelCategory = true;
                delete destination.categoryName;
                /** 继承新数据源 **/
                if(destination.price){
                    angular.forEach(destination.price,function(row){
                            var floatValue =  parseFloat(row.price);
                            row.price = floatValue==NaN?0:floatValue;
                    });
                }
                angular.extend($scope.itemData,destination);
                $scope.loadingImage = true;
                fac.getAttachment({
                    id : $scope.id
                },function(imgBase64){
                    if(imgBase64=="" || imgBase64 == "data:;base64,eyJlcnJvciI6Im5vdF9mb3VuZCIsInJlYXNvbiI6Im1pc3NpbmcgYXR0YWNobWVudCBpbWFnZSJ9"){
                        $scope.imgBase64 = $scope.imgDefault;
                        $scope.hasImage = false;
                        $scope.loadingImage = false;
                        return;
                    }
                    $scope.imgBase64 = imgBase64;
                    if($scope.imgDefault == $scope.imgBase64 || !$scope.imgBase64){
                        $scope.hasImage = false;
                    }else{
                        $scope.hasImage = true;
                    }
                    $scope.loadingImage = false;
                })
            }
            if ($scope.itemData.price) {
                $scope.itemData.price.push({name:"",price:0});
            }else{
                $scope.itemData.price = [];
                $scope.itemData.price.push({name:"",price:0});
            }
            
        	//$scope.hideValid();
        });

        $scope.priceEdit = function(nVal){
            var lastRow = $scope.itemData.price.slice(-1);
            if (lastRow.length > 0) {
                if ( lastRow[0].name || lastRow[0].price ) {
                    $scope.itemData.price.push({name:"",price:0});
                }
            }
            $scope.emptyPrice = true;
            var priceCount = $scope.itemData.price.length;
            for( var i=0;i<priceCount;i++ ){
                var row = $scope.itemData.price[i];
                if( row.name || row.price>0){
                    $scope.emptyPrice = false;
                }
            }
        };
        $scope.delPrice = function(dr){
            $scope.itemData.price.splice($scope.itemData.price.indexOf(dr),1);
            $scope.emptyPrice = true;
            var priceCount = $scope.itemData.price.length;
            for( var i=0;i<priceCount;i++ ){
                var row = $scope.itemData.price[i];
                if( row.name || row.price>0){
                    $scope.emptyPrice = false;
                }
            }
        };


        $scope.modifierChange = function($event,id){
            if($event.target.checked){
                $scope.itemData.modifiers.push(id);
            }else{
                $scope.itemData.modifiers.splice($scope.itemData.modifiers.indexOf(id),1);
            }
        };

        /**
         * 删除Item数据
         */
        $scope.deleteItem = function(){
            $scope.$parent.isLoading = true;
            if( $scope.id ){
                fac.deleteItem({
                    id : $scope.id
                },function(returnObj){
                    $scope.$parent.isLoading = false;
                    if(returnObj.success){
                        $scope.$parent.initQueryItem($scope.$parent.page.start,$scope.$parent.page.pageSize);
                        $uibModal.open({
                            templateUrl : 'tpl/modelSuccessful.html',
                            size : 'sm',
                            controller : function($scope){
                                $scope.title = 'Success alert';
                                $scope.content = 'Delete successfully';
                            }
                        });
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
            }else{
                $scope.$parent.isLoading = false;
            };
            $scope.hideMenuEdit();
        };

        /**
         * 保存Item数据及图片上传
         */
        $scope.saveItem = function(){
            /** 验证价格和名字是否为空 **/
            $scope.emptyPrice = false;
            var lastPrice = $scope.itemData.price[$scope.itemData.price.length-1];
            $scope.itemData.price.splice(-1);
            var priceCount = $scope.itemData.price.length;
            for( var i=0;i<priceCount;i++ ){
                var row = $scope.itemData.price[i];
                if( !row.name || row.price == null || row.price == undefined || row.price == NaN ){
                    $scope.emptyPrice = true;
                }
            }
            if( priceCount == 0 ){
                $scope.emptyPrice = true;
                $scope.itemData.price.push(lastPrice);
            }

            if(!$scope.itemData.name || $scope.emptyPrice ){
                $scope.showError = true;
                return;
            }

            $scope.$parent.isLoading = true;

            fac.saveItem({
                id : $scope.id,
                itemData : $scope.itemData,
                imgBase64 : $scope.imgBase64,
                isUpload : $scope.isUpload
            },function(returnObj){
                if (returnObj.success) {
                    $scope.hideMenuEdit();
                    $scope.$parent.items = [];
                    if(!$scope.id){
                        setTimeout(function(){
                            $scope.$parent.isLoading = false;
                            $scope.$parent.initQueryItem(0,20);
                        },300)
                    }else{
                        $scope.$parent.isLoading = false;
                        $scope.$parent.initQueryItem(0,20);
                    }
                    $scope.id = returnObj.id;
                    $uibModal.open({
                        templateUrl : 'tpl/modelSuccessful.html',
                        size : 'sm',
                        controller : function($scope){
                            $scope.title = 'Success alert';
                            $scope.content = 'Save successfully';
                        }
                    });
                }else{
                    $scope.$parent.isLoading = false;
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
        
    }]);
    app.factory('fb.menuedit.menueditFactory', ['$http',function($http){
        return {
            /**  保存或更新Item数据  **/
            saveItem : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/saveItem',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            /** 删除Item **/
            deleteItem : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/deleteDoc',
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
            /** 查询所有Modifier **/
            queryAllModifier : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/queryAllModifier',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            /** 获取图片 **/
            getAttachment : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/getAttachment',
                    data:params
                }).success(function(data, header, config, status) {
                        return callback && callback(data);
                });
            }
        };
    }]);

	return app;
 }));