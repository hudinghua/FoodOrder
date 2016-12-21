/*
* @author hudinghua
* @date   2016/08/04
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
    //'use strict';
    var app = angular.module('fb.dish', ['ngAnimate', 'ngSanitize','ui.bootstrap']);
    /**
    * Dish logical control 
    */
    app.controller('fb.dish.dishController', ['$scope','$rootScope','$state','$timeout','$stateParams','$uibModal','fb.dish.dishFactory','socketMg',function($scope,$rootScope,$state,$timeout,$stateParams,$uibModal,fac,socketMg){
        if (!$stateParams.table) {
            $state.go('app');
            return false;
        }
        $scope.isTouch = (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|Windows Phone)/i))?true:false;//'createTouch' in document;

        $scope.isChange = false;
        $scope.userName = localStorage.getItem("username");
        $scope.dishData = $stateParams.table;
        $scope.tableItems = [];
        $scope.guests = [];
        $scope.guestObjs = [];
        $scope.dishData.order.mposfb.type = "order";

        $scope.isDishtip = false;

        $scope.isAllLoading = false;
        var $modal = $uibModal;
        /***  socket 事件  start   modify 2016-09-29  warren.li ***/
        setTimeout(function () {
            socketMg.startDish($scope.dishData.order.id);
        },2000);

        $scope.$on("dishChange", function(event, data) {
            if(data.success){
                /** 校验ID是否一致以及数据是否已被删除 **/
                if( data.results.length>0 && data.results[0].id == $scope.dishData.order.id ){
                    /**  校验最后修改时间来判断数据是否需要刷新 **/
                    if($scope.dishData.order.mposfb.modify_at != data.results[0].mposfb.modify_at ){
                        $scope.dishData.order.mposfb = data.results[0].mposfb;
                        var items = data.results[0].mposfb.items;
                        init(items);
                    }
                    setTimeout(function () {
                        socketMg.startDish($scope.dishData.order.id);
                    },1000);
                }else{
                    $state.go('app');
                }
            }
        });

        /***  socket 事件  end    ***/
	    
        /*if ( $scope.dishData.order.id==='') {
            $scope.dishData.order.mposfb.type = "order";
            $scope.dishData.order.mposfb.merchant = localStorage.getItem("merchant");
            fac.backSaveOrder({params:JSON.stringify($scope.dishData.order)},function(rst){
                $scope.dishData.order.id = rst.id;
                //$scope.dishData.order.mposfb.type = "order";
                console.log('save successfully!');
            });
        }*/
        
        angular.forEach($stateParams.abledt, function(dt){
            if (dt.status === 0) {
                $scope.tableItems.push(dt.tableNo);
                $scope.guestObjs.push({tableNo:dt.tableNo,guests:dt.guests});
            }
        });
        if ($scope.tableItems.indexOf($scope.dishData.order.mposfb.table) < 0) {
            $scope.tableItems.push($scope.dishData.order.mposfb.table);
            $scope.guestObjs.push({tableNo:$scope.dishData.tableNo,guests:$scope.dishData.guests});
            $scope.currentTable = $scope.tableItems[$scope.tableItems.length-1];
        }
        $scope.dishData.order.mposfb.table = $scope.currentTable;
        
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
                    $scope.server.selected = $scope.dishData.order.mposfb.server;
                }
            }
        });

        $scope.tableChange = function(dt){
            $scope.dishData.order.mposfb.table = dt;
            $scope.guests = [];
            angular.forEach($scope.guestObjs, function(g){
                if (dt === g.tableNo) {
                    for (var i = 1; i <= g.guests; i++) {
                        $scope.guests.push(i);
                    }
                }
            });
        };
        $scope.tableChange($scope.dishData.order.mposfb.table);
        $scope.guestChange = function(g){
            $scope.dishData.order.mposfb.customers = g;
            $scope.guest = $scope.guests[g-1];
        };
        $scope.guestChange($scope.dishData.order.mposfb.customers);

        $scope.scrollStart = function(){
            console.log('scrollStart');
        };
        $scope.scrollMove = function(){
            console.log('scrollMove');
        };
        $scope.scrollEnd = function(){
            console.log('scrollEnd');
        };
        $scope.leftSlideCategory = function(event){
            var ul = $('[inertia-Scroll]'),
                left = ul.offset().left;
            if (left <= 0 && left >= (ul.parent().width() - ul.width())) {
                ul.offset({left:left - 150});
            }
            
            
        };
        $scope.rightSlideCategory = function(event){
            var ul = $('[inertia-Scroll]'),
                left = ul.offset().left;
            if (left < 0) {
                ul.offset({left:left + 150});
            }
            
        };
        
        $scope.triggerTab = function(tab){
            $scope.isLoading = true;
            $scope.currentTabId = tab.id;
            fac.getDish({categoryId:tab.id,limit:10000,offset:0},function(rst){
                $scope.isLoading = false;
                rst.map(function(food){
                    angular.extend(food,{bgImg:{"background-image":"url(../../img/food-placeholder.png)"}});
                    fac.getUserImg({id:food.id},function(data){
                        angular.extend(food,{bgImg:{"background-image":"url("+data+")"}});
                    });
                });
                $scope.items = rst;
            });
        };
        var startSlideX = 0,startTime, endTime;
        $scope.slideSwitchS = function(e){
            startSlideX = e.view.event.touches[0].pageX;
            startTime = Date.now();
        };
        $scope.slideSwitchE = function(e){
            var distance = startSlideX - e.view.event.changedTouches[0].pageX;
            endTime = Date.now();
            var speed = distance/(startTime - endTime);
            console.log(speed);

            if(Math.abs(speed)>1){
                for (var i = 0,L = $scope.category.length; i < L; i++) {
                    if ($scope.category[i].id === $scope.currentTabId) {
                        if ((i===0 && speed>0) || (i===(L-1) && speed<0)) {
                            break;
                        }
                        var ci = i;
                        if (speed<0) {//left load
                            ci = i+1;
                            $scope.triggerTab($scope.category[ci]);
                        }else{//right load
                            ci = i-1;
                            $scope.triggerTab($scope.category[ci]);
                        }
                        var gategoryWrap = $('.left-menu .bottom'),
                            gategoryEl = gategoryWrap.find('ul');
                        if (gategoryWrap.width() >= gategoryEl.width()) {
                            break;
                        }
                        var left = -150*ci + gategoryWrap.width()/2 - 75;
                        if (left>0 && left < gategoryWrap.width()/2) {
                            gategoryEl.offset({left:0})
                        }else if(left < (gategoryWrap.width() - gategoryEl.width())){
                            gategoryEl.offset({left:gategoryWrap.width() - gategoryEl.width()});
                        }else{
                            gategoryEl.offset({left:left});
                        }
                        break;
                    }
                }
            }
        };

        $scope.isActive = function(tabid){
            return tabid === $scope.currentTabId;
        };
        fac.getCategory(function(rst){
            var cs = [],_cs = [],_rst = [];
            if ($.isArray(rst) && rst.length > 0) {
                rst.forEach(function(c){
                    cs.push(c.mposfb.name);
                });
                _cs = cs.sort();
                _cs.forEach(function(cN){
                    for (var i = rst.length - 1; i >= 0; i--) {
                        if(rst[i].mposfb.name === cN){
                            _rst.push(rst[i]);
                            break;
                        }
                    }
                });
                $scope.category = _rst;
            }else{
                $scope.category = [];
                return;
            }
            if (angular.isArray(rst)) {
                $scope.category.unshift({id:'',mposfb:{name:'All'}});
                //rst = rst.concat([{id:'',mposfb:{name:'aa'}},{id:'',mposfb:{name:'bb'}},{id:'',mposfb:{name:'cc'}},{id:'',mposfb:{name:'aa'}},{id:'',mposfb:{name:'bb'}},{id:'',mposfb:{name:'cc'}}]);
            }
            //$scope.category = rst;
            if (!$scope.isTouch) {
                $timeout(function(){
                    $scope.isTouch = $('[inertia-Scroll]').parent().width() >= $('[inertia-Scroll]').width();
                },500);
                
            }
            if ($scope.category.length > 1) {
                $scope.currentTabId = $scope.category[0].id;
            }
        });
        $scope.triggerTab({id:''});

        $scope.backApp = function(){
            if ($scope.isChange) {
                var order = $scope.dishData.order;
                order.mposfb.server = $scope.server.selected;
                var model = $modal.open({
                    templateUrl : 'tpl/modelIsSaveOrder.html',
                    size : 'sm',
                    controller:function($scope){
                        $scope.title = "Save Order?";
                        $scope.save = function(){
                            $scope.isAllLoading = true;
                            angular.forEach(order.mposfb.items,function(item){
                                delete item.bgImg;
                            });
                            
                            order.mposfb.merchant = localStorage.getItem("merchant");
                            fac.backSaveOrder({params:JSON.stringify(order)},function(rst){
                                $scope.isAllLoading = false;
                                model.close();
                                if (rst.success) {
                                    $state.go('app');
                                    console.log('save successfully!');
                                }else{
                                    model.open({
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
                        $scope.discard = function(){
                            model.dismiss('cancel');
                            $state.go('app');
                        };
                        $scope.cancel = function(){
                            model.dismiss('cancel');
                        };
                    }
                });
            }else{
                $state.go('app');
            }
        };

        function init(data){
            $scope.isDishEmpty = true;
            $scope.dishs = data;
            if ($scope.dishs.length > 0) {
                $scope.dishs.map(function(food){
                    fac.getUserImg({id:food.org_id},function(data){
                        angular.extend(food,{bgImg:{"background-image":"url("+data+")"}});
                    });
                });
                $scope.isDishEmpty = false;
            }
        };

        function doRefresh() {
            init($scope.dishData.order.mposfb.items);
        }
        doRefresh();
	
        function repeatAddDish(dishs,dish){
            var isRepeat = false,
                count = dish.count,
                listEl = $('.itemlist');
            for(var i = 0,L = dishs.length; i < L; i++){
                if (dishs[i].org_id === dish.org_id && dishs[i].summary === dish.summary) {
                    var ulEl = $('.dishselect ul'),
                        liEl = $('.dishselect ul li:eq('+i+')');
                    listEl.mCustomScrollbar("scrollTo",127 - ulEl.offset().top + liEl.offset().top-liEl.height() - 15);
                    //$('.itemlist').mCustomScrollbar("scrollTo",$('.dishselect ul li:eq('+i+')').offset().top-127);
                    isRepeat = true;
                    dishs[i].count = dishs[i].count + dish.count;
                    count = dishs[i].count;
                    break;
                }
            }
            if (!isRepeat) {
                dishs.push(dish);
                setTimeout(function(){
                    if (listEl.length > 0) {
                        listEl.mCustomScrollbar("scrollTo","bottom");
                    }
                },150);
            }
            return {
                isRepeat:isRepeat,
                count:count
            };
        };
        function addCalcAmount(rp){
            var amount = 0,
                summary = [];
            if (rp.price && rp.price.length === 0) {
                amount = 0;
            }else{
                amount = rp.price[0].price;
                summary.push(rp.price[0].name);
            }
            
            for(var i=0,L=rp.modifiers.length;i<L;i++){
                if(rp.modifiers[i].single){
                    summary.push(rp.modifiers[i].options[0].name);
                    amount = amount + rp.modifiers[i].options[0].price;
                }else{
                    for(var j=0,jL=rp.modifiers[i].options.length;j<jL;j++){
                        summary.push(rp.modifiers[i].options[j].name);
                        amount = amount + rp.modifiers[i].options[j].price;
                    }
                }
            }
            return {amount:amount*rp.count,unit_price:amount,summary:summary.join(',')};
        };
        $scope.addDish = function(dish,size){
            $scope.renderParams = {
                number:$scope.dishData.order.mposfb.number,

                id:dish.mposfb.id,
                name:dish.mposfb.name,
                prices:dish.mposfb.price,
                modifiers:dish.mposfb.modifiers,

                org_id:dish.id,
                bgImg:dish.bgImg,

                amount:0,
                unit_price:0,
                count:1,
                summary:''
            };
            if (dish.mposfb.price.length > 1 || dish.mposfb.modifiers.length > 0) {
                var modalAddDish = $modal.open({
                    templateUrl : 'tpl/adddish.html',
                    size : size,
                    resolve:{
                        renderParams:function(){
                            return $scope.renderParams;
                        }
                    },
                    controller:function($scope,renderParams){
                        $scope.qty = {
                            count:1,
                            up:function(){ this.count++; },
                            down:function(){
                                if (this.count === 1) { return; }
                                this.count--;
                            }
                        };
                        $scope.modal = renderParams;
                        $scope.isModifiers = false;
                        if (renderParams.modifiers && renderParams.modifiers.length > 0) {
                        $scope.isModifiers = true;
                            fac.getModifiers({ids:JSON.stringify(renderParams.modifiers)},function(data){
                                var modifiers = [];
                                for (var key in data) {
                                    if (data[key].error) { continue; }
                                    var opts = data[key].value.options;
                                    for(var i=0,L=opts.length;i<L;i++){
                                        if (i===0) {
                                            opts[i].isCheck = true;
                                        }else{
                                            opts[i].isCheck = false;
                                        }
                                    }
                                    modifiers.push(data[key].value);
                                }
                                $scope.modal.modifiers = modifiers;
                            });
                        }
                        $scope.selectPrice = function(price){
                            var ps = renderParams.prices;
                            for(var i=0,L=ps.length;i<L;i++){
                                if (ps[i].name === price.name) {
                                    ps[i].isCheck = true;
                                }else{
                                    ps[i].isCheck = false;
                                }
                            }
                        };
                        if ($scope.modal.prices.length > 0) {
                            $scope.selectPrice($scope.modal.prices[0]);
                        }
                        $scope.modifyRadio = function(type,mName,option){
                            var modifiers = renderParams.modifiers;
                            for (var key in modifiers) {
                                if(modifiers[key].single && modifiers[key].name === mName){
                                    var opts = modifiers[key].options;
                                    for(var i=0,L=opts.length;i<L;i++){
                                        if (opts[i].name === option.name) {
                                            opts[i].isCheck = true;
                                        }else{
                                            opts[i].isCheck = false;
                                        }
                                    }
                                }
                            }
                        };
                        $scope.addDishOk = function(){
                            var prices = [],modifiers = [];
                            for(var i=0,L=renderParams.prices.length;i<L;i++){
                                if (!angular.isDefined(renderParams.prices[i].isCheck)) {
                                    prices.push(renderParams.prices[i]);
                                    break;
                                }
                                if (renderParams.prices[i].isCheck) {
                                    delete renderParams.prices[i].isCheck;
                                    prices.push(renderParams.prices[i]);
                                }
                            }
                            renderParams.price = prices;
                            delete renderParams.prices;
                            for(var i=0,L=renderParams.modifiers.length;i<L;i++){
                                angular.extend(renderParams.modifiers[i],{_options:[]});
                                renderParams.modifiers[i].options.forEach(function(option){
                                    if (option.isCheck) {
                                        delete option.isCheck;
                                        renderParams.modifiers[i]._options.push(option);
                                    }
                                    /*if (option.isCheck) {
                                        delete option.isCheck;
                                        renderParams.modifiers[i]._options.push(option);
                                        renderParams.modifiers[i].options = renderParams.modifiers[i]._options;
                                    }*/
                                });
                                renderParams.modifiers[i].options = renderParams.modifiers[i]._options;
                                delete renderParams.modifiers[i]._options;
                            }
                            angular.extend(renderParams,{count:$scope.qty.count});
                            modalAddDish.close(renderParams);
                        };
                        $scope.addDishCancel = function(){
                            modalAddDish.dismiss('cancel');
                        };
                    }
                });
                modalAddDish.result.then(function(rp){
                    angular.extend(rp,addCalcAmount(rp));
                    //rp.price[0].price = rp.unit_price;
                    rp.price = rp.price[0];
                    $scope.isDishEmpty = false;
                    var reCfg = repeatAddDish($scope.dishs,rp);
                    angular.extend($scope.dishData.order.mposfb,fac.calcAmount($scope.dishs));
                    $scope.isChange = true;
                    angular.extend(rp,{
                        count:reCfg.count,
                        orderTotal:$scope.dishData.order.mposfb.amount
                    });
                    fac.getStatus(function(state){
                        if (state && state.CurrentScreen !== "") {
                            if (reCfg.isRepeat) {
                                console.log(rp);
                                fac.updateItem(rp,function(){
                                    console.log('update successfully!');
                                });
                            }else{
                                console.log(rp);
                                fac.addItem(rp,function(data){
                                    console.log('add successfully!');
                                });
                            }
                        }
                    });
                    /*if(reCfg.isRepeat && $scope.dishData.isopen){
                        fac.updateItem(rp,function(){
                            console.log('update successfully!');
                        });
                        return;
                    }
                    if($scope.dishData.isopen) {
                        fac.addItem(rp,function(data){
                            console.log('add successfully!');
                        });
                    }*/
                },function(cancel){
                    console.log(cancel);
                });
            }else{
                $scope.renderParams.price = $scope.renderParams.prices;
                delete $scope.renderParams.prices;
                angular.extend($scope.renderParams,addCalcAmount($scope.renderParams));
                $scope.renderParams.price = $scope.renderParams.price[0];
                if ($scope.renderParams.price) {
                    $scope.renderParams.unit_price = $scope.renderParams.price.price;
                }else{
                    $scope.renderParams.unit_price = 0;
                }
                $scope.isDishEmpty = false;
                var reCfg = repeatAddDish($scope.dishs,$scope.renderParams);
                angular.extend($scope.dishData.order.mposfb,fac.calcAmount($scope.dishs));
                $scope.isChange = true;
                angular.extend($scope.renderParams,{
                    count:reCfg.count,
                    orderTotal:$scope.dishData.order.mposfb.amount
                });
                fac.getStatus(function(state){
                    if (state && state.CurrentScreen !== "") {
                        if (reCfg.isRepeat) {
                            fac.updateItem($scope.renderParams,function(){
                                console.log('update successfully!');
                            });
                        }else{
                            fac.addItem($scope.renderParams,function(data){
                                console.log('add successfully!');
                            });
                        }
                    }
                });
                /*if(reCfg.isRepeat && $scope.dishData.isopen){
                    fac.updateItem($scope.renderParams,function(){
                        console.log('update successfully!');
                    });
                    return;
                }
                if($scope.dishData.isopen) {
                    fac.addItem($scope.renderParams,function(data){
                        console.log('add successfully!');
                    });
                }*/
            }
        };
        
        $scope.deleteDish = function(dish){
            $scope.dishs.splice($scope.dishs.indexOf(dish),1);
            if ($scope.dishs.length === 0) {
                $scope.isDishEmpty = true;
            }
            angular.extend($scope.dishData.order.mposfb,fac.calcAmount($scope.dishs));
            $scope.isChange = true;
            var delRef = {
                id:dish.id,
                count:dish.count,
                number:$scope.dishData.order.mposfb.number,
                name:dish.name,
                amount:dish.price,
                orderTotal:$scope.dishData.order.mposfb.amount,
                summary:dish.summary
            };
            fac.deleteItem(delRef,function(rst){
                console.log('deleted dish item');
            });
        };

        $scope.isEditOrder = true;
        $scope.toggleOrder = function(){
            if ($scope.isEditOrder) {
                $scope.isEditOrder = false;
            }else{
                $scope.isEditOrder = true;
            }
        };
        $scope.deleteOrder = function(){
            fac.deleteNewOrder($scope.dishData.order.mposfb);
            if ($scope.dishData.order.id === '') {
                $state.go('app');
            }else{
                fac.deleteOrder({id:$scope.dishData.order.id},function(rst){
                    if (rst != null && rst.success) {
                        $state.go('app');
                    }else{
                         $modal.open({
                            templateUrl : 'tpl/modelFailed.html',
                            size : 'sm',
                            controller : function($scope){
                                $scope.title = 'Failed alert';
                                $scope.content = 'Delete failed';
                            }
                        });
                    }
                    
                });
            }
        };
        $scope.saveOrder = function(flag){

            if (!angular.isDefined($scope.dishData.order.mposfb.table) || $scope.currentTable===null  || $scope.currentTable==='') {
                $('#forInputTable').popover('show');
                return;
            }
            if (!angular.isDefined($scope.dishData.order.mposfb.customers) || $scope.guest===null || $scope.guest==='') {
                $('#forInputGuest').popover('show');
                return;
            }
            var order = angular.copy($scope.dishData);
            angular.forEach(order.order.mposfb.items,function(item){
                delete item.bgImg;
            });
            $scope.isAllLoading = true;
            order.order.mposfb.server = $scope.server.selected;
            order.order.mposfb.merchant = localStorage.getItem("merchant");
            fac.backSaveOrder({params:JSON.stringify(order.order)},function(rst){
                $scope.isAllLoading = false;
                if (rst.success) {
                    $scope.dishData.order.id = rst.id;
                    $scope.isChange = false;
                    if (flag === 'model') {
                        $modal.open({
                            templateUrl : 'tpl/modelSuccessful.html',
                            size : 'sm',
                            controller : function($scope){
                                $scope.title = 'Success alert';
                                $scope.content = 'Save successfully';
                            }
                        });
                    }
                    if (flag === 'place') {
                        $scope.isDishtip = true;
                    }
                }else{
                    $modal.open({
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
        $scope.charge = function() {
            //$scope.isDishEmpty = true;
            var dishData = $scope.dishData;
            $scope.params = $scope.dishData;
            console.log($scope.dishData);
            var modalProcess = $modal.open({
                templateUrl : 'tpl/modelChargeloading.html',
                size : 'lg-plus',
                resolve:{
                    params:function(){
                        return $scope.params;
                    }
                },
                controller : function($scope,params){
                    $scope.orderNumber = '#'+params.number;
                    $scope.cancel = function(){
                        modalProcess.dismiss('cancel');
                    };
                }
            });
            fac.charge({OrderTotal:$scope.dishData.order.mposfb.amount/100},function(data){
                setTimeout(function(){
                    modalProcess.dismiss('cancel');
                },100);
                if (data === 'failure') {
                    $modal.open({
                        templateUrl : 'tpl/modelFailMsg.html',
                        size : 'lg-plus',
                        controller : function($scope){
                            $scope.orderNumber = '#' + dishData.number;
                        }
                    });
                    return;
                }
                if (data === 'ipTip') {
                    var ipModel = $modal.open({
                        templateUrl : 'tpl/modelIpMsg.html',
                        size : 'lg-plus',
                        controller : function($scope){
                            $scope.orderNumber = '#' + dishData.number;
                            $scope.jumpSet = function(){
                                $state.go('app.settings',{jump:"checkout"},{reload : true});
                                ipModel.dismiss('cancel');
                            };
                        }
                    });
                    return;
                }
                //=====start===== function => save for history
                $scope.dishData.order.mposfb.type = "receipt";
                var order = angular.copy($scope.dishData);
                angular.forEach(order.order.mposfb.items,function(item){
                    delete item.bgImg;
                });
                order.order.mposfb.is_payment = true;
                order.order.mposfb.server = $scope.server.selected;
                order.order.mposfb.merchant = localStorage.getItem("merchant");
                fac.backSaveOrder({params:JSON.stringify(order.order)},function(rst){
                    $scope.dishData.order.id = rst.id;
                    console.log('change receipt');
                });
                //=====end=====
                
                //=====start===== get receipt base data
                var receiptData = {},restaurantData = {},header = $scope.dishData.order;
                fac.getReceiptTemp({ merchant:localStorage.getItem("merchant") },function(data){
                    receiptData = data.mposfb;
                });
                fac.getRestaurant({ merchant:localStorage.getItem("merchant") },function(returnObj){
                    if(returnObj.success && returnObj.results && returnObj.results.length>0){
                        var resObj = returnObj.results[0];
                        restaurantData = resObj.mposfb;
                        fac.getRestaurantImg({ id:resObj.id },function(data){
                            restaurantData.img = data;
                        });
                    }
                });
                //=====end=====
                
                var successModal = $modal.open({
                    templateUrl : 'tpl/modelChargeMsg.html',
                    size : 'lg-plus',
                    controller : function($scope){
                        $scope.orderNumber = '#' + dishData.number;
                        $scope.back = function(){
                            successModal.dismiss('cancel');
                        };
                        $scope.viewReceipt = function(){
                            console.log(receiptData,restaurantData);
                            successModal.close();
                            if($.isEmptyObject(restaurantData)){
                                var modelToset = $uibModal.open({
                                    templateUrl : 'tpl/modelWhether.html',
                                    size : 'sm-plus',
                                    controller:function($scope){
                                        $scope.title = "Restaurant and Receipt is not set!";
                                        $scope.discard = function(){
                                            modelToset.close();
                                        };
                                        $scope.cancel = function(){
                                            modelToset.dismiss('cancel');
                                        };
                                    }
                                });
                                modelToset.result.then(function(){
                                    $state.go('app.settings');
                                },function(){
                                    $state.go('app');
                                });
                                return false;
                            }
                            $scope.receiptParams = {
                                showBack:true,
                                imgCss:{"background-image":"url("+restaurantData.img+")"},
                                headerCss:{"background-color":receiptData.color},
                                showLogo:receiptData.showLogo,
                                showInfo:receiptData.showInfo,
                                title:receiptData.header,
                                dishs:header.mposfb.items,
                                number:header.mposfb.number,
                                amount:header.mposfb.amount,
                                time:header.mposfb.modify_at.split(' ')[0],
                                mark:receiptData.desc,
                                customerMsg:{
                                    tel:restaurantData.phone,
                                    site:restaurantData.link,
                                    addr:restaurantData.facebook
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
                                        receiptModal.dismiss('cancel');
                                    };
                                    $scope.print = function(){
                                        preview();
                                    };
                                    $scope.sendEmail = function(){

                                    };
                                }
                            });
                            receiptModal.result.then(function(){
                                
                            },function(){
                                $state.go('app');
                            });
                        };
                    }
                });
                successModal.result.then(function(){
                                
                },function(){
                    $state.go('app');
                });
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
        $scope.touchStartOrder = function(){
            if(event.target.tagName.toLowerCase()!=="input"){
                $(".btn-bg").focus();
            }
        }
    }]).controller('ModalInstanceCtrl',function($scope,$modalInstance,addParams){
        $scope.qty = {
            count:1,
            up:function(){
                this.count++;
            },
            down:function(){
                if (this.count === 1) {
                    return;
                }
                this.count--;
            }
        };
        $scope.addParams = addParams;
        $scope.addDishOk = function(){
            angular.extend($scope.addParams,{count:$scope.qty.count});
            $modalInstance.close($scope.addParams);
        };
        $scope.addDishCancel = function(){
            $modalInstance.dismiss('cancel');
        };
    });

    /**
    * Request a service and return an object
    */
    app.factory('fb.dish.dishFactory', ['$http',function($http){
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
            getStatus:function(callback){
                if(localStorage.getItem("isAddItem")==="true"){
                    var url = "http://" + localStorage.getItem("clientip") + ":8080/pos?Action=Status&Format=Json";
                    $http.get(url).success(function(data){
                        return callback && callback(data);
                    }).error(function(data,header,config,status){
                        return callback && callback(data);
                    });
                }
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
            },
            getCategory:function(callback){
                $http({
                    method: 'POST',
                    data:{merchant:localStorage.getItem("merchant")},
                    url: '/getCategory'
                }).success(function(data, header, config, status) {
                    if (data.success) {
                        return callback && callback(data.results);
                    }
                });
            },
            getDish:function(params,callback){
                angular.extend(params,{merchant:localStorage.getItem("merchant")});
                $http({
                    method: 'POST',
                    url: '/getItems',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data.success) {
                        return callback && callback(data.results);
                    }
                });
            },
            getModifiers:function(params,callback){
                angular.extend(params,{merchant:localStorage.getItem("merchant")});
                $http({
                    method: 'POST',
                    url: '/getModifier',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data.success) {
                        return callback && callback(data.results);
                    }
                });
            },
            backSaveOrder:function(params,callback){
                $http({
                    method: 'POST',
                    url: '/saveOrder',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                });
            },
            addItem:function(params,callback){
                if(localStorage.getItem("isAddItem")==="true"){
                    if(localStorage.getItem("clientip")){
                        var url = "http://"+localStorage.getItem("clientip");
                        url +=":8080/pos?Action=AddItem&Format=Json&Order="+params.number;
                        url +="&ItemID="+params.id+params.summary;//params.amount.name
                        url +="&Type=Sku&TypeValue=SKU636362&UPC=UPC343245&Quantity="+params.count;
                        url +="&Description="+params.name;
                        url +="&Amount="+(params.amount/100);
                        url +="&TaxAmount=0";
                        url +="&OrderTotal="+(params.orderTotal/100);
                        url +="&OrderTax=0";
                        url +="&Category=None&DisplayOverride=&DisplayCustomSubTotal=";
                        $http.get(url).success(function(data){
                            if (data.Status === "Success") {
                                return callback && callback(data);
                            }
                        });
                    }
                }
            },
            updateItem:function(params,callback){
                if(localStorage.getItem("isAddItem")==="true"){
                    if(localStorage.getItem("clientip")){
                        var url = "http://"+localStorage.getItem("clientip");
                        url +=":8080/pos?Action=UpdateItem&Format=Json&Order="+params.number;
                        url +="&TargetItemID="+params.id+params.summary;//
                        url +="&Type=Sku&TypeValue=SKU636362&UPC=UPC343245&Quantity="+params.count;
                        url +="&Description="+params.name;
                        url +="&Amount="+(params.amount/100);
                        url +="&TaxAmount=0";
                        url +="&OrderTotal="+(params.orderTotal/100);
                        url +="&OrderTax=0";
                        url +="&Category=None&DisplayOverride=&DisplayCustomSubTotal=";
                        $http.get(url).success(function(data){
                            if (data.Status === "Success") {
                                return callback && callback(data);
                            }
                        });
                    }
                }
            },
            deleteItem:function(params,callback){
                if(localStorage.getItem("isAddItem")==="true"){
                    if(localStorage.getItem("clientip")){
                        var url = "http://"+localStorage.getItem("clientip");
                        url +=":8080/pos?Action=DeleteItem&Format=Json&Order="+params.number;
                        url +="&TargetItemID="+params.id+params.summary;//
                        url +="&Type=Sku&TypeValue=SKU636362&UPC=UPC343245&Quantity="+params.count;
                        url +="&Description="+params.name;
                        url +="&Amount="+(params.amount.price/100);
                        url +="&TaxAmount=0";
                        url +="&OrderTotal="+(params.orderTotal/100);
                        url +="&OrderTax=0";
                        url +="&Category=None&DisplayOverride=&DisplayCustomSubTotal=";
                        $http.get(url).success(function(data){
                            if (data.Status === "Success") {
                                return callback && callback(data);
                            }
                        });
                    }
                }
            },
            deleteNewOrder:function(params){
                if(localStorage.getItem("clientip")){
                    var url = "http://"+localStorage.getItem("clientip");
                    url +=":8080/pos?Action=Cancel&Format=Json&Order="+params.number;
                    $http.get(url).success(function(data){
                        console.log(data);
                    });
                }
            },
            charge:function(params,callback){
                //return callback && callback('');
                if(localStorage.getItem("clientip") && localStorage.getItem("clientip") != ''){
                    var url = "http://"+localStorage.getItem("clientip");
                    url +=":8080/pos?TransportKey=188a712a-d2b3-40bd-b6a6-4e9b4e702393&Format=Json&OrderTax=0&OrderTotal="+params.OrderTotal;
                    $http.get(url).success(function(data){
                        if(data.Status == "SUCCESS" || data.Status == "APPROVED"){
                            return callback && callback(data);
                        }else{
                            return callback && callback('failure');
                        }
                    }).error(function(){
                        return callback && callback('failure');
                    });
                }else{
                    return callback && callback('ipTip');
                }
            },
            deleteOrder:function (params,callback) {
                angular.extend(params,{merchant:localStorage.getItem("merchant")})
                $http({
                    method: 'POST',
                    url: '/deleteOrder',
                    data:params
                }).success(function(data, header, config, status) {
                    if (data) {
                        return callback && callback(data);
                    }
                }).error(function(data, header, config, status){
                    return callback && callback(data);
                });
            },
            calcAmount:function(dishs){
                var sumPrice = 0,qtys = 0;
                dishs.forEach(function(dish){
                    qtys = qtys + dish.count;
                    sumPrice += (dish.unit_price * dish.count);
                });
                return {
                    amount:sumPrice,
                    dishes:dishs.length,
                    items_count:qtys
                };
            }
        };
    }]);


    app.directive('toasterDish',function(){
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            scope:{"isDishtip":"="},
            template:'<div class="toaster-bottom" ng-class={"toaster-slide":isDishtip}>order placed.</div>',
            controller:function($scope, $element){

            },
            link: function(scope, el, attrs,$timeout) {
                scope.isDishtip = false;
                scope.$watch('isDishtip', function(newValue, oldValue, scope) {
                    if(newValue != oldValue){
                        setTimeout(function(){
                            scope.$apply(function(){
                                scope.isDishtip = false;
                            });
                        },2500);
                    }
                }, false);
                
            }
        };
    });

    app.filter("priceRange",function(){
        return function(prices){
            var ps = [];
            if (prices.length > 1) {
                prices.forEach(function(p){
                    ps.push(p.price);
                });
                return (Math.min.apply(null,ps)/100).formatMoney(2,'$') + ' ~ ' + (Math.max.apply(null,ps)/100).formatMoney(2,'');
            }
            if (prices && prices.length === 0) {
                return '0.00';
            }
            if (prices && prices.length > 0) {
                return (prices[0].price/100).formatMoney(2,'$');
            }
            return '';
        };
    }).filter("brackets",function(){
        return function(sizename){
            if (sizename === "" || sizename === undefined) {
                return "";
            }else{
                return '('+sizename+')';
            }
        };
    }).filter("moneyBrackets",function(){
        return function(option){
            if (angular.isObject(option)) {
                return '(+$'+option.price/100+' '+option.name+')';
                /*if (option.isCheck) {
                    return '(+$'+option.price/100+' '+option.name+')';
                }else{
                    return "";
                } */               
            }else{
                return "";
            }
        };
    }).filter("nonEmpty",function(){
        return function(obj){
            var ms = [];
            if (!angular.isDefined(obj)) {
                return ms;
            }
            for(var i=0,L=obj.length;i<L;i++){
                if (obj[i].name !== "") {
                    ms.push(obj[i]);
                }
            }
            return ms;
        };
    });
    Number.prototype.formatMoney = function (places, symbol, thousand, decimal) {
        places = !isNaN(places = Math.abs(places)) ? places : 2;
        symbol = symbol !== undefined ? symbol : "$";
        thousand = thousand || ",";
        decimal = decimal || ".";
        var number = this,
            negative = number < 0 ? "-" : "",
            i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
            j = (j = i.length) > 3 ? j % 3 : 0;
        return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
    };
    return app;
 }));
