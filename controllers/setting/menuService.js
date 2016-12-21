/**
 * Created by warren.li on 2016/11/8 0008.
 */

var menuService = {};

module.exports = menuService;

var couchbaseDB = require('./../couchbaseDB');
var Q = require("q");
var uuid = require('node-uuid');

/**
 * 查询Item列表数据
 * @param merchant
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
menuService.queryItem = function (merchant,start,limit) {
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        count : 0,
        start : start || 0,
        limit : limit || 10,
        results  : []
    };
    try{
        /** 获取总数 **/
        var getCount = function(){
            var def = Q.defer();
            var N1q1Str = 'SELECT count(*) AS count FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "item"  AND merchant="'+merchant+'"  ';
            var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
            var retObj = {
                success : false
            };
            couchbaseDB.bucket.query(query,function(err, results) {
                if(err){
                    console.log("ERROR:menuService>>>>>>>queryItemCount>>>>>>>"+err);
                }else{
                    retObj.success = true;
                    retObj.count = results[0].count;
                }
                def.resolve(retObj);
            });
            return def.promise;
        }
        /** 查询分页数据 **/
        getCount().then(function (retObj) {
            if(retObj.success){
                retrunObj.count = retObj.count;
                var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "item" AND merchant="'+merchant+'" ';
                N1q1Str += ' ORDER BY created_at DESC LIMIT '+retrunObj.limit+' OFFSET '+retrunObj.start+' ';
                var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
                couchbaseDB.bucket.query(query,function(err, results) {
                    if(err){
                        console.log("ERROR:menuService>>>>>>>queryItem>>>>getCount>>>"+err);
                    }else{
                        retrunObj.success = true;
                        retrunObj.results = results;
                    }
                    deferred.resolve(retrunObj);
                });
            }else{
                deferred.resolve(retrunObj);
            }
        });
    }catch (e){
        console.log("menuService>>>>>>>queryItem>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 查询所有Category
 * @param merchant
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
menuService.queryAllCategory = function (merchant) {
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT mposfb.name, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "category" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:menuService>>>>>>>queryAllCategory>>>>>>>"+err);
            }else{
                retrunObj.success = true;
                retrunObj.results = results;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("menuService>>>>>>>queryAllCategory>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 保存Item数据
 * @param params
 * @param userName
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
menuService.saveItem = function(params,userName){
    var deferred = Q.defer();
    var id = null,saveObj={};
    var  retrunObj = {
        success : false,
        id : id
    };
    try{
        saveObj = params.itemData;
        for(var i=0;i<saveObj.price.length;i++){
            saveObj.price[i].position = i;
            saveObj.price[i].price *= 100;
        }

        /** modify **/
        if(params.id){
            id = params.id;
            saveObj["modify_at"] = menuService.getNowFormatDate();
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
            id = "i:"+uuid.v1();
            saveObj["type"] = "item";
            saveObj["created_at"] = menuService.getNowFormatDate();
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
 * 查询Category列表数据
 * @param merchant
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
menuService.queryCategory = function (merchant,start,limit) {
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        count : 0,
        start : start || 0,
        limit : limit || 10,
        results  : []
    };
    try{
        /** 获取总数 **/
        var getCount = function(){
            var def = Q.defer();
            var N1q1Str = 'SELECT count(*) AS count FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "category"  AND merchant="'+merchant+'"  ';
            var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
            var retObj = {
                success : false
            };
            couchbaseDB.bucket.query(query,function(err, results) {
                if(err){
                    console.log("ERROR:menuService>>>>>>>queryCategory>>>getCount>>>>"+err);
                }else{
                    retObj.success = true;
                    retObj.count = results[0].count;
                }
                def.resolve(retObj);
            });
            return def.promise;
        }
        /** 查询分页数据 **/
        getCount().then(function (retObj) {
            if(retObj.success){
                retrunObj.count = retObj.count;
                var N1q1Str = 'SELECT mposfb.name,mposfb.posName,mposfb.containItems,mposfb.created_at,mposfb.created_by, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "category" AND merchant="'+merchant+'" ';
                N1q1Str += ' ORDER BY created_at DESC LIMIT '+retrunObj.limit+' OFFSET '+retrunObj.start+' ';
                var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
                couchbaseDB.bucket.query(query,function(err, results) {
                    if(err){
                        console.log("ERROR:menuService>>>>>>>queryCategory>>>>>>>"+err);
                    }else{
                        retrunObj.success = true;
                        retrunObj.results = results;
                    }
                    deferred.resolve(retrunObj);
                });
            }else{
                deferred.resolve(retrunObj);
            }
        });
    }catch (e){
        console.log("menuService>>>>>>>queryItem>>>>>>>"+e);
    }
    return deferred.promise;
};


/**
 * 查询所有Item
 * @param merchant
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
menuService.queryAllItem = function (merchant) {
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "item" ';
        N1q1Str += ' AND merchant="'+merchant+'"  ORDER BY name ASC  ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:menuService>>>>>>>queryAllCategory>>>>>>>"+err);
            }else{
                retrunObj.success = true;
                retrunObj.results = results;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("menuService>>>>>>>queryAllCategory>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 保存Category数据
 * @param params
 * @param userName
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
menuService.saveCategory = function(params,userName){
    var deferred = Q.defer();
    var id = null,saveObj={},addItem={},deleteItem={};
    var  retrunObj = {
        success : false,
        id : id
    };
    try{
        saveObj = params.categoryData;
        addItem = params.addItem;
        deleteItem = params.deleteItem;

        /** 执行保存数据操作 **/
        var doSave = function(){
            var def = Q.defer();
            /** modify **/
            if(params.id){
                id = params.id;
                saveObj["modify_at"] = menuService.getNowFormatDate();
                saveObj["modify_by"] = userName;
                couchbaseDB.bucket.upsert(id,saveObj,function(err, response) {
                    if (err) {
                        retrunObj["message"] = err;
                    }else{
                        retrunObj["success"] = true;
                        retrunObj["id"] = id;
                        retrunObj["message"] = "success";
                    }
                    def.resolve(retrunObj);
                });
            }else{/** new **/
                id = "c:"+uuid.v1();
                saveObj["type"] = "category";
                saveObj["created_at"] = menuService.getNowFormatDate();
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
                            def.resolve(retrunObj);
                        });
                    }
                });
            }
            return def.promise;
        };

        /** 执行Item 更新操作 **/
        doSave().then(function(saveReturn){
              id = saveReturn["id"];
              for(var itemId in addItem){
                  var addObj = addItem[itemId];
                  addObj.category = id;
                  couchbaseDB.bucket.upsert(itemId,addObj,function(err, response) {
                      if (err) {
                          console.log(" saveCategory>>>>>>>>addItem>>>>>ERROR>>>>>  "+err);
                      }
                  });
              }
              for(var itemId in deleteItem){
                  var deleteObj = deleteItem[itemId];
                  deleteObj.category = "";
                  couchbaseDB.bucket.upsert(itemId,deleteObj,function(err, response) {
                      if (err) {
                          console.log(" saveCategory>>>>>>>>deleteItem>>>>>ERROR>>>>>  "+err);
                      }
                  });
              }
              deferred.resolve(saveReturn);
        });

    }catch (e){
        console.log("menuService>>>>>>>saveCategory>>>>>>>"+e);
    }
    return deferred.promise;
};

