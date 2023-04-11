function common_min_asone(range,fasone=isgroup){
    let common=range.commonAncestorContainer;
        while(common!=null&&common!=undefined&&
              common.id!="code"&&fasone(common)==false){
            common=common.parentElement;
        }
    return common;
}
function reselect(rng=getsel(),forced_extend=false){
    let reset=(p)=>{
        if(p.n.id=="code"){ //do not combine with [if(p.n==p.c)]
            return {s:(rng)=>false,
                    e:(rng)=>false};
        }else if(p.o==0){
            return {s:(rng)=>{rng.setStartBefore(p.n);return true},
                    e:(rng)=>{rng.setEndBefore(p.n);return true}};
        }else if(p.o==p.l){
            return {s:(rng)=>{rng.setStartAfter(p.n);return true},
                    e:(rng)=>{rng.setEndAfter(p.n);return true}};
        }else if(p.c){
            return {s:(rng)=>false,
                    e:(rng)=>false};
        }else{
            return {s:(rng)=>{rng.setStartBefore(p.n);return true},
                    e:(rng)=>{rng.setEndAfter(p.n);return true}};
        }
    }
    let fpoint=(node,offset,common)=>{
        if(node.nodeName=="#text"){
            return {n:node,o:offset,
                    c:common==node.parentElement,
                    l:node.data.length};
        }else{
            return {n:node,o:offset,
                    c:common==node,
                    l:node.childNodes.length};
        }
    };
    let common=common_min_asone(rng);
    common.normalize();
    let pos={s:fpoint(rng.startContainer,rng.startOffset,common),
             e:fpoint(rng.endContainer,rng.endOffset,common)};
    if(forced_extend){
        rng.selectNode(common);
        return rng;
    }else{
        let a=reset(pos.s).s(rng);
        let b=reset(pos.e).e(rng);
        if(a||b){
            return reselect(rng);
        }else{
            return rng;
        }
    }
}
function select_text(rng,forced_extend=false){
    rng=reselect(rng);
    let container=rng.commonAncestorContainer;
    let offset=rng.startOffset;
    if(rng.collapsed){
        let node=[container.childNodes[offset],
                  container.childNodes[offset-1],
                  container];
        node=node.filter((x)=>(x!=undefined&&x.nodeName=="#text"))[0];
        if(node!=undefined){
            rng.selectNode(node);
            return rng;
        }else{
            return undefined;
        }
    }else if(container.nodeName=="#text"){
        if(forced_extend){
            rng.selectNode(container);
        }
        return rng;
    }else{
        return undefined;
    }
}
let keeped_sel=undefined;
function getsel(){
    let sel=window.getSelection().getRangeAt(0);
    return sel;
}
function keep_sel(){
    keeped_sel=getsel().cloneRange();
}
function recover_sel(){
    if(keeped_sel!=undefined){
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(keeped_sel);
        return true;
    }else{
        return false;
    }
}