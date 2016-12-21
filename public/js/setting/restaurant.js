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
    var app = angular.module('fb.restaurant', ['ngTouch','ngAnimate','ngSanitize','ui.bootstrap']);
    
    app.controller('fb.restaurant.restaurantController', ['$scope','$uibModal','fb.restaurant.restaurantFactory',function($scope,$uibModal,fac){
        $scope.isLoading = true;
        //$scope.$parent.currentTabId = '1001';
        fac.getRestaurant(function(rst){
            $scope.isImgChange = false;
            $scope.isLoading = false;
            if (rst.success) {
                if (rst.results.length > 0) {
                    var res = rst.results[0];
                    $scope.countryChange(res.mposfb.country);
                    $scope.res = {
                        id:res.id,
                        image64:"",
                        basicname:res.mposfb.name,
                        description:res.mposfb.description,
                        email:res.mposfb.email,
                        phone:res.mposfb.phone,
                        website:res.mposfb.link,
                        facebook:res.mposfb.facebook,
                        address:res.mposfb.address1,
                        address2:res.mposfb.address2,
                        isMobile:res.mposfb.isMobile === ""?false:true,
                        city:res.mposfb.city,
                        state:res.mposfb.state,
                        postalcode:res.mposfb.postalcode,
                        _attachments:res.mposfb._attachments
                    };
                    fac.getImage({id:res.id},function(rst){
                        $scope.res.image64 = rst;
                        $scope.res.oldImage64 = rst;
                        $scope.oldData = angular.copy($scope.res);
                    });
                }else{
                    $scope.countryChange("");
                    $scope.isCountry = false;
                    $scope.res = {
                        id:"",
                        image64:"",
                        basicname:"",
                        description:"",
                        email:"",
                        phone:"",
                        website:"",
                        facebook:"",
                        isMobile:false,
                        address:"",
                        address2:"",
                        city:"",
                        state:"",
                        postalcode:""
                    };
                }
                $scope.res.desLength = $scope.res.description.length;
                $scope.res.postcodeLength = $scope.res.postalcode.length;
                $scope.oldData = angular.copy($scope.res);
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
        $scope.country = {
            options: [
               'CHINA',
               'USA',
               'ITALIA',
               'CANADA'
            ],
            selected: 'Item'
        };
        $scope.countryChange = function(c){
            $scope.country.selected = c;
            if (c !== '') {
                $scope.isCountry = true;
            }else{
                $scope.isCountry = false;
            }
        };
        $scope.reset = function(){
            $scope.res = angular.copy($scope.oldData);
        };
        $scope.save = function(){
            var data = $scope.res,
                isSave = true;
            if (!data.basicname || data.basicname.trim() === '') {
                $scope.popoverBn = {
                    tpl:'Bussiness name cannot be empty!',
                    isOpen:true
                };
                isSave = false;
            }
            /*if (!data.address || data.address.trim() === '') {
                $scope.popoverAd = {
                    tpl:'Address cannot be empty!',
                    isOpen:true
                };
                isSave = false;
            }
            if (!data.address2 || data.address2.trim() === '') {
                $scope.popoverAd2 = {
                    tpl:'Address2 cannot be empty!',
                    isOpen:true
                };
                isSave = false;
            }*/
            if (!isSave) {
                return false;
            }
            for(var k in data){
                if (!data[k] ) {
                    data[k] = "";
                }
            }
            var params = {
                id:$scope.res.id,
                isImgChange:$scope.isImgChange,
                image64:data.image64,
                data:{
                    name:data.basicname.trim(),
                    description:data.description.trim(),
                    email:data.email.trim(),
                    phone:data.phone.trim(),
                    link:data.website.trim(),
                    facebook:data.facebook.trim(),
                    isMobile:data.isMobile,
                    address1:data.address.trim(),
                    address2:data.address2.trim(),
                    city:data.city.trim(),
                    state:data.state.trim(),
                    postalcode:data.postalcode.trim(),
                    country:$scope.country.selected,
                    merchant:localStorage.getItem("merchant"),
                    _attachments:data._attachments
                }
            };
            $scope.isLoading = true;
            fac.saveRestaurant(params,function(rst){
                if (rst.success) {
                    $scope.isImgChange = false;
                    $scope.oldImage64 = angular.copy($scope.image64);
                    $scope.res.id = rst.id;
                    $scope.oldData = angular.copy($scope.res);
                    $uibModal.open({
                        templateUrl : 'tpl/modelSuccessful.html',
                        size : 'sm',
                        controller : function($scope){
                            $scope.title = 'Success alert';
                            $scope.content = 'Save successfully';
                        }
                    });
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
                $scope.isLoading = false;
            });
        };
    }]);

    app.directive('fileImgUpload', function() {
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            templateUrl:'setting/fileImgUpload.html',
            scope:{
                "oldImage64":"@",
                "image64":"=",
                "isImgChange":"="
            },
            link: function(scope,elem,attrs) {
                var $el = $(elem);
                scope.selectImg = function(target){
                    if (target.files.length > 0) {
                        var file = target.files[0];
                        var reader = new FileReader();
                        reader.readAsDataURL(file);
                        reader.onload = function(e){
                            var base64 = this.result;
                            if (base64 !== scope.oldImage64) {
                                scope.isImgChange = true;
                            }else{
                                scope.isImgChange = false;
                            }
                            scope.$apply(function(){
                                scope.image64 = base64;
                            });
                        };
                        reader = null;
                    }
                };
            }
        };
    }).directive('textLength', function() {
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            template:'<div class="text-right">{{txtlength}}/{{maxlength}}</div>',
            scope:{
                "text":"=",
                "maxlength":"@",
                "txtlength":"@"
            },
            link: function(scope,elem,attrs) {
                scope.txtlength = 0;
                var area = $(elem).prev();
                area.bind("keyup",function(){
                    scope.$apply(function(){
                        scope.txtlength = scope.text.length;
                        if (scope.txtlength > scope.maxlength) {
                            scope.text = scope.text.slice(0,scope.maxlength-scope.txtlength);
                            scope.txtlength = scope.maxlength;
                        }
                    });
                });
                area = null;
            }
        };
    });

    app.factory('fb.restaurant.restaurantFactory', ['$http',function($http){
        return {
            getImage:function(params,callback){
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
            getRestaurant:function(callback){
                $http({
                    method: 'POST',
                    url: '/getRestaurant',
                    data:{merchant:localStorage.getItem("merchant")}
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            saveRestaurant:function(params,callback){
                $http({
                    method: 'POST',
                    url: '/saveRestaurant',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            }
        };
    }]);
    app.run(["$templateCache", function($templateCache) {
        $templateCache.put('setting/fileImgUpload.html',['<div>',
                                '<input id = "pic_fileImgUpload" onchange="angular.element(this).scope().selectImg(this)" type="file" accept="image/gif,image/jpeg,image/jpg,image/png" style="display:none;" />',
                                '<label ng-if="\'\' == image64" for="pic_fileImgUpload"><i class="icon-ic-store-black ico-basic" style="cursor: pointer;"></i></label>',
                                '<label ng-if="\'\' !== image64" for="pic_fileImgUpload" style="cursor:pointer;"><img ng-src="{{image64}}" style="width:100px;height:100px;border:1px solid #eee;" /></label>',
                            '</div>'].join(""));
    }]);
	return app;
 }));