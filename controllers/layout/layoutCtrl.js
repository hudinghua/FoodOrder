/**
 * Created by Warren Li on 27/7/2016.
 */
/**
 * 桌子布局及列表数据
 */
var layout = {};

module.exports = layout;

var layoutService = require('./layoutService');

/**
 * 获取布局及列表数据
 */
layout.getLayout = function(req,res){
    var merchant = req.body.merchant;
    layoutService.getLayout(merchant).then(function(result){
        if(result.success){
            res.send(result);
        }else{
            res.send({success:false,message:"Failure"});
        }
    });
};
