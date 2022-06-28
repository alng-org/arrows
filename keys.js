function keys(){
    return {list:[`→`,`›`,`‑`],
            isarrow:(key)=>(key==`→`),
            isleft:(key)=>(key==`›`),
            isright:(key)=>(key==`‑`),
            arrow:`→`,
            pair:`›‑`,
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
function beforepair(rng){
    rng.collapse(true);
    let container=common_min_asone(rng);
    rng.selectNode(container.childNodes[0]);
    rng.collapse(true);
    return reselect(rng);
}
function afterpair(rng){
    rng.collapse(false);
    let container=common_min_asone(rng);
    rng.selectNode(container.childNodes[container.childNodes.length-1]);
    rng.collapse(false);
    return reselect(rng);
}
function keymap(event = null) {
    if(event.altKey){
        if(/^(Arrow)?Right/.test(event.key)){
            edit(keys().arrow,keys());
            return true;
        }else if(/Enter/.test(event.key)){
            insertpair(keys().pair);
            return true;
        }else if(/Home/.test(event.key)){
            beforepair(getsel());
            return true;
        }else if(/End/.test(event.key)){
            afterpair(getsel());
            return true;
        }else{
            return false;
        }
    }
    return false;
}
function initmap(code,first=true){
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
    if(first==true){
        let f=(click,text,left,width)=>(`<button onclick="${click}"
                                             style="font-family:math;
                                                    font-size:2.5em;
                                                    font-weight:bold;
                                                    background-color:brown;
                                                    color:orange;
                                                    position:fixed;
                                                    left:${left};top:90%;
                                                    width:${width};height:10%">${text}</button>`);
        let code_focus=`document.getElementById('code').focus()`;
        let htmls=[f(`edit('${keys().arrow}',keys());${code_focus}`,
                     `${keys().arrow} (Alt+${keys().arrow})`,
                     "25%","25%"),
                   f(`insertpair('${keys().pair}');${code_focus}`,
                     `${keys().pair} (Alt+Enter)`,
                     "50%","25%"),
                    f(`beforepair(getsel());${code_focus}`,
                      `<< (Alt+Home)`,
                      "0%","25%"),
                      f(`afterpair(getsel());${code_focus}`,
                        `>> (Alt+End)`,
                        "75%","25%")];
        let html=htmls.reduce((x,y)=>(x+y));
        document.body.append(tonode(html));
    }
}