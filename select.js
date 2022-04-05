function move(point,at,extend,fmove,fasone){
    let container=point.container;
    let offset=point.offset;
    let pct=undefined;
    let elt=undefined;
    if(container.nodeName=="#text"){
        let mk=(offset)=>{
            return {parentElement:container,
                    data:container.data[offset]};
        };
        pct={parentElement:container.parentElement,
             firstChild:mk(0),
             lastChild:mk(container.data.length-1)};
        elt=mk(offset);
    }else{
        pct=container;
        elt=pct.childNodes[offset];
    }
    while(elt!=undefined&&pct.parentElement!=null&&fasone(pct)==false){
        pct=pct.parentElement;
        elt=elt.parentElement;
    }
    if(fasone(pct)){
        let tags="";
        if(/start/.test(at)&&elt==pct.firstChild){
                tags=tags+"start ";
        }
        if(/end/.test(at)&&(elt==undefined||elt==pct.lastChild)){
                tags=tags+"end ";
        }
        if((tags!=""&&isgroup(pct)==false)||extend){
            return fmove({node:pct,tag:tags});
        }else{
            return fmove({});
        }
    }else{
        return fmove({});
    }
}
function common_min_asone(range,fasone=isgroup){
    let common=range.commonAncestorContainer;
        while(common.id!="code"&&fasone(common)==false){
            common=common.parentElement;
        }
    return common;
}
function reselect(rng,forced_extend=false,common=undefined){
    let extend=(rng.collapsed==false);
    let group=(x)=>(x.nodeName=="SPAN");
    if(common==undefined){
        common=common_min_asone(rng);
    }
    let excond=(point)=>{
        let cot=point.container;
        while(cot!=null&&cot!=common){
            if(group(cot)){
                return true;
            }else{
                cot=cot.parentElement;
            }
        }
        return false;
    };
    let fstart=(rng)=>{
        return {container:rng.startContainer,
                   offset:rng.startOffset};
    };
    let fend=(rng)=>{
        return {container:rng.endContainer,
                   offset:rng.endOffset};
    };
    let start=fstart(rng);
    let end=fend(rng);
    let startbefore=(node)=>{
        node=node.node;
        if(node!=undefined){
            rng.setStartBefore(node);
        }
        let st=fstart(rng);
        if(isgroup(st.container)&&st.offset==0){
            rng.setStartBefore(st.container);
        }
        return rng;
    };
    let endafter=(node)=>{
        node=node.node;
        if(node!=undefined){
            rng.setEndAfter(node);
        }
        let ed=fend(rng);
        if(isgroup(ed.container)&&ed.offset==ed.container.childNodes.length){
            rng.setEndAfter(ed.container);
        }
        return rng;
    };
    let drng=rng.cloneRange();
    if(forced_extend){
        if(group(common)){//can't combine with previous cond : forced
            rng.selectNode(common);
        }
    }else{
        rng=move(start,"start",extend&&excond(start),startbefore,group);
        rng=move(end,"end",extend&&excond(end),endafter,group);
        if(extend==false){
            rng.collapse(start.offset==0);
        }
        start=fstart(rng);
        end=fend(rng);
        common=common_min_asone(rng);
        let cmp=(how)=>(rng.compareBoundaryPoints(how,drng));
        let issame=(cmp(Range.START_TO_START)==0&&cmp(Range.END_TO_END,drng)==0);
        if(issame==false&&(excond(start)||excond(end))){
            return reselect(rng,forced_extend,common);
        }
    }
    return rng;
}
function getsel(){
    return window.getSelection().getRangeAt(0);
}