/**
 * Created by hudinghua on 2016/11/10
 */


var checkoutService = {};

module.exports = checkoutService;

var couchbaseDB = require('./../couchbaseDB');
var Q = require("q");
var uuid = require('node-uuid');
var common = require('../common/common');

/**
 * 获取员工信息
 * @param params
 * @returns Promise
 */
checkoutService.getCheckout = function(userId,merchant){
	var deferred = Q.defer();
	var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "checkout" AND userId="'+userId+'" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:checkoutService>>>>>>>getCheckout>>>>>>>"+err);
            }else{
            	retrunObj.success = true;
                retrunObj.results = results;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("ERROR:checkoutService>>>>>>>getCheckout>>>>>>>"+e);
    }
	return deferred.promise;
}

/**
 * 保存员工信息
 * @param params
 * @returns Promise
 */
checkoutService.saveCheckout = function(params,req){
	var deferred = Q.defer();
	var id = null,saveObj={};
    var  retrunObj = {
        success : false
    };
    try{
    	saveObj = params;
        saveObj["type"] = "checkout";
        saveObj["merchant"] = req.session.merchant;
        saveObj["modify_at"] = common.getNowFormatDate();
        saveObj["modify_by"] = req.session.userName;
        saveObj["userId"] = req.session.userId;
		if (params.id) {
    		id = params.id;
            couchbaseDB.getBucket().upsert(id,saveObj,function(err, response) {
                if (err) {
                    retrunObj["message"] = err;
                }else{
                    retrunObj["id"] = id;
                    retrunObj["success"] = true;
                    retrunObj["message"] = "success";
                    retrunObj["created_at"] = saveObj["created_at"]
                    retrunObj["created_by"] = saveObj["created_by"]
                }
                deferred.resolve(retrunObj);
            });
    	}else{
    		id = "s-a:"+uuid.v1();
    		saveObj["id"] = id;
    		saveObj["created_at"] = common.getNowFormatDate();
        	saveObj["created_by"] = req.session.userName;
    		var insertOrder = couchbaseDB.N1qlQuery.fromString('INSERT INTO `'+couchbaseDB.index+'` (KEY, VALUE) VALUES ($1, $2)');
            couchbaseDB.getBucket().query(insertOrder, [id, saveObj], function (err, result) {
                if (err) {
                    console.log("ERROR:checkoutService>>>>>>>saveCheckout>>>>>>>"+err);
                }else{
                    retrunObj["id"] = id;
                    retrunObj["success"] = true;
                    retrunObj["message"] = "success";
                    retrunObj["created_at"] = saveObj["created_at"]
                    retrunObj["created_by"] = saveObj["created_by"]
                }
                deferred.resolve(retrunObj);
            });
		}
    }catch (e){
        console.log("ERROR:checkoutService>>>>>>>saveCheckout>>>>>>>"+e);
    }
    return deferred.promise;
}

/**
 * 删除员工信息
 * @param params
 * @returns Promise
 */
checkoutService.deleteCheckout = function(params){
	var deferred = Q.defer();
    var  retrunObj = {
        success : false
    };
    try{
        couchbaseDB.bucket.remove(params.id,function(err, results) {
            if(err){
                console.log("ERROR:checkoutService>>>>>>>deleteCheckout>>>>>>>"+err);
            }else{
                retrunObj.success = true;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("ERROR:checkoutService>>>>>>>deleteCheckout>>>>>>>"+e);
    }
    return deferred.promise;
}