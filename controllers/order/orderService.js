/**
 * Created by Warren Li on 1/8/2016.
 */
var orderService = {};

module.exports = orderService;

var couchbaseDB = require('./../couchbaseDB');
var Q = require("q");
var uuid = require('node-uuid');

/**
 * 创建订单
 * @param params
 * @returns {jQuery.promise|*|promise.promise|Promise}
 */
orderService.saveOrder = function(userName,params){
    var deferred = Q.defer();
    var id = null,saveObj={};
    var  retrunObj = {
        success : false
    };
    try{
        /** modify **/
        if(params.id){
            id = params.id;
            saveObj = params.mposfb;
            saveObj["modify_at"] = orderService.getNowFormatDate();
            saveObj["modify_by"] = userName;//req.session.userName;
            saveObj["summary"] = [];
            saveObj.items.map(function(item){
                delete item["$$hashKey"];
                delete item.price["$$hashKey"];
                item.total_tax = 0;
                item.unit_tax = 0;
                saveObj["summary"].push(item.name)  ;
            });
            saveObj["summary"] = saveObj["summary"].join(",");
            saveObj["total_discount"] = 0;
            saveObj["total_tax"] = 0;

            couchbaseDB.bucket.upsert(id,saveObj,function(err, response) {
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
             id = "o:"+uuid.v1();
             saveObj = params.mposfb;

             saveObj["type"] = "order";
             saveObj["created_at"] = orderService.getNowFormatDate();
             saveObj["created_by"] = userName;//req.session.userName;
             saveObj["summary"] = [];
             saveObj.items.map(function(item){
                 delete item["$$hashKey"];
                 delete item.price["$$hashKey"];
                 item.total_tax = 0;
                 item.unit_tax = 0;
                 saveObj["summary"].push(item.name)  ;
             });
             saveObj["summary"] = saveObj["summary"].join(",");
             saveObj["total_discount"] = 0;
             saveObj["total_tax"] = 0;

             var insertOrder = couchbaseDB.N1qlQuery.fromString('INSERT INTO `'+couchbaseDB.index+'` (KEY, VALUE) VALUES ($1, $2)');
            couchbaseDB.bucket.query(insertOrder, [id, saveObj], function (err, result) {
                 if (err) {
                     retrunObj["message"] = err;
                 }else{
                     retrunObj["success"] = true;
                     retrunObj["id"] = id;
                     retrunObj["message"] = "success";
                 }
                 deferred.resolve(retrunObj);
             });
        }
    }catch (e){
        console.log("orderService>>>>>>>saveOrder>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 查询未结账订单
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
orderService.queryOrder = function(merchant){

    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "order" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:orderService>>>>>>>queryOrder>>>>>>>"+err);
            }else{
                retrunObj.success = true;
                retrunObj.results = results;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("orderService>>>>>>>queryOrder>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 查询历史订单
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
orderService.queryHistory = function(merchant){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "receipt" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';

        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);

        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:orderService>>>>>>>queryHistory>>>>>>>"+err);
            }else{
                retrunObj.success = true;
                retrunObj.results = results;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("orderService>>>>>>>queryHistory>>>>>>>"+e);
    }
    return deferred.promise;
};


/**
 * 根据ID查询订单
 * @param id
 * @returns {*|jQuery.promise|promise.promise|Promise}
 */
orderService.getOrder = function(id,merchant){
    var deferred = Q.defer();

    var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE meta(mposfb).id = "'+id+'" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';

        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:orderService>>>>>>>getOrder>>>>>>>"+err);
            }else{
                retrunObj.success = true;
                retrunObj.results = results;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("orderService>>>>>>>getOrder>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 删除未结账订单
 * @param id
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
orderService.deleteOrder = function(id){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false
    };
    try{
        couchbaseDB.bucket.remove(id,function(err, results) {
            if(err){
                console.log("ERROR:orderService>>>>>>>deleteOrder>>>>>>>"+err);
            }else{
                retrunObj.success = true;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("orderService>>>>>>>deleteOrder>>>>>>>"+e);
    }
    return deferred.promise;
};

orderService.getNowFormatDate = function() {
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
