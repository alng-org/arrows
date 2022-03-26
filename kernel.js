let map={};
function getsrc(code){
    let src=``;
    for(let node of code.childNodes){
        if(node.nodeName=="DIV"&&node.innerHTML==``){
            node.remove();
        }
    }
    for(let node of code.childNodes){
        if(node.nodeName=="#text"){
            src=src+node.data;
        }else if(node.nodeName=="DIV"){
            if(node==code.firstChild){
                src=src+getsrc(node);
                if(node!=code.lastChild&&node.nextSibling.nodeName!="DIV"){
                    src=src+"\n";
                }
            }else{
                src=src+"\n"+getsrc(node);
            }
        }else{
            src=src+getsrc(node);
        }
    }
    return src;
}
function view(code,name){
    if(name.value!=``){
        code.focus();
        if(map[name.value]==undefined){
            map[name.value]=``;
            let opt=document.createElement("option");
            opt.value=name.value;
            name.list.append(opt);
        }
        if(name.dataset.last!=``){
            map[name.dataset.last]=getsrc(code);
        }
        code.innerHTML=``;
        code.append(format(map[name.value],keys()));
    }
}