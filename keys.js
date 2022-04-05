function keys(){
    return {list:[`→`,`←`,
                  `↱`,'⎘','⎗',
                  `⇱`,
                  `↲`],
            isleft:(key)=>(key==`↱`||key=='⎘'||key=='⎗'||key==`⇱`),
            isright:(key)=>(key==`↲`),
            isleft_combine:(key)=>(key=='⎘'),
            isright_combine:(key)=>(key=='⎗'),
            islink:(key)=>(key==`⇱`),
            input:keymap};
}
function pairkeys(){
    let pk={};
    pk[keys()[2]]=[keys()[3],keys()[5]];
    pk[keys()[4]]=[keys()[5]];
    return pk;
}
function insertpair(pair){
    let rng=edit(pair,keys());
    let gp=rng.endContainer.childNodes[rng.endOffset-1];
    rng.setStart(gp,1);
    rng.setEnd(gp,1);
    return gp;
}
function keymap(event = null) {
    if(event.altKey){
        if(/^(Arrow)?Right/.test(event.key)){
            edit(`→`,keys());
            return true;
        }else if(/^(Arrow)?Left/.test(event.key)){
            edit(`←`,keys());
            return true;
        }else if(/Enter/.test(event.key)){
            insertpair(`↱↲`);
            return true;
        }else if(/Home/.test(event.key)){
            insertpair(`⎘↲`);
            return true;
        }else if(/End/.test(event.key)){
            insertpair(`⎗↲`);
            return true;
        }else if(/\\/.test(event.key)){
            insertpair(`⇱↲`);
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
    rng.insertNode(format(`↱↲`,keys()));
    let gp=rng.endContainer.childNodes[rng.endOffset-1];
    gp.id="init";
    rng.setStart(gp,1);
    rng.setEnd(gp,1);
    focusingroup(gp);
}