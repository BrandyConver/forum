//表单序列化
function serialize(form){
	var parts=[],
	field=null,
	i,
	len,
	j,
	optLen,
	option,
	optValue;
	for(i=0,len=form.elements.length;i<len;i++){
		field=form.elements[i];
		switch(field.type){
			case 'select-one':
			case 'select-multiple':
			if(field.name.length){
				for(j=0,optLen=field.options.length;j<optLen;j++){
					option=field.option[j];
					if(option.selected){
						optValue=option.hasAttribute('value')?option.value:option.text;
						parts.push(`${field.name}=${optValue}`);
					}

				}
			}
			break;
			case undefined:
			case 'file':
			case 'submit':
			case 'reset':
			case 'button':
			break;
			case 'radio':
			case 'checkbox':
			if(field.checked){
				break;
			}
			default:
			if(field.name.length){
				parts.push(`${field.name}=${field.value}`);
			}
		}
	}
	return parts.join('&');
}