/**
 * Created by warren.li on 2016/10/14 0014.
 */

/**
 * 发票模板数据的管理
 */
var receipt = {};

module.exports = receipt;

var receiptService = require('./receiptService');

/**
 * 获取布局及列表数据
 */
receipt.getReceiptTemp = function(req,res){
    var merchant = req.body.merchant;
    
    receiptService.getReceiptTemp(merchant).then(function(result){
        res.send(result);
    });
};

/**
 * 保存布局及列表数据
 */
receipt.saveReciptTemp = function(req,res){
    var params = req.body;
    var userName = req.session.userName;
    receiptService.saveReciptTemp(params,userName).then(function(result){
        res.send(result);
    });
};