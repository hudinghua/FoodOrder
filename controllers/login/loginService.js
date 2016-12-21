/**
 * Created by Warren Li on 26/7/2016.
 */


var loginService = {};

module.exports = loginService;

var couchbaseDB = require('./../couchbaseDB');
var Q = require("q");
var uuid = require('node-uuid');

/**
 * 登录
 * @param params
 * @returns {jQuery.promise|promise.promise|*|Promise}
 */
loginService.toLogin = function(params){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false
    };
    try{
        var N1q1Str = 'SELECT mposfb.*, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type="user" AND id="'+params.staff+'" ';
        N1q1Str += ' AND merchant="'+params.merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                retrunObj["message"] = err;
                console.log("LoginService>>>>>>>toLogin>>>>>>>"+err);
            }else{
                if( results && results.length > 0 ){
                    if(results[0].password == params.password){
                        retrunObj["success"] = true;
                        retrunObj["result"] = results[0];
                    } else {
                        retrunObj["message"] = 1001;//密碼錯誤
                    }
                }else{
                    retrunObj["message"] = 1002;//Merchant or Staff 錯誤
                }
            }
            deferred.resolve(retrunObj);
        });
        return deferred.promise;
    }catch (e){
        console.log("LoginService>>>>>>>toLogin>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 员工登录
 * @param params
 * @returns {*|jQuery.promise|promise.promise|Promise}
 */
loginService.loginStaff = function(params){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false
    };
    try{
        var N1q1Str = 'SELECT mposfb.*, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type="staff" AND staff_id="'+params.staff+'" ';
        //N1q1Str += ' AND pin="'+params.password+'" ';
        N1q1Str += ' AND merchant="'+params.merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                retrunObj["message"] = err;
                console.log("LoginService>>>>>>>loginStaff>>>>>>>"+err);
            }else{
                if( results && results.length > 0 ){
                    if(results[0].pin == params.password){
                        retrunObj["success"] = true;
                        retrunObj["result"] = results[0];
                    } else {
                        retrunObj["message"] = 1001;//密碼錯誤
                    }
                }else{
                    retrunObj["message"] = 1002;//Merchant or Staff 錯誤
                }
            }
            deferred.resolve(retrunObj);
            /*if(err){
                retrunObj["message"] = err;
            }
            if( results && results.length > 0 ){
                retrunObj["success"] = true;
                retrunObj["result"] = results[0];
            }
            deferred.resolve(retrunObj);*/
        });
        return deferred.promise;
    }catch (e){
        console.log("LoginService>>>>>>>loginStaff>>>>>>>"+e);
    }
    return deferred.promise;
};


/**
 * 保存个人设置
 * @param params
 * @returns {jQuery.promise|promise.promise|*|Promise}
 */
loginService.saveSeting = function(params,req){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false
    };
    try{
        /** modify **/
        if(params.id){
            id = params.id;
            delete params.id;
            saveObj = params;
            saveObj["modify_at"] = loginService.getNowFormatDate();
            saveObj["modify_by"] = req.session.userName;
            saveObj["type"] = "setting";
            saveObj["userId"] = req.session.userId;
            couchbaseDB.bucket.upsert(id,saveObj,function(err, response) {
                if (err) {
                    retrunObj["message"] = err;
                }else{
                    retrunObj["success"] = true;
                    retrunObj["id"] = id;
                    retrunObj["created_at"] = saveObj["created_at"]
                    retrunObj["created_by"] = saveObj["created_by"]
                    retrunObj["message"] = "success";
                }
                deferred.resolve(retrunObj);
            });
        }else{/** new **/
            id = "s:"+uuid.v1();
            saveObj = params;

            saveObj["type"] = "setting";
            saveObj["created_at"] = loginService.getNowFormatDate();
            saveObj["created_by"] = req.session.userName;
            saveObj["userId"] = req.session.userId;
            couchbaseDB.bucket.insert(id,saveObj,function(err, response) {
                if (err) {
                    retrunObj["message"] = err;
                }else{
                    retrunObj["success"] = true;
                    retrunObj["id"] = id;
                    retrunObj["created_at"] = loginService.getNowFormatDate();
                    retrunObj["created_by"] = req.session.userName;
                    retrunObj["message"] = "success";
                }
                deferred.resolve(retrunObj);
            });
        }
        return deferred.promise;
    }catch(e){
        console.log("LoginService>>>>>>>saveSeting>>>>>>>"+e);
    }
};

loginService.querySeting = function(userId,merchant){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb  WHERE type="setting" AND userId="'+userId+'" ';
        N1q1Str += ' AND merchant="'+merchant+'"  ORDER BY created_at DESC ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:LoginService>>>>>>>querySeting>>>>>>>"+err);
            }else{
                retrunObj.success = true;
                retrunObj.results = results;
            }
            /*if(err){
                console.log(err)
            }
            if( results && results.length > 0 ){
                retrunObj["success"] = true;
                retrunObj["result"] = results;
            }else if( err === null && results.length == 0 ){
                retrunObj["success"] = true;
                retrunObj["result"] = results;
            }*/
            deferred.resolve(retrunObj);
        });
        return deferred.promise;
    }catch (e){
        console.log("LoginService>>>>>>>querySeting>>>>>>>"+e);
    }
};

/**
 * 取当前时间并转换时间格式
 * @returns {string}
 */
loginService.getNowFormatDate = function() {
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