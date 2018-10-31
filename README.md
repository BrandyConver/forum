网站目录
/ 主页
/user/login 登陆页
/user/reg 注册页
/user 个人信息页  待添加
/user 编辑个人信息
/p?id=xxx 文章内容页
/new_article 发表
/admin 管理员功能  待添加
/user/data 接口接受和返回用户信息

文件目录
server.js 主文件
node_modules/ npm模块
route/ 路由
——web.js
——user.js
views/ 模板
public/ 静态资源
——js/ js文件
——css/ css文件
——image/ 图片
——dist/vue打包文件

////////////////////////////////////////分割线/////////////////////////////////////////

// index.js 服务主文件
const express=require('express');
const bodyParser=require('body-parser');
const consolidate=require('consolidate');
const cookieParser=require('cookie-parser');
const cookieSession=require('cookie-session');
var server=express();

server.use(bodyParser.urlencoded({extended:false}));
server.use(cookieParser());
(function(){
	var mkeys=[];
	for(var i=0;i<9;i++){
		mkeys.push('key'+Math.random()+i);
	}
	server.use(cookieSession({keys:mkeys,name:'hgw_ses'}));
})();

server.engine('html',consolidate.ejs);
server.set('views','views');
server.set('view engine','html');
//主页及内容页
server.use('/',require('./route/web.js'));
//注册登录退出个人中心
server.use('/user',require('./route/user.js'));
//静态资源
server.use(express.static(__dirname+'/public'));
server.listen(8080);
console.log(` App running at:
 - Local: http://localhost:8080/`);
 
////////////////////////////////////////分割线/////////////////////////////////////////

//web.js  主页及内容
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
					res.render('content.html',{article:data[0], user:req.session.status, user:req.session.user, comments});//登陆状态栏
				});
			}
		});
	}
	else
		res.status(404).send('请求的页面不存在'+err).end();
});

//ajax点赞、评论、发表
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
			 (`INSERT INTO comments (username,article_id,content,time) VALUE ('${username}','${req.body.article_id}','${req.body.content}','${time}')`,function(result){res.status(200).send('评论成功').end();});
			break;
		case 'publish':
			var nowdata=myfun.getData();
			var post_time=nowdata.data+nowdata.time;
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
