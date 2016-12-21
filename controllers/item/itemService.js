/**
 * Created by Warren Li on 4/8/2016.
 */

var itemService = {};

module.exports = itemService;

var couchbaseDB = require('./../couchbaseDB');
var Q = require("q");

/**
 * 获取菜单类别
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
itemService.getCategory = function(merchant){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false
    };

    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type="category"  ';
        N1q1Str += ' AND merchant="'+merchant+'" ';
        
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);

        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:itemService>>>>>>>getCategory>>>>>>>"+err);
            }
            if( results.length > 0 ){
                retrunObj.success = true;
                retrunObj.results = results;
            }else{
                retrunObj.success = true;
                retrunObj.results = [];
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("itemService>>>>>>>getCategory>>>>>>>"+e);
    }

    return deferred.promise;
};

/**
 * 查询当前category对应的所有Item
 * @param params
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
itemService.getItems = function(params){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false
    };

    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type="item"  ';
        N1q1Str += ' AND merchant="'+params.merchant+'" ';

        if(params.categoryId){
            N1q1Str += ' AND category= "'+params.categoryId+'" ';
        }
        
        N1q1Str += ' ORDER BY name  LIMIT '+params.limit+' OFFSET '+params.offset+'  ';

        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);

        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:itemService>>>>>>>getItems>>>>>>>"+err);
            }
            if( results && results.length > 0 ){
                retrunObj.success = true;
                retrunObj.results = results;
            }else{
                retrunObj.success = true;
                retrunObj.results = [];
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("itemService>>>>>>>getItems>>>>>>>"+e);
    }

    return deferred.promise;
};

/**
 * 查询Item对应的所有modifier
 * @param ids
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
itemService.getModifier = function( ids ){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false
    };
    try{
        couchbaseDB.bucket.getMulti(ids,function(err, results) {
                if (err) {
                    console.log("ERROR:itemService>>>>>>>getModifier>>>>>>>"+err);
                }
                if( results ){
                    retrunObj.success = true;
                    retrunObj.results = results;
                }
                deferred.resolve(retrunObj);
            });
    }catch (e){
        console.log("itemService>>>>>>>getModifier>>>>>>>"+e);
    }
    return deferred.promise;
};