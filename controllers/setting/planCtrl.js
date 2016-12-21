/**
 * Created by hudinghua on 2016/11/10
 */
var plan = {};

module.exports = plan;

var planService = require('./planService');

/**
 * 获取桌椅信息
 * @param params
 * @returns Promise
 */
plan.getPlan = function(req,res){
    var merchant = req.body.merchant;
    
    planService.getPlan(merchant).then(function(result){
        res.send(result);
    });
};

/**
 * 保存桌椅信息
 * @param params
 * @returns Promise
 */
plan.savePlan = function(req,res){
    var params = req.body;
    var userName = req.session.userName;

    planService.savePlan(params,userName).then(function(result){
        res.send(result);
    });
};

/**
 * 删除桌椅信息
 * @param params
 * @returns Promise
 */
plan.deletePlan = function(req,res){
    var params = req.body;
    
    planService.deletePlan(params).then(function(result){
        res.send(result);
    });
};