var common = {};

var util = require('util'); 

var attachmentService = require('./../attachment/attachmentService');

common.getNowFormatDate = function() {
    var date = new Date(),
    	seperator1 = "-", seperator2 = ":",
    	year = date.getFullYear(),
    	month = date.getMonth() + 1,
    	strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = [year,seperator1,month,seperator1,strDate," ",date.getHours(),seperator2,date.getMinutes(),seperator2,date.getSeconds()];
    return currentdate.join('');
}

util._extend(common,attachmentService);

module.exports = common;