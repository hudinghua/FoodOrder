/**
 * Created by hudinghua on 2016/11/10
 */
var staff = {};

module.exports = staff;

var staffService = require('./staffService');

/**
 * 获取员工信息
 * @param params
 * @returns Promise
 */
staff.getStaff = function(req,res){
    staffService.getStaff(req).then(function(result){
        res.send(result);
    });
};

/**
 * 保存员工信息
 * @param params
 * @returns Promise
 */
staff.saveStaff = function(req,res){
    var params = req.body;
    staffService.saveStaff(params,req).then(function(result){
        res.send(result);
    });
};

/**
 * 删除员工信息
 * @param params
 * @returns Promise
 */
staff.deleteStaff = function(req,res){
    var params = req.body;
    
    staffService.deleteStaff(params).then(function(result){
        res.send(result);
    });
};