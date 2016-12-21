/**
 * 登录，配置路径功能
 */
var login = {};

module.exports = login;
var loginService = require('./loginService');

/**
 * 管理员登录方法
 */

login.toLogin = function(req,res){
	var params = {};
	params.merchant = req.body.merchant;
	params.staff = req.body.staff;
	params.password = req.body.password;
	loginService.toLogin(params).then(function(retrunObj){
		if(retrunObj.success){
			req.session.staff = params.staff;
			req.session.password = params.password;
			req.session.userId = retrunObj.result.id;
			req.session.userName = retrunObj.result.name;
			req.session.role = retrunObj.result.role;
			req.session.merchant = params.merchant;
			res.send(retrunObj);
		}else{
			res.send(retrunObj);
		}
	});
};

/**
 * 员工登陆方法
 */
login.loginStaff = function(req,res){
	var params = {};
	params.merchant = req.body.merchant;
	params.staff = req.body.staff;
	params.password = req.body.password;
	loginService.loginStaff(params).then(function(retrunObj){
		if(retrunObj.success){
			req.session.staff = params.staff;
			req.session.password = params.password;
			req.session.userId = retrunObj.result.id;
			req.session.userName = retrunObj.result.name;
			req.session.role = "Staff";
			req.session.merchant = params.merchant;
			var rObj = {
				success : true,
				result : {
					id : retrunObj.result.id,
					name : retrunObj.result.name,
					role : "Staff"
				}
			}
			res.send(rObj);
		}else{
			res.send(retrunObj);
		}
	});
};

login.toLogout = function(req,res){
	try{
		req.session.staff = "";
		req.session.userName = "";
		req.session.password = "";
		req.session.userId = "";
		req.session.role = "";
		req.session.merchant = "";

		res.send({ success:true });
	}catch(e){
		console.log("Login>>>toLogout>>>>"+e);
	}
}

/**
 * 获取用户信息
 */

login.getUserInfo = function(req,res){
	try{
		var userName = req.session.userName;
		var password = req.session.password;
		var userId = req.session.userId;
		var role = req.session.role;
		var merchant = req.session.merchant;
		if( userName && password){
			res.send({ success:true, info : { userName : userName, role : role, userId : userId, merchant : merchant } });
		}else{
			res.send({ success:false });
		}
	}catch(e){
		console.log("Login>>>getUser>>>>"+e);
	}
};

/**
 * 保存个人设置
 * @param req
 * @param res
 */
login.saveSeting = function(req,res){
	var params = {};
	params = req.body;
	loginService.saveSeting(params,req).then(function(retrunObj){
		if(retrunObj.success){
			res.send(retrunObj);
		}else{
			res.send({success:false,message:"Failure"});
		}
	});
};

/**
 * 查询当前用户的Setting数据
 * @param req
 * @param res
 */
login.querySeting = function(req,res){
	var userId = req.session.userId;
	var merchant = req.body.merchant;
	loginService.querySeting(userId,merchant).then(function(retrunObj){
		if(retrunObj.success){
			res.send(retrunObj);
		}else{
			res.send({success:false,message:"Failure"});
		}
	});
};