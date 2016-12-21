/**
 * Created by Warren Li on 29/7/2016.
 */

/**
 * App附件管理
 */
var attachmentCtrl = {};

module.exports = attachmentCtrl;

var attachmentService = require('./attachmentService');

/**
 * 通过ID获取数据
 */

attachmentCtrl.getAttachment = function(req,res){
    var id = req.body.id;
    attachmentService.getAttachment(id,req).then(function(data){
        if(data){
            res.send(data);
        }else{
            res.send(null);
        }
    });
};