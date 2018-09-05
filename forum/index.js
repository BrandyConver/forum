//服务主文件
const express=require('express');
const bodyParser=require('body-parser');
const consolidate=require('consolidate');
const cookieParser=require('cookie-parser');
const cookieySession=require('cookie-session');
var server=express();

server.use(bodyParser.urlencoded({extended:false}));
server.use(cookieParser());
(function(){
	var mkeys=[];
	for(var i=0;i<9;i++){
		mkeys.push('key'+Math.random()+i);
	}
	server.use(cookieySession({keys:mkeys,name:'hgw_ses'}));
})();

server.engine('html',consolidate.ejs);
server.set('views','views');
server.set('view engine','html');

server.use('/',require('./route/web.js'));
server.use('/user',require('./route/user.js'));

server.use(express.static(__dirname+'/public'));
server.listen(8080);










