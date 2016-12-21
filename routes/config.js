/**
 * Created by Warren Li on 26/7/2016.
 */
var express = require('express');
var configRouter = express.Router();

var login = require('../controllers/login/loginCtrl');
var layout = require('../controllers/layout/layoutCtrl');
var attachment = require('../controllers/attachment/attachmentCtrl');
var order = require('../controllers/order/orderCtrl');
var item = require('../controllers/item/itemCtrl');
var receipt = require('../controllers/setting/receiptCtrl');
var restaurant = require('../controllers/setting/restaurantCtrl');
var staff = require('../controllers/setting/staffCtrl');
var menu = require('../controllers/setting/menuCtrl');
var plan = require('../controllers/setting/planCtrl');
var checkout = require('../controllers/setting/checkoutCtrl');
var socket = require('../controllers/socket/socketEvent');


/**
 * 管理员登录
 */
configRouter.post('/login', function(req, res ) {
    login.toLogin(req,res);
});

/**
 * 员工登录
 */
configRouter.post('/loginStaff', function(req, res ) {
    login.loginStaff(req,res);
});

/**
 * 退出
 */
configRouter.post('/logout', function(req, res ) {
    login.toLogout(req,res);
});

/**
 * 获取用户信息
 */
configRouter.post('/getUserInfo', function(req, res ) {
    login.getUserInfo(req,res);
});

/**
 * 保存用户设置信息
 */
configRouter.post('/saveSeting', function(req, res ) {
    login.saveSeting(req,res);
});

/**
 * 查询用户设置信息
 */
configRouter.post('/querySeting', function(req, res ) {
    login.querySeting(req,res);
});

/**
 * 获取餐厅桌子布局列表
 */
configRouter.post('/getLayout', function(req, res ) {
    layout.getLayout(req,res);
});

/**
 * 获取附件
 */
configRouter.post('/getAttachment',function(req,res){
    attachment.getAttachment(req,res);
});

/**
 * 创建订单
 */
configRouter.post('/saveOrder',function(req,res){
    order.saveOrder(req,res);
});

/**
 * 查询订单
 */
configRouter.post('/queryOrder',function(req,res){
    order.queryOrder(req,res);
});

/**
 * 查询历史订单
 */
configRouter.post('/queryHistory',function(req,res){
    order.queryHistory(req,res);
});

/**
 * 删除订单
 */
configRouter.post('/deleteOrder',function(req,res){
    order.deleteOrder(req,res);
});

/**
 * 查询菜单类别
 */
configRouter.post('/getCategory',function(req,res){
    item.getCategory(req,res);
});

/**
 * 查询菜单
 */
configRouter.post('/getItems',function(req,res){
    item.getItems(req,res);
});

/**
 * 查询modifier
 */
configRouter.post('/getModifier',function(req,res){
    item.getModifier(req,res);
});

/**
 * 保存或更新发票模板
 */
configRouter.post('/saveReciptTemp',function(req,res){
    receipt.saveReciptTemp(req,res);
});

/**
 * 获取发票模板数据
 */
configRouter.post('/getReceiptTemp',function(req,res){
    receipt.getReceiptTemp(req,res);
});

/**
 * 获取基本信息Bussiness图
 */
configRouter.post('/getImage',function(req,res){
    restaurant.getImage(req,res);
});

/**
 * 获取设置的基本信息
 */
configRouter.post('/getRestaurant',function(req,res){
    restaurant.getRestaurant(req,res);
});

/**
 * 保存设置的基本信息
 */
configRouter.post('/saveRestaurant',function(req,res){
    restaurant.saveRestaurant(req,res);
});


/**
 * 获取员工信息
 */
configRouter.post('/getStaff',function(req,res){
    staff.getStaff(req,res);
});

/**
 * 保存员工信息
 */
configRouter.post('/saveStaff',function(req,res){
    staff.saveStaff(req,res);
});

/**
 * 删除员工信息
 */
configRouter.post('/deleteStaff',function(req,res){
    staff.deleteStaff(req,res);
});

/**
 * 获取设备信息
 */
configRouter.post('/getCheckout',function(req,res){
    checkout.getCheckout(req,res);
});

/**
 * 保存设备信息
 */
configRouter.post('/saveCheckout',function(req,res){
    checkout.saveCheckout(req,res);
});

/**
 * 删除设备信息
 */
configRouter.post('/deleteCheckout',function(req,res){
    checkout.deleteCheckout(req,res);
});

/**
 * 获取桌椅信息
 */
configRouter.post('/getPlan',function(req,res){
    plan.getPlan(req,res);
});

/**
 * 保存桌椅信息
 */
configRouter.post('/savePlan',function(req,res){
    plan.savePlan(req,res);
});

/**
 * 删除桌椅信息
 */
configRouter.post('/deletePlan',function(req,res){
    plan.deletePlan(req,res);
});

/**
 * 保存或更新Item
 */
configRouter.post('/saveItem',function(req,res){
    menu.saveItem(req,res);
});

/**
 * 分页查询Item
 */
configRouter.post('/queryItem',function(req,res){
    menu.queryItem(req,res);
});

/**
 * 查询Category（name & id）
 */
configRouter.post('/queryAllCategory',function(req,res){
    menu.queryAllCategory(req,res);
});

/**
 * 分页查询Category
 */
configRouter.post('/queryCategory',function(req,res){
    menu.queryCategory(req,res);
});

/**
 * 查询所有的Item
 */
configRouter.post('/queryAllItem',function(req,res){
    menu.queryAllItem(req,res);
});

/**
 * 保存或更新Category
 */
configRouter.post('/saveCategory',function(req,res){
    menu.saveCategory(req,res);
});

/**
 * 删除 doc 
 */
configRouter.post('/deleteDoc',function(req,res){
    menu.deleteDoc(req,res);
});

/**
 * 分页查询Modifier
 */
configRouter.post('/queryModifier',function(req,res){
    menu.queryModifier(req,res);
});

/**
 * 保存或更新Modifier
 */
configRouter.post('/saveModifier',function(req,res){
    menu.saveModifier(req,res);
});

/**
 * 查询所有的Modifier
 */
configRouter.post('/queryAllModifier',function(req,res){
    menu.queryAllModifier(req,res);
});


module.exports = configRouter;