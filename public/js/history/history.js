/*
* @author hudinghua
* @date   2016/09/09
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
    var app = angular.module('fb.history', ['ngAnimate', 'ngAnimate','ngSanitize','ui.bootstrap']);
    /**
    * FloorPlan logical control 
    */
    app.controller('fb.history.historyController', ['$scope','$state','$uibModal','fb.history.historyFactory','$rootScope',function($scope,$state,$uibModal,fac,$rootScope){
    	$scope.$parent.isShowList = false;
        $scope.$parent.isMeunShow = false;
        $scope.$parent.isSelf = false;
        $scope.$parent.setingTheme = false;
        $scope.$on('triggerSidebar',function(event,evt){
            if (evt && evt.target.className==="cover") {
                $scope.hisShow = 'his-show slideInRight animated ';
            }else{
                $scope.hisShow = '';
            }
        });
        var $modal = $uibModal;

        $scope.isLoading = true;
        fac.getHistory({merchant:localStorage.getItem("merchant")},function(rst){
            if (!rst.success) {
                $scope.isLoading = false;
                $uibModal.open({
                    templateUrl : 'tpl/modelFailed.html',
                    size : 'sm',
                    controller : function($scope){
                        $scope.title = 'Failed alert';
                        $scope.content = 'Failed to get data';
                    }
                });
                return;
            }
            init(rst.results);
        });
        fac.getReceiptTemp({ merchant:localStorage.getItem("merchant") },function(data){
            $scope.receiptData = data.mposfb;
        });
        fac.getRestaurant({ merchant:localStorage.getItem("merchant") },function(returnObj){
            if(returnObj.success && returnObj.results && returnObj.results.length>0){
                var resObj = returnObj.results[0];
                fac.getRestaurantImg({ id:resObj.id },function(data){
                    $scope.restaurantData.img = data;
                });
                $scope.restaurantData = resObj.mposfb;
            }
        });

        $scope.touchZoneFold = function(event){
        	if (event.target.className !== "cover") {
        		$scope.hisShow = '';
        	}
            $scope.$emit('triggerSidebar',event);
        };

        $scope.hisShow = '';
        $scope.rowClick = function(row){
        	row.mposfb.items.map(function(food){
                angular.extend(food,{bgImg:{"background-image":"url(../../img/food-placeholder.png)"}});
                fac.getUserImg({id:food.org_id},function(data){
                    angular.extend(food,{bgImg:{"background-image":"url("+data+")"}});
                });
            });
            $scope.header = row;
        	$scope.items = row.mposfb.items;
        	$scope.hisShow = 'his-show slideInRight animated ';
        };

        $scope.receipt = function(){
            if(!$scope.restaurantData){
                var model = $uibModal.open({
                    templateUrl : 'tpl/modelWhether.html',
                    size : 'sm-plus',
                    controller:function($scope){
                        $scope.title = "Restaurant and Receipt is not set!";
                        $scope.discard = function(){
                            model.dismiss('cancel');
                            $state.go('app.settings');
                        };
                        $scope.cancel = function(){
                            model.dismiss('cancel');
                        };
                    }
                });
                return false;
            }
        	$scope.receiptParams = {
                imgCss:{"background-image":"url("+$scope.restaurantData.img+")"},
                headerCss:{"background-color":$scope.receiptData.color},
                showLogo:$scope.receiptData.showLogo,
                showInfo:$scope.receiptData.showInfo,
                title:$scope.receiptData.header,
                dishs:$scope.header.mposfb.items,
                number:$scope.header.mposfb.number,
                amount:$scope.header.mposfb.amount,
                time:$scope.header.mposfb.modify_at.split(' ')[0],
                mark:$scope.receiptData.desc,
                customerMsg:{
                    tel:$scope.restaurantData.phone,
                    site:$scope.restaurantData.link,
                    addr:$scope.restaurantData.facebook
                }
            };
            var receiptModal = $modal.open({
                templateUrl : 'tpl/modalReceipt.html',
                size : 'lg-plus',
                resolve:{
                    receiptParams:function(){
                        return $scope.receiptParams;
                    }
                },
                controller : function($scope,receiptParams){
                    $scope.receipt = receiptParams;
                    $scope.back = function(){
                        $scope.$parent.$$childHead.isShowList = true;
                        $scope.$parent.$$childHead.isMeunShow = false;
                        $scope.$parent.$$childHead.isSelf = true;
                        receiptModal.dismiss('cancel');
                        $state.go('app');
                    };
                    $scope.print = function(){
                    	preview();
                    };
                    $scope.sendEmail = function(){

                    };
                }
            });
        };
        function preview(){  
			$('.charge-modal-header,.modal-receipt').printArea({
				extraCss:"",
				extraHead:"",
				mode:"iframe",
				popClose:true,
				retainAttr:["class","id","style","on"]
			});
		}
        function init(data){
        	var groupRow = [], group = {};
            /*data = data.sort(function(a,b){
                return a.mposfb.modify_at - b.mposfb.modify_at;
            });*/
        	angular.forEach(data, function(row){
        		var dt = new Date(row.mposfb.modify_at.replace(/-/g,'/').split('.')[0]);
        		if (!group.hasOwnProperty(dt.toLocaleDateString())) {
        			group[dt.toLocaleDateString()] = [row];
        		}else{
        			group[dt.toLocaleDateString()].push(row);
        		}
        	});
            var ks = [],kso = {};
            for(var key in group){
                ks.push(key);
            }
            ks = ks.sort(function(a,b){return Date.parse(b)-Date.parse(a);});
            for (var i = 0,L = ks.length; i < L; i++) {
                for (var j = group[ks[i]].length - 1; j >= 0; j--) {
                    // use sort
                    group[ks[i]][j]["modify_at"] = group[ks[i]][j].mposfb.modify_at;
                }
                kso[ks[i]] = group[ks[i]];
            }

        	$scope.isLoading = false;
        	$scope.groupRow = kso;
        	//$scope.$apply();
        }
    }]);

    app.factory('fb.history.historyFactory', ['$http',function($http){
        return {
            getRestaurant : function(params,callback){
                 $http({
                     method: 'POST',
                     url: '/getRestaurant',
                     data:params
                 }).success(function(data, header, config, status) {
                     if (data) {
                         return callback && callback(data);
                     }
                 });
             },
             getReceiptTemp : function(params,callback){
                 $http({
                     method: 'POST',
                     url: '/getReceiptTemp',
                     data:params
                 }).success(function(data, header, config, status) {
                     if (data.success) {
                         return callback && callback(data.results[0]);
                     }
                 });
             },
             getRestaurantImg : function(params,callback){
                $http({
                    method: 'POST',
                    url: '/getImage',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
             },
            getHistory:function(params,callback){
                $http({
                    method: 'POST',
                    data:params,
                    url: '/queryHistory'
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
        	getUserImg:function(params,callback){
                $http({
                    method: 'POST',
                    url: '/getAttachment',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            }
        };
    }]);

	app.filter("timeCategory",function(){
        return function(time){
            if (time) {
                return (new Date(time));
            }else{
                return "";
            }
        };
    }).filter("timeAmPm",function(){
        return function(time){
            if (time) {
                return (new Date(time.replace(/-/g,'/').split('.')[0]));
            }else{
                return "";
            }
        };
    }).filter("brackets",function(){
        return function(sizename){
            if (sizename==="") {
                return "";
            }else{
                return '('+sizename+')';
            }
        };
    }).filter("moneyBrackets",function(){
        return function(option){
            if (angular.isObject(option)) {
                return '(+$'+option.price/100+' '+option.name+')';               
            }else{
                return "";
            }
        };
    });
    return app;
}));