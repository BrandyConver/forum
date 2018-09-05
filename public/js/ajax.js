//json({url='',method='',data={},cb=function(),);
function ajax(json){
    var xhr=new XMLHttpRequest();

    switch(json.method){
        case 'get':
            xhr.open('get',json.url+'?'+json2url(json.data),true);
            xhr.send();
            break;
        case 'post':
            xhr.open('post',json.url,true);
            xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
            xhr.send(json2url(json.data));
            break;
    }

    xhr.onreadystatechange=function(){
        if(xhr.readyState==4){
            if(xhr.status>=200 && xhr.status<300 || xhr.status==304){
                json.cb(xhr.responseText);
            }else{
                alert(xhr.status+'  '+xhr.responseText);
            }
        }
    };
}

function json2url(json){
    var arr=[];
    for(var name in json){
        arr.push(name+'='+json[name]);
    }
    return arr.join('&');
}