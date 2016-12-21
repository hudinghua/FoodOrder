/**
 * Created by Warren.li on 2016/9/29 0029.
 */

var layoutService = require('../layout/layoutService');
var orderService = require('../order/orderService');
var config = require('../../public/config.json');
var io = require('socket.io').listen(config.socketPort);

/**
 * Socket 管理
 */
io.sockets.on('connection', function (socket) {

    socket.on('dish',function(data){
        var id = data.id;
        var bucket = data.bucket;
        orderService.getOrder(id,bucket).then(function(orderData){
            socket.emit('dish', orderData);
        });
    });
    socket.on('floor',function(data){
        var bucket = data.bucket;
        layoutService.getLayout(bucket).then(function(layoutData){
            orderService.queryOrder(bucket).then(function(orderData){
                socket.emit('floor', { layoutData: layoutData,orderData : orderData });
            });
        });
    });

});
