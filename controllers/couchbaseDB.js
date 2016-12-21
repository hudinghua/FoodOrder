/**
 * Created by Warren Li on 25/7/2016.
 */
var couchbase = require('couchbase');
var config = require('../public/config.json');

/*
 数据库连接
 */
var couchbaseDB={};

couchbaseDB.bucketName = config.bucketName;
couchbaseDB.couchBaseConfig = {
    ip : config.serverIP,
    bucket : config.bucketName
};
couchbaseDB.syncGatewayConfig = {
    host : config.serverIP,
    port : config.gatewayPort,
    auth : config.gatewayAuth,
    bucket : config.bucketName
};

couchbaseDB.index = global.bucket;
couchbaseDB.index = couchbaseDB.bucketName;
couchbaseDB.cluster = new couchbase.Cluster('couchbase://'+couchbaseDB.couchBaseConfig.ip);//10.0.0.5
couchbaseDB.N1qlQuery = couchbase.N1qlQuery;
couchbaseDB.ViewQuery = couchbase.ViewQuery;
couchbaseDB.bucket = couchbaseDB.cluster.openBucket(couchbaseDB.bucketName);
couchbaseDB.bucket.operationTimeout = config.operationTimeout;
couchbaseDB.getBucket = function(){
    return couchbaseDB.cluster.openBucket(couchbaseDB.bucketName);
};

/** 创建索引语句 **/
var indexQueryStr = couchbase.N1qlQuery.fromString('CREATE PRIMARY INDEX ON '+config.bucketName+' USING GSI');
/** 查询管理员语句 **/
var adminQueryStr = couchbase.N1qlQuery.fromString('SELECT  mposfb.* FROM '+config.bucketName+' as mposfb where type="user" and id="0" and merchant="'+config.bucketName+'" ');
/** 创建管理员语句 **/
var createQueryStr = couchbase.N1qlQuery.fromString('INSERT INTO `'+config.bucketName+'` (KEY, VALUE) VALUES ("u:000000001", {"id":"0","name": "manager","password": "password","role": "manager","type": "user","merchant": "'+config.bucketName+'"})');
/**
 * 创建数据库索引
 */
couchbaseDB.bucket.query(indexQueryStr, function(err, res) {
    couchbaseDB.queryAdmin();
});

/**
 * 查询是否有管理员
 * **/
couchbaseDB.queryAdmin = function(){
    couchbaseDB.bucket.query(adminQueryStr, function(err, res) {
        if(res.length == 0){
            couchbaseDB.createAdmin();
        }else{
            console.log("Administrator already exists!");
        }
    });
};
/**
 * 创建一个管理员
 * **/
couchbaseDB.createAdmin = function(){
    couchbaseDB.bucket.query(createQueryStr, function(err, res) {
        if(err == null){
            console.log("Administrator has created!");
        }
    });
};


module.exports = couchbaseDB;