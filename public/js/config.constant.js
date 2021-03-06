//config lazyload

fbApp.constant('JQ_CONFIG', {
    printArea:['./libs/jquery/printarea/jquery-ui-1.10.4.custom.min.js',
                './libs/jquery/printarea/jquery.PrintArea.js',
                './libs/jquery/printarea/jquery-ui-1.10.4.custom.min.css'],
    slimScroll:['./libs/jquery/printarea/PrintArea.css'],
    scroll:['./libs/jquery/scroll/jquery.mCustomScrollbar.css','./libs/jquery/scroll/jquery.mCustomScrollbar.concat.min.js'],
    drag:['./libs/jquery/drag/drag.js']
})
.constant('MODULE_CONFIG', [
    {
        name:"fb.scroll",
        module:true,
        files:[
            'js/common/scroll.js'
        ]
    },
    {
        name:"fb.floor",
        module:true,
        files:[
            'js/floor/floor.js'
        ]
    },
    {
        name:"fb.menu",
        module:true,
        files:[
            'js/floor/menu.js'
        ]
    },
    {
        name:"fb.addorder",
        module:true,
        files:[
            'js/floor/addorder.js'
        ]
    },
    {
        name:"fb.dish",
        module:true,
        files:[
            'js/dish/dish.js'
        ]
    },
    {
        name:"fb.setting",
        module:true,
        files:[
            'js/setting/setting.js'
        ]
    },
    {
        name:"fb.restaurant",
        module:true,
        files:[
            'js/setting/restaurant.js'
        ]
    },
    {
        name:"fb.staff",
        module:true,
        files:[
            'js/setting/staff.js'
        ]
    },
    {
        name:"fb.floorplan",
        module:true,
        files:[
            'js/setting/floorplan.js'
        ]
    },
    {
        name:"fb.floorplanedit",
        module:true,
        files:[
            'js/setting/floorplan_edit.js'
        ]
    },
    {
        name:"fb.menusetting",
        module:true,
        files:[
            'js/setting/menu.js'
        ]
    },
    {
        name:"fb.menuedit",
        module:true,
        files:[
            './libs/lrz/exif.js',
            './libs/lrz/lrz.js',
            'js/setting/menu_edit.js'
        ]
    },
    {
        name:"fb.menucategory",
        module:true,
        files:[
            'js/setting/menu_category.js'
        ]
    },
    {
        name:"fb.menumodifier",
        module:true,
        files:[
            'js/setting/menu_modifier.js'
        ]
    },
    {
        name:"fb.receipt",
        module:true,
        files:[
            'js/setting/receipt.js'
        ]
    },
    {
        name:"fb.checkout",
        module:true,
        files:[
            'js/setting/checkout.js'
        ]
    },
    {
        name:"fb.history",
        module:true,
        files:[
            'js/history/history.js'
        ]
    },
    {
        name:"fb.done",
        module:true,
        files:[
            'js/done/done.js'
        ]
    },
    {
        name: 'ui.select',
        module:true,
        files: [
            './libs/angular/angular-ui-select/dist/select.min.js',
            './libs/angular/angular-ui-select/dist/select.min.css'
        ]
    },
    {
        name: 'xeditable',
        module:true,
        files: [
            '../libs/angular/angular-xeditable/dist/js/xeditable.min.js',
            '../libs/angular/angular-xeditable/dist/css/xeditable.css'
        ]
    },
    {
        name: 'toaster',
        files: [
            './libs/angular/angularjs-toaster/toaster.js',
            './libs/angular/angularjs-toaster/toaster.css'
        ]
    }
])
.config(['$ocLazyLoadProvider', 'MODULE_CONFIG', function($ocLazyLoadProvider, MODULE_CONFIG) {
        $ocLazyLoadProvider.config({
            debug:  false,
            events: true,
            modules: MODULE_CONFIG
        });
 }]);
