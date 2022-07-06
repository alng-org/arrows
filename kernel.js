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
function group_color(level=0){
    if(0<=level&&level<5){
        return ["lightskyblue","lightcoral","cadetblue",
                "lightpink","violet"][level];
    }else{
        return "gray";
    }
}
function set_color(container,is_focus,classname,bcolor,scolor,acolor){
    if(isgroup(container)){
        container.className=classname;
        container.style.backgroundColor=bcolor;
        let level=group_level(container,document.getElementById("init"));
        let level_func={false:(x)=>(-1),
                        true:(x)=>{
                            if(0<=x&&x<5){
                                return (x+level)%5;
                            }else{
                                return x;
                            }
                        }}[is_focus];
        container.style.color=scolor(level_func(0));
        let groups=container.getElementsByClassName("group");
        for(let group of groups){
            group.style.color=scolor(level_func(group_level(group,container)));
        }
        let nodes=container.getElementsByClassName("arrows");
        for (let node of nodes){
            node.style.color=acolor(getsrc(node),
                                    level_func(group_level(node.parentElement,container)));
        }
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
function focusingroup(node){
    let last=document.getElementsByClassName("group_focus")[0];
    if(last==undefined){
        last=document.getElementById("init");
    }
    if(last!=node){
        set_color(last,false,"group","",group_color,keys().color);
    }
    set_color(node,true,"group_focus","khaki",group_color,keys().color);
}
function format(src){
    for(let key of keys().list){
        if(keys().isleft(key)){
            src=src.replaceAll(keys().code(key),`\x01\0${keys().color(key)} ${key}\0`);
        }else if(keys().isright(key)){
            src=src.replaceAll(keys().code(key),`\0${keys().color(key)} ${key}\0\x02`);
        }else{
            src=src.replaceAll(keys().code(key),`\0${keys().color(key)} ${key}\0`);
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