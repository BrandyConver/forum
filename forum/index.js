//服务主文件
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










