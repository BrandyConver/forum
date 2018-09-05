// 公有模块 md5 数据库
const crypto=require('crypto');
const mysql=require('mysql');
const pool=mysql.createPool({host:'localhost',user:'root',password:'root',database:'schema1'});
module.exports={
	sign(str){
		var key='keys';
		var md5obj=crypto.createHash('md5');
		return md5obj.update(str+key).digest('hex');
	},
	query(sql,cb){
		pool.getConnection(function(err,connection){
			if(err) throw err;
			connection.query(sql,function(err,data){
				if(err) throw err;
				cb(data);
				connection.release();
			});
		});

	}
}
