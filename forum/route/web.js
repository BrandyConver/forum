//主页及内容
const mysql=require('mysql');
const express=require('express');
const myfun=require('../my_modules/myfun.js');
const db=mysql.createPool({host:'localhost',user:'root',password:'root',database:'schema1'});

var router=express.Router();
//渲染主页
router.get('/',(req,res)=>{
	db.query("SELECT * FROM `articles` ORDER BY `post_time` DESC;",function(err,data){
		if(err)
			res.status(500).send('服务器错误'+err).end();
		else{
			//如果已登录，不显示登陆注册，显示用户名
			res.render('homepage.html',{articles:data,user:req.session.user});
		}
	});
});

//渲染文章页面
router.get('/p',(req,res)=>{
	if(req.query){
		db.query(`SELECT * FROM articles WHERE id=${req.query.id};`,(err,data)=>{
			if(err)
				res.status(500).send('请求的资源不存在'+err).end();
			else{
				//
				myfun.query(`SELECT * FROM comments WHERE article_id=${req.query.id}`,function(comments){
					data[0].content=data[0].content.replace(/^/gm,'<p>').replace(/$/gm,'</p>');
					data[0].likes=data[0].likes.replace(/^0+/,'');
					res.render('content.html',{article:data[0],user:req.session.status,user:req.session.user,comments});//登陆状态栏
				});
			}
		});
	}
	else
		res.status(404).send('请求的页面不存在'+err).end();
});

//ajax点赞评论发表
router.post('/p/act',(req,res)=>{
	var act=req.body.act;
	var username=req.session.user;
	if(username==undefined){
		res.status(400).send('请登陆后再操作');
		return ;
	}
	switch(act){
		case 'like':
			var article_id=req.body.article_id;
			db.query(`UPDATE articles SET likes=likes+1 WHERE id=${article_id}`,function(err,data){
				if (err){
					res.status(500).end('database error');
					console.log(err);
				}
				else{
					res.status(200).end('like');
				}
			});
			break;
		case 'comment':
			if(req.body.content==''){
				res.status(400).send('不能为空').end();
				break;
			}
			var now=new Date();
			var time=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+now.getHours()+':'+now.getMinutes();
			myfun.query(`INSERT INTO comments (username,article_id,content,time) VALUE ('${username}','${req.body.article_id}','${req.body.content}','${time}')`,function(result){res.status(200).send('评论成功').end();});
			break;
		case 'publish':
			var now=new Date();
			var post_time=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate()+' '+now.getHours()+':'+now.getMinutes();
			var title=req.body.title;
			var content=req.body.content; 
			if(title==''||content==''){
				res.status(400).send('内容不能为空').end();
			}
			else{
				db.query(`INSERT INTO articles (title,author,post_time,content) VALUE ('${title}','${username}','${post_time}','${content}')`,(err,data)=>{
					if(err){
						console.log(err);
						res.status(500).end('database error');
					}
					else{
						console.log(`${username} post`);
						res.status(200).send('post success').end();
					}
				});
			}
			break;
		default:
			res.status(404).send('未知请求').end();
			break;
	}
});
//发布内容页
router.get('/new_article',(req,res)=>{
	if(req.session.user){
		res.render('new_article.html',{user:req.session.user});
	}
	else{
		res.redirect('/user/login');		
	}
});

module.exports=router;
