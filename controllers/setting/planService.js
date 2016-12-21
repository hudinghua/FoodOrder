/**
 * Created by hudinghua on 2016/11/10
 */


var planService = {};

module.exports = planService;

var couchbaseDB = require('./../couchbaseDB');
var Q = require("q");
var uuid = require('node-uuid');
var common = require('../common/common');

/**
 * 获取桌椅信息
 * @param params
 * @returns Promise
 */
planService.getPlan = function(merchant){
	var deferred = Q.defer();
	var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "floor" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:planService>>>>>>>getPlan>>>>>>>"+err);
            }else{
            	retrunObj.success = true;
                retrunObj.results = results;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("ERROR:planService>>>>>>>getPlan>>>>>>>"+e);
    }
	return deferred.promise;
}

/**
 * 保存桌椅信息
 * @param params
 * @returns Promise
 */
planService.savePlan = function(params,userName){
	var deferred = Q.defer();
	var id = null,saveObj={};
    var  retrunObj = {
        success : false
    };
    try{
    	//saveObj = params;
        saveObj["type"] = "floor";
        saveObj["merchant"] = couchbaseDB.index;
        saveObj["modify_at"] = common.getNowFormatDate();
        saveObj["modify_by"] = userName;
        saveObj["designData"] = [];
        saveObj["designData"].push({
        	"groupName": "Zone Name",
            "name": "Zone Name",
            "zones": [{
               "xposition": 0,
               "yposition": 0,
               "width": params.size.W,
               "height": params.size.H,
               "tables": params.desks
            }]
        });
		if (params.id) {
    		id = params.id;
    		saveObj["id"] = id;
            couchbaseDB.getBucket().upsert(id,saveObj,function(err, response) {
                if (err) {
                    retrunObj["message"] = err;
                }else{
                    retrunObj["id"] = id;
                    retrunObj["success"] = true;
                    retrunObj["message"] = "success";
                }
                deferred.resolve(retrunObj);
            });
    	}else{
    		id = "f-p:"+uuid.v1();
    		saveObj["id"] = id;
    		saveObj["created_at"] = common.getNowFormatDate();
        	saveObj["created_by"] = userName;
    		var insertOrder = couchbaseDB.N1qlQuery.fromString('INSERT INTO `'+couchbaseDB.index+'` (KEY, VALUE) VALUES ($1, $2)');
            couchbaseDB.getBucket().query(insertOrder, [id, saveObj], function (err, result) {
                if (err) {
                    retrunObj["message"] = err;
                }else{
                    retrunObj["id"] = id;
                    retrunObj["success"] = true;
                    retrunObj["message"] = "success";
                }
                deferred.resolve(retrunObj);
            });
		}
    }catch (e){
        console.log("ERROR:planService>>>>>>>savePlan>>>>>>>"+e);
    }
    return deferred.promise;
}

/**
 * 删除桌椅信息
 * @param params
 * @returns Promise
 */
planService.deletePlan = function(params){
	var deferred = Q.defer();
    var  retrunObj = {
        success : false
    };
    try{
        couchbaseDB.bucket.remove(params.id,function(err, results) {
            if(err){
                console.log("ERROR:planService>>>>>>>deletePlan>>>>>>>"+err);
            }else{
                retrunObj.success = true;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("ERROR:planService>>>>>>>deletePlan>>>>>>>"+e);
    }
    return deferred.promise;
}




