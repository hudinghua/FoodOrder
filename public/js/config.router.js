// config router

fbApp.config(['$stateProvider', '$urlRouterProvider', 'JQ_CONFIG', 'MODULE_CONFIG',
        function ($stateProvider,   $urlRouterProvider, JQ_CONFIG, MODULE_CONFIG) {
            
            $urlRouterProvider.otherwise("/app");
            $stateProvider.state('app',{
                url:'/app',
                templateUrl:'/tpl/app.html',
                controller:'fb.floor.floorController',
                //controllerAs:"appCtrl",
                resolve: loadSequence(['scroll','fb.scroll','fb.menu','fb.addorder','fb.floor'])
            })
            .state("app.settings",{
                url:"/settings",
                params: {jump:""},
                views:{
                    'settings@app':{
                        controller:'fb.setting.settingController',
                        templateUrl:"tpl/setting.html"
                    }
                },
                resolve: loadSequence(['scroll','fb.scroll','xeditable','fb.setting'])
            })
            .state("app.settings.restaurant",{
                url:"/restaurant",
                views:{
                    'restaurant@app.settings':{
                        controller:'fb.restaurant.restaurantController',
                        templateUrl:"tpl/settings/restaurant.html"
                    }
                },
                resolve: loadSequence(['fb.restaurant'])
            })
            .state("app.settings.staff",{
                url:"/staff",
                views:{
                    'staff@app.settings':{
                        controller:'fb.staff.staffController',
                        templateUrl:"tpl/settings/staff.html"
                    }
                },
                resolve: loadSequence(['fb.staff'])
            })
            .state("app.settings.floorplan",{
                url:"/floorplan",
                views:{
                    'floorplan@app.settings':{
                        controller:'fb.floorplan.floorplanController',
                        templateUrl:"tpl/settings/floorplan.html"
                    }
                },
                resolve: loadSequence(['drag','fb.floorplan','fb.floorplanedit'])
            })
            .state("app.settings.menu",{
                url:"/menu",
                views:{
                    'menu@app.settings':{
                        controller:'fb.menusetting.menusettingController',
                        templateUrl:"tpl/settings/menu.html"
                    }
                },
                resolve: loadSequence(['fb.menusetting','fb.menuedit','fb.menucategory','fb.menumodifier'])
            })
            .state("app.settings.receipt",{
                url:"/receipt",
                views:{
                    'receipt@app.settings':{
                        controller:'fb.receipt.receiptController',
                        templateUrl:"tpl/settings/receipt.html"
                    }
                },
                resolve: loadSequence(['fb.receipt'])
            })
            .state("app.settings.checkout",{
                url:"/checkout",
                views:{
                    'checkout@app.settings':{
                        controller:'fb.checkout.checkoutController',
                        templateUrl:"tpl/settings/checkout.html"
                    }
                },
                resolve: loadSequence(['fb.checkout'])
            })
            .state("app.history",{
                url:"/history",
                views:{
                    'history@app':{
                        controller:'fb.history.historyController',
                        templateUrl:"tpl/history.html"
                    }
                },
                resolve: loadSequence(['scroll','fb.scroll','printArea','fb.history'])
            })
            /*.state("app.menu",{
                url:"/menu",
                views:{
                    'menu@app':{
                        controller:'fb.menu.menuController',
                        templateUrl:"tpl/menu.html"
                    }
                },
                resolve: loadSequence('fb.menu')
            })*/
            /*.state("app.menu.settings",{
                url:"/settings",
                views:{
                    'settings@app.menu':{
                        controller:'fb.setting.settingController',
                        templateUrl:"tpl/setting.html"
                    }
                },
                resolve: loadSequence(['fb.setting'])
            })*/
            /*.state("app.addorder",{
                url:"/addorder",
                views:{
                    'addorder@app':{
                        controller:'fb.addorder.addorderController',
                        templateUrl:"tpl/addorder.html"
                    }
                },
                resolve: loadSequence('fb.addorder')
            })*/
            .state("floor",{
                url:"/floor",
                templateUrl:"tpl/floor.html",
                controller:"fb.floor.floorController",
                controllerAs:"floorCtrl",
                resolve: loadSequence('fb.floor')
            })
            .state("dish",{
                url:"/dish",
                params: {'table': null,'abledt':null},
                templateUrl:"tpl/dish.html",
                controller:"fb.dish.dishController",
                resolve: loadSequence(['scroll','fb.scroll','printArea','fb.dish'])
            })
            .state("done",{
                url:"/done",
                params: {'chargeParam': null},
                templateUrl:"tpl/done.html",
                controller:"fb.done.doneController",
                resolve: loadSequence(['fb.done'])
            });
            
            function loadSequence(srcs, callback) {
                return {
                    deps: ['$ocLazyLoad', '$q',
                        function( $ocLazyLoad, $q ){
                            var deferred = $q.defer();
                            var promise  = false;
                            srcs = angular.isArray(srcs) ? srcs : srcs.split(/\s+/);
                            if(!promise){
                                promise = deferred.promise;
                            }
                            angular.forEach(srcs, function(src) {
                                promise = promise.then( function(){
                                    var name = '';
                                    if(JQ_CONFIG[src]){
                                        return $ocLazyLoad.load(JQ_CONFIG[src]);
                                    }
                                    angular.forEach(MODULE_CONFIG, function(module) {
                                        if( module.name == src){
                                            name = module.name;
                                        }else{
                                            name = src;
                                        }
                                    });
                                    return $ocLazyLoad.load(name);
                                } );
                            });
                            deferred.resolve();
                            return callback ? promise.then(function(){ return callback(); }) : promise;
                        }]
                };
            }
        }
    ]);