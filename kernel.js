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
    while(node!=null&&node!=undefined&&node.id!="code"){
        if(isgroup(node)){
            return node;
        }else{
            node=node.parentElement;
        }
    }
    return null;
}
function group_level(node,basenode){
    let level=0;
    while(node!=basenode){
        node=node.parentElement;
        level=level+1;
        if(node.id=="code"){
            return -1;
        }
    }
    return level;
}
function set_color(container,classname,bcolor){
    if(isgroup(container)){
        container.className=classname;
        container.style.backgroundColor=bcolor;
    }
}







function focusingroup(node){
    let last=document.getElementsByClassName("group_focus")[0];
    if(last!=node){
        set_color(last,"group","");
        set_color(node,"group_focus","khaki");
    }
}
function img_show(rng){
    let src=getsrc(rng.cloneContents());
    let img=format(getsrc(tonode(`<img src="${src}">`))).childNodes[0];
    img.decode().then(()=>{
        rng.deleteContents();
        rng.insertNode(img);
        rng.collapse(false);
    }).catch((err)=>{
        rng.deleteContents();
        alert(err);
    });
}
function format(src,level=0){
    let arrow=keys().arrow;
    let left=keys().left;
    let right=keys().right;
    let quote=keys().quote;
    src=src.replaceAll(keys().code(arrow),`\0${keys().color(arrow)} ${arrow}\0`);
    src=src.replaceAll(keys().code(left),`\x01\0\x04 ${left}\0`);
    src=src.replaceAll(keys().code(right),`\0\x05 ${right}\0\x02`);
    src=src.replaceAll(keys().code(quote),`\0${keys().color(quote)} ${quote}\0`)
    let st=0;
    let f=(match)=>{
        if(match=="\x04"){
            st=st+1;
            return keys().color(left,st+level);
        }else if(match=="\x05"){
            let x=st;
            st=st-1;
            return keys().color(right,x+level);
        }else{
            return "";
        }
    }
    src=src.replace(/\x04|\x05/g,f);
    if(st==0){
        src=fhtml(src).replace(/\0(.*?) (.*?)\0/g,`<span class="arrows" style="font-family:math;color:$1;">$2</span>`)
                      .replace(/\x01/g,`<span class="group">`)
                      .replace(/\x02/g,`</span>`)
                      .replace(/\x03(.*?)\x03/g,`<img src="$1"
                                                      onclick="if(this.style.height==''){
                                                                    this.style.height='1em';
                                                               }else{
                                                                    this.style.height='';
                                                               }"
                                                      style="height:1em;/*margin-left:0.1em;*/margin-right:0.1em">`);
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
        if(node.className=="arrows"){
            src=src+keys().code(getsrc(node));
        }else if(node.nodeName=="#text"){
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
        }else if(node.nodeName=="IMG"){
            src=src+`\x03${node.src}\x03`;
        }else{
            src=src+getsrc(node);
        }
    }
        return src;
}
function type(x){
    if(Array.isArray(x)){
        if(x.length==0){
            return "expr";
        }else if(x.length==1){
            return "arrow";
        }else if(x.length==2){
            return "node";
        }else{
            return "expr";
        }
    }else if(typeof(x)=="string"){
        return "text";
    }else{
        return typeof(x);
    }
}
function expr(nodes=reselect().cloneContents()){ //reverse: show
    let src=[];
    let fadd=(x,y)=>{
        if(type(x[x.length-1])=="text"&&
           type(y[0])=="text"){
            let t=x.pop();
            y[0]=t+y[0];
        }else if(type(x[x.length-1])=="arrow"&&
                 type(y[0])=="arrow"){
            x=x.concat([""]);
        }
        return x.concat(y);
    };
    for(let node of nodes.childNodes){
        if(node.nodeName=="DIV"&&node.innerHTML==``){
            node.remove();
        }
    }
    for(let node of  nodes.childNodes){
        if(node.className=="arrows"){
            src=fadd(src,[expr(node)]);
        }else if(node.nodeName=="#text"){
            src=fadd(src,[node.data]);
        }else if(node.nodeName=="BR"&&node.nextSibling!=null){
            src=fadd(src,["\n"]);
        }else if(isgroup(node)){
            src=fadd(src,[expr(node)]);
        }else if(node.innerText!=""){//HERE
            src=fadd(src,expr(node));
        }else{
            src=fadd(src,[[node.nodeName,
                           node.cloneNode(true)]]);
        }
    }
    return src;
}
function show(expr,level=0){ //reverse: expr
    let doc=new DocumentFragment();
    for(let element of expr){
        if(type(element)=="arrow"){
            let arrow=document.createElement("span");
            arrow.className="arrows";
            arrow.style.fontFamily="math";
            arrow.style.color=keys().color(element[0],level);
            arrow.append(element[0]);
            doc.append(arrow);
        }else if(type(element)=="text"){
            doc.append(element);
        }else if(type(element)=="expr"){
            let group=document.createElement("span");
            group.className="group";
            group.append(show(element,level+1));
            doc.append(group);
        }else{
            doc.append(element[1].cloneNode(true));
        }
    }
    return doc;
}
//structuredClone : Deep Copy the data,see more at:https://developer.mozilla.org/zh-CN/docs/Web/API/structuredClone