/**  删除 Document **/
menuService.deleteDoc = function(id){
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        message:"failure"
    };
    try{
        couchbaseDB.bucket.remove(id,function(err, response) {
            if (err) {
                retrunObj["message"] = err;
                deferred.resolve(retrunObj);
            }else{
                retrunObj["success"] = true;
                retrunObj["message"] = "success";
                deferred.resolve(retrunObj);
            }
        });
    }catch(e){
        console.log("menuService>>>>>>>>>>>>>>>deleteDoc>>>>>>>>>>>>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 查询Modifier列表数据
 * @param merchant
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
menuService.queryModifier = function (merchant,start,limit) {
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        count : 0,
        start : start || 0,
        limit : limit || 10,
        results  : []
    };
    try{
        /** 获取总数 **/
        var getCount = function(){
            var def = Q.defer();
            var N1q1Str = 'SELECT count(*) AS count FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "modifier"  AND merchant="'+merchant+'"  ';
            var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
            var retObj = {
                success : false
            };
            couchbaseDB.bucket.query(query,function(err, results) {
                if(err){
                    console.log("ERROR:menuService>>>>>>>queryModifier>>>getCount>>>>"+err);
                }else{
                    retObj.success = true;
                    retObj.count = results[0].count;
                }
                def.resolve(retObj);
            });
            return def.promise;
        }
        /** 查询分页数据 **/
        getCount().then(function (retObj) {
            if(retObj.success){
                retrunObj.count = retObj.count;
                var N1q1Str = 'SELECT mposfb.*, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "modifier" AND merchant="'+merchant+'" ';
                N1q1Str += ' ORDER BY created_at DESC LIMIT '+retrunObj.limit+' OFFSET '+retrunObj.start+' ';
                var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
                couchbaseDB.bucket.query(query,function(err, results) {
                    if(err){
                        console.log("ERROR:menuService>>>>>>>queryModifier>>>>>>>"+err);
                    }else{
                        retrunObj.success = true;
                        retrunObj.results = results;
                    }
                    deferred.resolve(retrunObj);
                });
            }else{
                deferred.resolve(retrunObj);
            }
        });
    }catch (e){
        console.log("menuService>>>>>>>queryModifier>>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 保存Modifier数据
 * @param params
 * @param userName
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
menuService.saveModifier = function(params,userName){
    var deferred = Q.defer();
    var id = null,saveObj={},addItem={},deleteItem={};
    var  retrunObj = {
        success : false,
        id : id
    };
    try{
        saveObj = params.modifierData;
        addItem = params.addItem;
        deleteItem = params.deleteItem;

        for(var i=0;i<saveObj.options.length;i++){
            saveObj.options[i].position = i;
            saveObj.options[i].price *= 100;
        }

        /** 执行保存数据操作 **/
        var doSave = function(){
            var def = Q.defer();
            /** modify **/
            if(params.id){
                id = params.id;
                saveObj["modify_at"] = menuService.getNowFormatDate();
                saveObj["modify_by"] = userName;
                couchbaseDB.bucket.upsert(id,saveObj,function(err, response) {
                    if (err) {
                        retrunObj["message"] = err;
                    }else{
                        retrunObj["success"] = true;
                        retrunObj["id"] = id;
                        retrunObj["message"] = "success";
                    }
                    def.resolve(retrunObj);
                });
            }else{/** new **/
                id = "m:"+uuid.v1();
                saveObj["type"] = "modifier";
                saveObj["created_at"] = menuService.getNowFormatDate();
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
                            def.resolve(retrunObj);
                        });
                    }
                });
            }
            return def.promise;
        };

        /** 执行Item 更新操作 **/
        doSave().then(function(saveReturn){
            id = saveReturn["id"];
            for(var itemId in addItem){
                var addObj = addItem[itemId];
                addObj.modifiers.push(id);
                couchbaseDB.bucket.upsert(itemId,addObj,function(err, response) {
                    if (err) {
                        console.log(" saveCategory>>>>>>>>addItem>>>>>ERROR>>>>>  "+err);
                    }
                });
            }
            for(var itemId in deleteItem){
                var deleteObj = deleteItem[itemId];
                deleteObj.modifiers.splice(deleteObj.modifiers.indexOf(id),1);
                couchbaseDB.bucket.upsert(itemId,deleteObj,function(err, response) {
                    if (err) {
                        console.log(" saveCategory>>>>>>>>deleteItem>>>>>ERROR>>>>>  "+err);
                    }
                });
            }
            deferred.resolve(saveReturn);
        });

    }catch (e){
        console.log("menuService>>>>>>>saveCategory>>>>>>>"+e);
    }
    return deferred.promise;
};


/**
 * 查询所有Modifier
 * @param merchant
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
menuService.queryAllModifier = function (merchant) {
    var deferred = Q.defer();
    var  retrunObj = {
        success : false,
        results  : []
    };
    try{
        var N1q1Str = 'SELECT mposfb.*, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type = "modifier" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:menuService>>>>>>>queryAllModifier>>>>>>>"+err);
            }else{
                retrunObj.success = true;
                retrunObj.results = results;
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("menuService>>>>>>>queryAllModifier>>>>>>>"+e);
    }
    return deferred.promise;
};

menuService.getNowFormatDate = function() {
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