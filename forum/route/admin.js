// 管理员模块 未完成
const express=require('express');
var router=express.Router();
router.get('/admin/',(req,res)=>{

});
router.get('/admin/login',(req,res)=>{
	res.writeHead(200,{'Content-Type':'text/html'});
	res.write('').end();

});