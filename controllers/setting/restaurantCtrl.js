/**
 * Created by hudinghua on 2016/11/07
 */

/**
 * 发票模板数据的管理
 */
var restaurant = {};

module.exports = restaurant;

var restaurantService = require('./restaurantService');
var common = require('../common/common');

/**
 * 获取基本信息Bussiness图
 */
restaurant.getImage = function(req,res){
    var params = req.body;
    
    restaurantService.getImage(params).then(function(result){
        res.send(result);
    });
};

/**
 * 获取基本信息
 */
restaurant.getRestaurant = function(req,res){
    var merchant = req.body.merchant;
    
    restaurantService.getRestaurant(merchant).then(function(result){
        res.send(result);
    });
};

/**
 * 保存基本信息
 */
restaurant.saveRestaurant = function(req,res){
    var params = req.body;
    var userName = req.session.userName;
    restaurantService.saveRestaurant(params,userName).then(function(result){
        res.send(result);
        /** 是否需要上传附件 **/
        if(result.success && params.isImgChange){
            var documentId = result.id;
            common.getRevId(documentId).then(function(result){
                 var revId = result.revId;
                 var imgBase64 = params.image64.split(",")[1];
                 common.upload({
                     documentId : documentId,
                     rev : revId,
                     buffer : imgBase64
                 });
            });
        }
    });
};