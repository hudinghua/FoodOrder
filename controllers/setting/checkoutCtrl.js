/**
 * Created by hudinghua on 2016/11/10
 */
var checkout = {};

module.exports = checkout;

var checkoutService = require('./checkoutService');

/**
 * 获取设备信息
 * @param params
 * @returns Promise
 */
checkout.getCheckout = function(req,res){
    var userId = req.session.userId;
    var merchant = req.body.merchant;
    checkoutService.getCheckout(userId,merchant).then(function(result){
        res.send(result);
    });
};

/**
 * 保存设备信息
 * @param params
 * @returns Promise
 */
checkout.saveCheckout = function(req,res){
    var params = req.body;
    checkoutService.saveCheckout(params,req).then(function(result){
        res.send(result);
    });
};

/**
 * 删除设备信息
 * @param params
 * @returns Promise
 */
checkout.deleteCheckout = function(req,res){
    var params = req.body;
    
    checkoutService.deleteCheckout(params).then(function(result){
        res.send(result);
    });
};