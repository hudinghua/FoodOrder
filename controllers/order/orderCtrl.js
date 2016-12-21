/**
 * Created by Warren Li on 1/8/2016.
 */
/**
 * 订单数据的添加和查询
 */
var order = {};

module.exports = order;

var orderService = require('./orderService');

/**
 * 获取布局及列表数据
 */
order.saveOrder = function(req,res){
    var params = {};
    params = JSON.parse(req.body.params);
    var userName = req.session.userName;
    orderService.saveOrder(userName,params).then(function(result){
        if(result){
            res.send(result);
        }else{
            res.send({success:false,message:"Failure"});
        }
    });
};

/**
 * 查询所有订单信息
 * @param req
 * @param res
 */
order.queryOrder = function(req,res){
    var merchant = req.body.merchant;
    orderService.queryOrder(merchant).then(function(result){
        if(result){
            res.send(result);
        }else{
            res.send({success:false,message:"Failure"});
        }
    });
};

/**
 * 查询所有订单历史记录
 * @param req
 * @param res
 */
order.queryHistory = function(req,res){
    var merchant = req.body.merchant;
    orderService.queryHistory(merchant).then(function(result){
        if(result){
            res.send(result);
        }else{
            res.send({success:false,message:"Failure"});
        }
    });
};


/**
 * 删除订单
 * @param req
 * @param res
 */
order.deleteOrder = function(req,res){
    var id = req.body.id;
    orderService.deleteOrder(id).then(function(result){
        if(result){
            res.send(result);
        }else{
            res.send({success:false,message:"Failure"});
        }
    });
};