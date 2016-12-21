/**
 * Created by Warren Li on 4/8/2016.
 */
/**
 * 菜单
 */
var item = {};

module.exports = item;

var itemService = require('./itemService');

/**
 * 获取菜单类别
 */
item.getCategory = function(req,res){
    var merchant = req.body.merchant;
    itemService.getCategory(merchant).then(function(result){
        if(result.success){
            res.send(result);
        }else{
            res.send({success:false,message:"Failure"});
        }
    });
};

/**
 * 获取菜单
 */
item.getItems = function(req,res){
    var params = {};
    params.categoryId = req.body.categoryId;
    params.limit = req.body.limit || 20;
    params.offset = req.body.offset || 0;
    params.merchant = req.body.merchant;

    itemService.getItems(params).then(function(result){
        if(result.success){
            res.send(result);
        }else{
            res.send({success:false,message:"Failure"});
        }
    });
};

/**
 * 获取modifier
 * **/
item.getModifier = function(req,res){
    var ids = [];
    ids = JSON.parse(req.body.ids);

    itemService.getModifier(ids).then(function(result){
        if(result.success){
            res.send(result);
        }else{
            res.send({success:false,message:"Failure"});
        }
    });
};