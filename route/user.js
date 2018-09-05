//用户登录注册退出
const mysql=require('mysql');
const crypto=require('crypto');
const express=require('express');
const myfun=require('../my_modules/myfun.js');
const pool=mysql.createPool({host:'localhost',user:'root',password:'adgjl193726845',database:'schema1'});
var router=express.Router();


//登陆
router.get('/login',(req,res)=>{
	if(req.session.user!=undefined){
		res.redirect('/');//已登录跳转
	}
	else{		
		res.render('login.html');
	}
});
//				34	req.session[username]=username;
//					res.cookie(user,username);
router.post('/login',(req,res,)=>{
	var username=req.body.username;
	var password=myfun.sign(req.body.password);
	var msg='';
	pool.query('SELECT * FROM users WHERE username=?',[username],(err,data)=>{
		if(err){
			msg='数据库读写错误'+err;
		}
		else{
			if(data.length==0){
				msg='用户不存在';
			}
			else{
				if(data[0].password==password){
					console.log(`${username}登陆`);
					req.session.user=username;

					res.redirect('/');
					return;
				}
				else{
					msg='密码错误';
				}
			}
		}
		res.render('login.html',{msg:msg});
	});
});
//注册
router.get('/reg',(req,res)=>{
	res.render('reg.html');
});
router.post('/reg',(req,res)=>{
	var username=req.body.username;
	var password=req.body.password1;
	var msg='';
	if(username==''||password==''){
		res.render('reg.html',{msg:'用户名或密码不能为空'});
	}
	else{
		if(password!=req.body.password2){
			res.render('reg.html',{msg:'密码不一致'});
		}	
		else{
			password=myfun.sign(password);
			pool.query('SELECT * FROM users WHERE username=?',username,(err,data1)=>{
				if(err){
					res.render('reg.html',{msg:'数据库读写错误'+err});
				}
				else{
					if(data1[0]!=undefined){
						res.render('reg.html',{msg:'用户名已存在'});
					}
					
					else{
						pool.query(`INSERT INTO users (username,password) VALUE('${username}', '${password}')`,(err,data2)=>{
							if(err){
								res.render('reg.html',{msg:'数据库读写错误'+err});
								}
							else{
								console.log('注册成功');
								res.redirect('/user/login');
							}
						});
					}
				}
			});
		}
	}
});
router.get('/logout',(req,res)=>{
	
	console.log(req.session.user+'退出');
	delete req.session.user;
	res.redirect('/');//return original site
})
module.exports=router;
