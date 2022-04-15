function keys(){
    return {list:[`→`,
                  `\u2061`,`↱`,`≝`,`≟`,
                  `\u200b`,`↲`],
            isleft:(key)=>(key==`\u2061`||key==`↱`||key==`≝`||key==`≟`),
            isright:(key)=>(key==`\u200b`||key==`↲`),
            left:`\u2061`,
            visual_left:`↱`,
            right:`\u200b`,//zero width space:u+200b
            visual_right:`↲`,
            input:keymap};
}
function pairkeys(){
    let pk={};
    pk[keys()[2]]=[keys()[3],keys()[5]];
    pk[keys()[4]]=[keys()[5]];
    return pk;
}
function insertpair(pair,change_pair){
    if(change_pair){
        let rng=reselect(getsel().cloneRange(),change_pair);
        let gp=rng.endContainer.childNodes[rng.endOffset-1];
        let left=pair.replaceAll(keys().right,``);
        gp.childNodes[0].innerHTML=left;
        return gp;
    }else{
        let rng=reselect(getsel());
        let src=getsrc(rng.cloneContents());
        rng=edit(pair,keys());
        let gp=rng.endContainer.childNodes[rng.endOffset-1];
        rng.setStart(gp,1);
        rng.setEnd(gp,1);
        edit(src,keys());
        return gp;
    }
}
function keymap(event = null) {
    if(event.altKey){
        if(/^(Arrow)?Right/.test(event.key)){
            edit(`→`,keys());
            return true;
        }else if(/Enter/.test(event.key)){
            insertpair(`\u2061\u200b`,event.shiftKey);
            return true;
        }else if(/=|\+/.test(event.key)){
            insertpair(`≝\u200b`,event.shiftKey);
            return true;
        }else if(/-|_/.test(event.key)){
            insertpair(`≟\u200b`,event.shiftKey);
            return true;
        }
    }
    return false;
}
function initmap(code){
    let rng=document.createRange();
    rng.setStart(code,0);
    rng.setEnd(code,0);
    let rs=window.getSelection();
    rs.removeAllRanges();
    rs.addRange(rng);
    rng.insertNode(format(`\u2061\u200b`,keys()));
    let gp=rng.endContainer.childNodes[rng.endOffset-1];
    gp.id="init";
    rng.setStart(gp,1);
    rng.setEnd(gp,1);
    focusingroup(gp,keys);
}