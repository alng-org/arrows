function keys(){
    return {list:[`→`,`❨`,`❩`],
            isleft:(key)=>(key==`❨`),
            isright:(key)=>(key==`❩`),
            arrow:`→`,
            pair:`❨❩`,
            input:keymap};
}
function insertpair(pair){
    let rng=reselect(getsel());
    let src=getsrc(rng.cloneContents());
    rng=edit(pair,keys());
    let gp=rng.endContainer.childNodes[rng.endOffset-1];
    rng.setStart(gp,1);
    rng.setEnd(gp,1);
    edit(src,keys());
    focusingroup(gp);
    return gp;
}
function keymap(event = null) {
    if(event.altKey){
        if(/^(Arrow)?Right/.test(event.key)){
            edit(keys().arrow,keys());
            return true;
        }else if(/Enter/.test(event.key)){
            insertpair(keys().pair);
            return true;
        }else{
            return false;
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
    rng.insertNode(format(keys().pair,keys()));
    let gp=rng.endContainer.childNodes[rng.endOffset-1];
    gp.id="init";
    rng.setStart(gp,1);
    rng.setEnd(gp,1);
    focusingroup(gp);
    let f=(click,text,left,width)=>(`<button onclick="${click}"
                                             style="font-family:math;
                                                    font-size:1.5em;
                                                    font-weight:bold;
                                                    background-color:brown;
                                                    color:orange;
                                                    position:fixed;
                                                    left:${left};top:90%;
                                                    width:${width};height:10%">${text}</button>`);
    let code_focus=`document.getElementById('code').focus()`;
    let htmls=[f(`edit('${keys().arrow}',keys());${code_focus}`,
                 `${keys().arrow} (Alt+${keys().arrow})`,
                 "0%","50%"),
               f(`insertpair('${keys().pair}');${code_focus}`,
                 `${keys().pair} (Alt+Enter)`,
                 "50%","50%")];
    let html=htmls.reduce((x,y)=>(x+y));
    document.body.append(tonode(html));
}