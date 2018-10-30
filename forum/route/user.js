//用户登录 注册 退出 个人中心
const fs=require('fs');
const mysql=require('mysql');
const crypto=require('crypto');
const express=require('express');
const myfun=require('../my_modules/myfun.js');
const bodyParser=require('body-parser');
const multer=require('multer');
var upload=multer({dest:'./public/image/user_profile/'});
const pool=mysql.createPool({host:'localhost',user:'root',password:'root',database:'schema1'});
var router=express.Router();

//个人中心
router.get('/',(req,res)=>{
	var editable=false;
	res.render('userhome.html');
	if(req.query.id==undefined&&req.session.id){
		editable=true;
	}
});
//用户数据接口
router.get('/data',(req,res)=>{
	var userid;
	if(req.query.id){var userid=req.query.id;}
	else{var userid=req.session.id;}
	if(userid){
		myfun.query(`SELECT * FROM users WHERE id='${userid}'`,(data)=>{
			if(data){
				res.json({"username":data[0].username,"rig_time":data[0].rig_time,"last_log":data[0].last_log,"intro":data[0].intro,"location":data[0].location,"profile":data[0].profile});
			}
		})
	}
});
router.post('/data',upload.any());
router.post('/data', (req, res) => {
    if (req.session.id) {
        if (req.body.type == 'text') {
            myfun.query(`UPDATE users SET gender='${req.body.gender}',intro='${req.body.intro}',location='${req.body.location}' WHERE id='${req.session.id}'`,
                (data) => { res.status(200).send('修改成功') });
        } else {
            let newpath = req.files[0].path + req.files[0].originalname.substr(req.files[0].originalname.lastIndexOf('.'));
            fs.rename(req.files[0].path, newpath, (err) => { if (err) { console.log('修改失败' + err) } })
            let profile_path = newpath.substr(newpath.search(/\/|\\/));
            profile_path=profile_path.replace(/\\/g,'/');
            myfun.query(`UPDATE users SET profile='${profile_path}' WHERE id='${req.session.id}'`,
                (data) => {
                    res.status(200).send("修改成功");
                    //需删除旧文件 
                }
            );
        }
    }
	else { res.status(400).send("提交失败") }
});
//登陆
router.get('/login',(req,res)=>{
	if(req.session.user!=undefined){
		res.redirect('/');//已登录跳转
	}
	else{		
		res.render('login.html');
	}
});
router.post('/login',(req,res)=>{
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
					req.session.user=username;
					req.session.id=data[0].id;
					res.redirect('/');
					let nowdata=myfun.getData().data;
					myfun.query(`UPDATE users SET last_log='${nowdata}' WHERE username='${username}'`,(data)=>{})
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
});

module.exports=router;
