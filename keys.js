function meta_keys(_arrow=undefined,_left=undefined,_right=undefined){
    if(_arrow==undefined){
        _arrow=keys().arrow;
    }
    if(_left==undefined){
        _left=keys().left;
    }
    if(_right==undefined){
        _right=keys().right;
    }
    let keys_set=new Set();
    keys_set.add(_arrow);
    keys_set.add(_left);
    keys_set.add(_right);
    if(keys_set.size<3){
        return keys;
    }else{
        return ()=>{
            return {list:[_arrow,_left,_right],
                    arrow:_arrow,
                    left:_left,
                    right:_right,
                    isarrow:(key)=>(key==_arrow),
                    isleft:(key)=>(key==_left),
                    isright:(key)=>(key==_right),
                    arrow_code:`\0${_arrow}\0`,
                    pair_code:`\0${_left}\0\0${_right}\0`,
                    code:(key)=>(`\0${key}\0`),
                    color:keycolor,
                    input:keymap};
        }
    }
}
let default_keys=meta_keys(`→`,`›`,`‑`);
let keys=default_keys;
function change_keys(keys_map){//keys_map={arrow:arrow_str, left:left_str, right:right_str} You can just give what you need to change
    let nodes=document.getElementsByClassName("arrows");
    let new_keys=meta_keys(keys_map.arrow,
                           keys_map.left,
                           keys_map.right);
    for(let node of nodes){
        if(keys().isarrow(node.innerText)){
            node.innerText=new_keys().arrow;
        }else if(keys().isleft(node.innerText)){
            node.innerText=new_keys().left;
        }else if(keys().isright(node.innerText)){
            node.innerText=new_keys().right;
        }
    }
    keys=new_keys;
}
function keycolor(key,level=0){
    if(keys().isarrow(key)){
        return "red";
    }else{
        return ["blue","blueviolet","hotpink"][level%3];
    }
}
function insertpair(pair){
    let rng=reselect(getsel());
    let src=getsrc(rng.cloneContents());
    rng=edit(pair);
    let gp=rng.endContainer.childNodes[rng.endOffset-1];
    rng.setStart(gp,1);
    rng.setEnd(gp,1);
    edit(src);
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
        if(/(Arrow)?Right/.test(event.key)){
            edit(keys().arrow_code);
            return true;
        }else if(/Enter/.test(event.key)){
            insertpair(keys().pair_code);
            return true;
        }else if(/Home/.test(event.key)){
            beforepair(getsel());
            return true;
        }else if(/End/.test(event.key)){
            afterpair(getsel());
            return true;
        }else if(/^(A|a)$/.test(event.key)){
            edit(keys().arrow);
            return true;
        }else if(/^(L|l)$/.test(event.key)){
            edit(keys().left);
            return true;
        }else if(/^(R|r)$/.test(event.key)){
            edit(keys().right);
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
    rng.insertNode(format(keys().pair_code));
    let gp=rng.endContainer.childNodes[rng.endOffset-1];
    gp.id="init";
    rng.setStart(gp,1);
    rng.setEnd(gp,1);
    focusingroup(gp);
    if(first==true){
        let code_focus=`document.getElementById('code').focus()`;
        //=====
        let f=(click,code,text,left,width)=>(`<button onclick="${click}"
                                               style="font-family:math;
                                                      font-size:2.5em;
                                                      font-weight:bold;
                                                      background-color:brown;
                                                      color:darkblue;
                                                      position:fixed;
                                                      left:${left};top:90%;
                                                      width:${width};height:10%">
                                                ${code}
                                                ${text}
                                                </button>`);
        let transform=(src)=>{
            return src.replace(/\0(.*?)\0/g,`<span class="arrows" style="color:gold;">$1</span>`);
        };
        let htmls=[f(`${code_focus};edit(keys().arrow_code)`,
                     transform(keys().arrow_code),`(Alt+→)`,
                     "25%","25%"),
                   f(`${code_focus};insertpair(keys().pair_code)`,
                     transform(keys().pair_code),`(Alt+Enter)`,
                     "50%","25%"),
                    f(`${code_focus};beforepair(getsel())`,
                      ``,`<< (Alt+Home)`,
                      "0%","25%"),
                      f(`${code_focus};afterpair(getsel())`,
                        ``,`>> (Alt+End)`,
                        "75%","25%")];
        let html=htmls.reduce((x,y)=>(x+y));
        document.body.append(tonode(html));
        //=====
        let _f=(which,value,text,left,width)=>(
            `<button onclick="if(document.activeElement.nodeName!='INPUT'){
                                    ${code_focus};
                                    edit(keys().${which});
                              }"
                     style="font-family:math;
                            font-size:2.5em;
                            font-weight:bold;
                            background-color:brown;
                            color:darkblue;
                            position:fixed;
                            left:${left};top:0%;
                            width:${width};height:10%">
             <input onclick="this.focus()"
                    style="font-size:1.0em;
                           width:20%;"
                    onchange="change_keys({${which}:this.value});
                              this.value=keys().${which};"
                    onfocusout="recover_sel()" value="${value}"> ${text}
            </button>`);
        let _htmls=[_f("left",keys().left,`(Alt+L)`,"0%","33.33%"),
                    _f("arrow",keys().arrow,`(Alt+A)`,"33.33%","33.33%"),
                    _f("right",keys().right,`(Alt+R)`,"66.66%","33.33%")];
        let _html=_htmls.reduce((x,y)=>(x+y));
        document.body.append(tonode(_html));
    }
}