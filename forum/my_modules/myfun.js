// 公有模块 
const crypto=require('crypto');
const mysql=require('mysql');
const pool=mysql.createPool({host:'localhost',user:'root',password:'root',database:'schema1'});
module.exports={
	//md5加密
	sign(str){
		var key='keys';
		var md5obj=crypto.createHash('md5');
		return md5obj.update(str+key).digest('hex');
	},
	//数据库查询
	query(sql,cb){
		pool.getConnection(function(err,connection){
			if(err) throw err;
			connection.query(sql,function(err,data){
				if(err) throw err;
				cb(data);//cb==>>data
				connection.release();
			});
		});
	},
	//获取时间日期
	getData(){
		var now=new Date();
		var data=now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDate();
		var time=now.getHours()+':'+now.getMinutes();
		return{
			data,
			time
		}
	}
};
