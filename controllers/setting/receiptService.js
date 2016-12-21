/**
 * Created by warren.li on 2016/10/14 0014.
 */


var receiptService = {};

module.exports = receiptService;

var couchbaseDB = require('./../couchbaseDB');
var Q = require("q");
var uuid = require('node-uuid');

/**
 * 保存发票模板数据
 * @param params
 * @returns {jQuery.promise|*|promise.promise|Promise}
 */
receiptService.saveReciptTemp = function(params,userName){
    var deferred = Q.defer();
    var id = null,saveObj={};
    var  retrunObj = {
        success : false,
        id : id
    };
    try{
        /** modify **/
        if(params.id){
            id = params.id;
            saveObj = params.receiptData;
            saveObj["modify_at"] = receiptService.getNowFormatDate();
            saveObj["modify_by"] = userName;
            
            couchbaseDB.getBucket().upsert(id,saveObj,function(err, response) {
                if (err) {
                    retrunObj["message"] = err;
                }else{
                    retrunObj["success"] = true;
                    retrunObj["id"] = id;
                    retrunObj["message"] = "success";
                }
                deferred.resolve(retrunObj);
            });
        }else{/** new **/
            id = "r:"+uuid.v1();
            saveObj = params.receiptData;

            saveObj["type"] = "receiptTemp";
            saveObj["created_at"] = receiptService.getNowFormatDate();
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
        console.log("receiptService>>>>>>>saveOrder>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 获取发票模板数据
 * @param merchant
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
receiptService.getReceiptTemp = function (merchant) {
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "receiptTemp" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:orderService>>>>>>>queryOrder>>>>>>>"+err);
            }
            if( results && results.length > 0 ){
                retrunObj.success = true;
                retrunObj.results = results;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("orderService>>>>>>>queryOrder>>>>>>>"+e);
    }
    return deferred.promise;
}

receiptService.getNowFormatDate = function() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate
        + " " + date.getHours() + seperator2 + date.getMinutes()
        + seperator2 + date.getSeconds();
    return currentdate;
}