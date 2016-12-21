/**
 * Created by Warren Li on 29/7/2016.
 */

/**
 * 附件的处理
 *
 */
var attachmentService = {};

module.exports = attachmentService;

var couchbaseDB = require('./../couchbaseDB');

var http = require('http');
var fs = require("fs");
var Q = require("q");

/**
 * @dec 通过ID获取文件
 * 获取文件的流程 ：
 * 获取revid > download
 * @param id 文档uuid
 * @param name 附件名称（默认为image）
 */
attachmentService.getAttachment = function(id){
    var deferred = Q.defer();
    attachmentService.getRevId(id).then(function(revData){
        attachmentService.download(revData).then(function(fileData){
            deferred.resolve(fileData);
        })
    });
    return deferred.promise;
};

/**
 * 通过doc id 获取revId
 * @param id
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
attachmentService.getRevId = function(id){
    var deferred = Q.defer();

    couchbaseDB.syncGatewayConfig["path"] = "/" + couchbaseDB.syncGatewayConfig["bucket"] + "/" + id;
    couchbaseDB.syncGatewayConfig["method"] = "GET";
    try{
        var req=http.request(couchbaseDB.syncGatewayConfig,function(res){
            res.setEncoding('utf8');
            res.on('data',function(chunk){
                if(!JSON.parse(chunk).error){
                    var syncObj = JSON.parse(chunk);
                    var revObj = {
                        success : true
                    };
                    revObj["revId"] = syncObj["_rev"];
                    if(syncObj["_attachments"])
                        revObj["attType"] = syncObj["_attachments"]["image"]["content_type"];
                    else
                        revObj["attType"] = "";
                    revObj["id"] = id;
                    deferred.resolve(revObj);
                }else{
                    var revObj = {
                        success : false
                    };
                    deferred.resolve(revObj);
                }
            });
            res.on('error',function(e){
                console.log('Error got: '+e.message);
            });
        });
        req.end();
    }catch (e){
        console.log("attachmentService>>>>>getRevId>>>>>>"+e);
    }
    return deferred.promise;
};

/**
 * 附件下载
 * @param params
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
attachmentService.download = function(params){
    var deferred = Q.defer();
    var attachmentName = params.name || "image";
    couchbaseDB.syncGatewayConfig["path"] = "/" + couchbaseDB.syncGatewayConfig["bucket"] + "/" + params.id+"/"+attachmentName+"?rev=" + params.revId;
    couchbaseDB.syncGatewayConfig["method"] = "GET";

    try{
        var req=http.request(couchbaseDB.syncGatewayConfig,function(res){
            res.setEncoding('binary');
            var FileData = "";
            res.on('data',function(chunk){
                FileData +=chunk;
            });
            res.on('end', function(){
                try{
                    var baseStr = new Buffer(FileData,'binary').toString('base64');
                    /** {"error":"not_found","reason":"missing"} **/
                    if(baseStr == "eyJlcnJvciI6Im5vdF9mb3VuZCIsInJlYXNvbiI6Im1pc3NpbmcifQ=="){
                        baseStr = "";
                    }else{
                        var baseStr = "data:"+params.attType+";base64,"+baseStr;
                    }
                    deferred.resolve(baseStr);
                }catch (e){
                    console.log("attachmentService>>>>>download>>>>>>"+e);
                }
            });
        });
        req.on('error',function(e){
            console.log('Error got: '+e.message);
        });
        req.end();
    }catch (e){
        console.log("attachmentService>>>>>download>>>>>>"+e);
    }
    return deferred.promise;
};


/**
 * 附件上传
 * @param params
 * @returns {*|promise.promise|jQuery.promise|Promise}
 */
attachmentService.upload = function(params){
    var deferred = Q.defer();
    try{
        if(!params.rev){
            return;
        }
        var attachmentName = params.name || "image";
        var options = {};
        options["host"] = couchbaseDB.syncGatewayConfig["host"];
        options["port"] = couchbaseDB.syncGatewayConfig["port"];
        options["auth"] = couchbaseDB.syncGatewayConfig["auth"];
        options["bucket"] = couchbaseDB.syncGatewayConfig["bucket"];

        options["path"] = "/" + options["bucket"] + "/" + params.documentId + "/"+attachmentName+"?rev=" + params.rev;
        options["method"] = "PUT";
        options["headers"] ={
            'Content-Type':'image/jpg',
            'Connection':'keep-alive'
        };
        var req = http.request(options,function(res){
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                /*var syncObj = JSON.parse(chunk);*/
                deferred.resolve({success : true});
            });
        });
        req.on('error',function(e){
            console.log('Error got: '+e.message);
        });
        var buffer = new Buffer(params.buffer, 'base64');
        req.write(buffer);
        req.end();
    }catch(e){
        console.log("Attachment>>>>>upload>>>>>>"+e);
    }
    return deferred.promise;
};
