function newline(){
    return edit("\n");
    //rng.insertNode(tonode("<br>"));
}
function islinetab(node){
    return node!=null&&node!=undefined&&node.nodeName=="SPAN"&&node.className=="linetab";
}
function minlinetab(node){
    while(node.id!="code"){
        if(islinetab(node)){
            return node;
        }else{
            node=node.parentElement;
        }
    }
    return null;
}
function flinetab(rng,func){
    let lts=document.getElementsByClassName("linetab");
    let start=0;
    let str=undefined;
    for(let i=start;i<lts.length;i=i+1){
        console.log(i);
        if(rng.comparePoint(lts[i], 0)<=0){
            start=i;
        }else{
            break;
        }
    }
    for(let i=start; i<lts.length; i=i+1){
        str=func(lts[i].innerText,lts[start].innerText);
        if(str==lts[i].innerText){
            break;
        }else{
            lts[i].innerText=str;
        }
    }
}
function tab(x,y){
    if(y.length<=x.length){
        return x+"  ";
    }else{
        return x;
    }
}