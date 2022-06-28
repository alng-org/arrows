let map={};
function fhtml(str){
    const div=document.createElement("div");
    div.innerText=str;
    return div.innerHTML;
}
function tonode(html){
    let range = document.createRange();
    return range.createContextualFragment(html);
}
function isgroup(node){
    return node!=null&&node!=undefined&&node.nodeName=="SPAN"&&/group/.test(node.className);
}
function mingroup(node){
    while(node.id!="code"){
        if(isgroup(node)){
            return node;
        }else{
            node=node.parentElement;
        }
    }
    return null;
}
function focusingroup(node){
    let fset=(container,classname,bcolor,color,acolor,pcolor)=>{
        if(isgroup(container)){
            container.normalize();
            container.className=classname;
            container.style.backgroundColor=bcolor;
            container.style.color=color;
            let nodes=container.getElementsByClassName("arrows");
            let isarrow=keys().isarrow;
            for (let node of nodes){
                if(isarrow(node.innerText)){
                    node.style.color=acolor;
                }else{
                    node.style.color=pcolor;
                }
            }
        }
    };
    let last=document.getElementsByClassName("group_focus")[0];
    fset(last,"group","","","lightcoral","lightskyblue");
    fset(node,"group_focus","yellow","green","red","blue");
}
function format(src,keys){
    for(let key of keys.list){
        if(keys.isleft(key)){
            src=src.replaceAll(key,`\x01\0${key}\0`);
        }else if(keys.isright(key)){
            src=src.replaceAll(key,`\0${key}\0\x02`);
        }else{
            src=src.replaceAll(key,`\0${key}\0`);
        }
    }
    let st=0;
    for(let ch of src){
        if(ch==`\x01`){
            st=st+1;
        }else if(ch==`\x02`){
            st=st-1;
            if(st<0){
                break;
            }
        }
    }
    if(st==0){
        src=fhtml(src).replace(/\0.*?\0/g,`<span class="arrows" style="font-family:math;color:red;">$&</span>`)
                      .replace(/\x01/g,`<span class="group">`)
                      .replace(/\x02/g,`</span>`);
        return tonode(src);
    }else{
        alert("grammer error!");
        return tonode(``);
    }
}
function getsrc(code){ //reverse : format
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
            }else{
                src=src+"\n"+getsrc(node);
            }
            if(node.nextSibling!=null&&node.nextSibling.nodeName!="DIV"){
                src=src+"\n";
            }
        }else if(node.nodeName=="BR"&&node.nextSibling!=null){
            src=src+"\n";
        }/*else if(node.nodeName=="IMG"||
                (isgroup(node))){
            src=src+`\0\x01${node.outerHTML}\0`;
        }*/else{
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
        if(map[name.value]==``){
            initmap(code,false);
        }else{
            code.append(format(map[name.value],keys()));
        }
    }
}