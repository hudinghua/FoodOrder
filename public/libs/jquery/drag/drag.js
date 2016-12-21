/* global require,module */
'use strict';

var $window = $(window);
var $document = $(document);
var isTouch = (navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|Windows Phone)/i))?true:false;//'createTouch' in document;
var html = document.documentElement;
var isIE6 = !('minWidth' in html.style);
var isLosecapture = !isIE6 && 'onlosecapture' in html;
var isSetCapture = 'setCapture' in html;

function noop() {}

function preventDefault() {
    return false;
}

var eventTypes = {
    start: isTouch ? 'touchstart' : 'mousedown',
    move: isTouch ? 'touchmove' : 'mousemove',
    end: isTouch ? 'touchend' : 'mouseup'
};

var touchId = 0;
var getEvent = isTouch ? function(event, touchId) {
    return (event.touches || event.originalEvent.touches)[touchId];
} : function(event) {
    return event;
};

/**
 * 拖拽事件类，解决浏览器兼容问题
 * @constructor
 */
function Drag(elem,scope, event) {
    if (elem) {
        return new Drag.create(elem, scope, event);
    }
    this.start = $.proxy(this.start, this);
    this.move = $.proxy(this.move, this);
    this.end = $.proxy(this.end, this);
}

Drag.prototype = {

    constructor: Drag,

    start: function(event) {

        this.touchId = touchId;
        event = getEvent(event, touchId);
        touchId++;

        this.target = $(event.target);

        $document.on('selectstart', preventDefault).on('dblclick', this.end);

        if (isLosecapture) {
            this.target.on('losecapture', this.end);
        } else {
            $window.on('blur', this.end);
        }

        if (isSetCapture) {
            this.target[0].setCapture();
        }

        $document.on(eventTypes.move, this.move).on(eventTypes.end, this.end);

        this.onstart(event);
        return false;
    },

    move: function(event) {
        event = getEvent(event, this.touchId);
        this.onmove(event);
        return false;
    },

    end: function(event) {
        this.touchId = touchId;
        event = getEvent(event, touchId);
        touchId--;

        $document.off('selectstart', preventDefault).off('dblclick', this.end);

        if (isLosecapture) {
            this.target.off('losecapture', this.end);
        } else {
            $window.off('blur', this.end);
        }

        if (isSetCapture) {
            this.target[0].releaseCapture();
        }

        $document.off(eventTypes.move, this.move).off(eventTypes.end, this.end);

        this.onend(event);
        return false;
    }

};

/**
 * @constructor
 * @param   {HTMLElement}   被拖拽的元素
 * @param   {Event}         触发拖拽的事件对象。若无则监听 elem 的按下事件启动
 */
Drag.create = function(elem, scope, event) {

    var $elem = $(elem);
    var drag = this;
    var dragEvent = new Drag();
    var panelScope;

    var x, y, startLeft, startTop, clientX, clientY;

    if (scope) {
        panelScope = scope.$parent;
    }

    dragEvent.onstart = function(event) {
        var $wrap = elem.parentNode.nodeName === 'BODY' ?
            $document : $elem.offsetParent();

        var position = $elem.position();
        var l = position.left;
        var t = position.top;
        x = startLeft = l;
        y = startTop = t;
        clientX = event.clientX;
        clientY = event.clientY;

        drag.onstart(event);
    };

    dragEvent.onmove = function(event) {
        var style = elem.style;
        x = event.clientX - clientX + startLeft;
        y = event.clientY - clientY + startTop;
        style.left = x + 'px';
        style.top = y + 'px';
        if (scope) {
            if (isTouch) {
                scope.position = {x:Math.ceil(x),y:Math.ceil(y),isCalc:true,isDraw:false};
            }else{
                scope.position = {x:x,y:y,isCalc:true,isDraw:false};
            }
            
        }
        drag.onmove(event);
    };

    dragEvent.onend = function(event) {
        var style = elem.style,
            left = 20*Math.round(x/20),
            top = 20*Math.round(y/20);

        style.left = left + 'px';
        style.top = top + 'px';
        if (scope) {
            if (isTouch) {
                scope.$apply(function(){
                    scope.position = {x:left,y:top,isCalc:false,isDraw:true};
                });
            }else{
                scope.position = {x:left,y:top,isCalc:false,isDraw:true};
            }
            //scope.$emit('hasChange', scope.position, elem.dataset.table);
        }

        drag.onend(event);
    };

    if (event) {
        // TODO onstart 事件此时可能还没注册
        dragEvent.start(event);
    } else {
        $elem.on(Drag.START, dragEvent.start);
        this.destroy = function() {
            $elem.off(Drag.START, dragEvent.start);
        };
    }
};

Drag.START = eventTypes.start;
Drag.MOVE = eventTypes.move;
Drag.END = eventTypes.end;

Drag.create.prototype = {
    constructor: Drag.create,
    onstart: noop,
    onmove: noop,
    onend: noop,
    destroy: noop
};