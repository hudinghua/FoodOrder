/**
 * Created by hudinghua on 2016/11/07
 */


var restaurantService = {};

module.exports = restaurantService;

var couchbaseDB = require('./../couchbaseDB');
var Q = require("q");
var uuid = require('node-uuid');
var util = require('util'); 
//var attachmentService = require("../attachment/attachmentService");
var common = require('../common/common');
/**
 * 获取基本信息Bussiness图
 * @param merchant
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
restaurantService.getImage = function (params) {
	var deferred = Q.defer();
	common.getAttachment(params.id).then(function(rst){
		deferred.resolve(rst);
	});
	return deferred.promise;
}
/**
 * 获取基本信息
 * @param merchant
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
restaurantService.getRestaurant = function (merchant) {
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "restaurant" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:restaurantService>>>>>>>getRestaurant>>>>>>>"+err);
            }else{
            	retrunObj.success = true;
	            retrunObj.results = results;
            }
            
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("restaurantService>>>>>>>getRestaurant>>>>>>>"+e);
    }
    return deferred.promise;
}
/**
 * 保存基本信息
 * @param params
 * @returns {jQuery.promise|*|promise.promise|Promise}
 */
restaurantService.saveRestaurant = function(params,userName){
    var deferred = Q.defer();
    var id = null,saveObj={};
    var  retrunObj = {
        success : false,
        id : id
    };
    try{
    	saveObj = params.data;
        saveObj["type"] = "restaurant";
    	if (params.id) {
    		id = params.id;
            saveObj["modify_at"] = common.getNowFormatDate();
            saveObj["modify_by"] = userName;
            couchbaseDB.bucket.upsert(id,saveObj,function(err, response) {
                if (err) {
                    retrunObj["message"] = err;
                }else{
                    retrunObj["success"] = true;
                    retrunObj["id"] = id;
                    retrunObj["message"] = "success";
                    deferred.resolve(retrunObj);
                }
            });
    	}else{
    		id = "r:"+uuid.v1();

            saveObj["created_at"] = common.getNowFormatDate();
            saveObj["created_by"] = userName;
            couchbaseDB.bucket.insert(id,saveObj,function(err, response) {
                if (err) {
                    retrunObj["message"] = err;
                    deferred.resolve(retrunObj);
                }else{
                    couchbaseDB.bucket.get(id, function(err, res) {
                        retrunObj["success"] = true;
                        retrunObj["id"] = id;
                        retrunObj["message"] = "success";
                        deferred.resolve(retrunObj);
                    });
                    
                }
            });
    	}
    }catch (e){
        console.log("restaurantService>>>>>>>saveRestaurant>>>>>>>"+e);
    }

    return deferred.promise;
};

/*util.clone = function clone(obj){  
    function Fn(){};
    Fn.prototype = obj;  
    var o = new Fn();  
    for(var a in o){  
        if(typeof o[a] == "object") {  
            o[a] = clone(o[a]);  
        }  
    }  
    return o;  
};
Object.prototype.clone = function () {
    var Constructor = this.constructor;
    var obj = new Constructor();

    for (var attr in this) {
        if (this.hasOwnProperty(attr)) {
            if (typeof(this[attr]) !== "function") {
                if (this[attr] === null) {
                    obj[attr] = null;
                }
                else {
                    obj[attr] = this[attr].clone();
                }
            }
        }
    }
    return obj;
};*/