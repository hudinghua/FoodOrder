/**
 * Created by Warren Li on 27/7/2016.
 */

var layoutService = {};

module.exports = layoutService;

var couchbaseDB = require('./../couchbaseDB');
var Q = require("q");

layoutService.getLayout = function(merchant){
    var deferred = Q.defer();

    var  retrunObj = {
            success : false
    };
    try{
        var N1q1Str = 'SELECT *, meta(mposfb).id FROM `'+couchbaseDB.index+'` as mposfb WHERE type="floor" ';
        N1q1Str += ' AND merchant="'+merchant+'" ';
        var query = couchbaseDB.N1qlQuery.fromString(N1q1Str);
        couchbaseDB.bucket.query(query,function(err, results) {
            if(err){
                console.log("ERROR:layoutService>>>>>>>getLayout>>>>>>>"+err);
            }
            if( results && results.length > 0 ){
                var designData = results[0]["mposfb"];
                var zones = designData.designData.length > 0 ? designData.designData[0].zones : [];
                var tables = zones.length > 0 ? zones[0].tables : [];
                retrunObj.success = true;
                retrunObj.results = tables;
            }else{
                retrunObj.success = true;
                retrunObj.results = [];
            }
            deferred.resolve(retrunObj);
        });
    }catch (e){
        console.log("layoutService>>>>>>>getLayout>>>>>>>"+e);
    }
    return deferred.promise;
};