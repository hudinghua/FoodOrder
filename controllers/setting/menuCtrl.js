/**
 * Created by warren.li on 2016/11/8 0008.
 */


/**
 * 菜单数据的管理
 */
var menu = {};

module.exports = menu;

var menuService = require('./menuService');
var attachmentService = require('../attachment/attachmentService');
/**
 * 获取Item列表数据
 * @param req
 * @param res
 */
menu.queryItem = function(req,res){
    var merchant = req.body.merchant;
    var start = req.body.start;
    var limit = req.body.limit;
    menuService.queryItem(merchant,start,limit).then(function(result){
        res.send(result);
    });
};

/**
 * 获取Category列表数据(name , id)
 * @param req
 * @param res
 */
menu.queryAllCategory = function(req,res){
    var merchant = req.body.merchant;
    menuService.queryAllCategory(merchant).then(function(result){
        res.send(result);
    });
};

/**
 * 保存Item数据
 * @param req
 * @param res
 */
menu.saveItem = function(req,res){
    var params = req.body;
    var userName = req.session.userName;
    var isUpload = params.isUpload;
    var imgBase64 = params.imgBase64;
    
    menuService.saveItem(params,userName).then(function(result){
        /** 是否需要上传附件 **/
        if(result.success && isUpload){
            var documentId = result.id;
            var i=0;
            var revInterval = setInterval(function(){
                i++;
                attachmentService.getRevId(documentId).then(function(resultRev){
                    if(resultRev.success){
                        clearInterval(revInterval);
                        var revId = resultRev.revId;
                        imgBase64 = imgBase64.split(",")[1];
                        attachmentService.upload({
                            documentId : documentId,
                            rev : revId,
                            buffer : imgBase64
                        }).then(function(resultUpload){
                            res.send(result);
                        });
                    }
                });
                if(i==20){
                    clearInterval(revInterval);
                }
            },200);
        }else{
            res.send(result);
        }
    });
};

/**
 * 获取Item列表数据
 * @param req
 * @param res
 */
menu.queryCategory = function(req,res){
    var merchant = req.body.merchant;
    var start = req.body.start;
    var limit = req.body.limit;
    menuService.queryCategory(merchant,start,limit).then(function(result){
        res.send(result);
    });
};

/**
 * 获取assign Item列表数据
 * @param req
 * @param res
 */
menu.queryAllItem = function(req,res){
    var merchant = req.body.merchant;
    menuService.queryAllItem(merchant).then(function(result){
        res.send(result);
    });
};


/**
 * 保存Category数据
 * @param req
 * @param res
 */
menu.saveCategory = function(req,res){
    var params = req.body;
    var userName = req.session.userName;

    menuService.saveCategory(params,userName).then(function(result){
        res.send(result);
    });
};

/**
 * 删除 Doc
 * @param req
 * @param res
 */
menu.deleteDoc = function(req,res){
    var id = req.body.id;
    menuService.deleteDoc(id).then(function(result){
        res.send(result);
    });
};

/**
 * 获取Modifier列表数据
 * @param req
 * @param res
 */
menu.queryModifier = function(req,res){
    var merchant = req.body.merchant;
    var start = req.body.start;
    var limit = req.body.limit;
    menuService.queryModifier(merchant,start,limit).then(function(result){
        res.send(result);
    });
};

/**
 * 保存Modifier数据
 * @param req
 * @param res
 */
menu.saveModifier = function(req,res){
    var params = req.body;
    var userName = req.session.userName;

    menuService.saveModifier(params,userName).then(function(result){
        res.send(result);
    });
};

/**
 * 查询所有Modifier
 * @param req
 * @param res
 */
menu.queryAllModifier = function(req,res){
    var merchant = req.body.merchant;
    menuService.queryAllModifier(merchant).then(function(result){
        res.send(result);
    });
};