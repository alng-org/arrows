function node(html){
    let range = document.createRange();
    return range.createContextualFragment(html);
}
function doc(src){
    let Doc=document.createDocumentFragment();
    for(let atom of src.match(/\{|\[|\(|→|←|\)|\]|\}|[^\{\[\(→←\)\]\}]+/g)){
        if(atom == `→`){
            Doc.append(node(`<span class="arrow" >→</span>`));
        }else if(atom ==`←`){
            Doc.append(node(`<span class="varrow" >←</span>`));
        }else if(`{}[]()`.includes(atom)){
            Doc.append(node(`<span class="quote" >${atom}</span>`));
        }else if(atom == `\n`){
            Doc.append(node(`<br>`));
        }else{
            Doc.append(atom);
        }
    }
    return Doc;
}
function src(doc){
    let Src=``;
    for (let node of doc.childNodes){
        if(node.nodeName == `BR` && node.className == ``){
            Src=Src+`\n`;
        }else{
            Src=Src+node.textContent;
        }
    }
    return Src;
}
function pair(doc){
    let unpair_list=[];
    let last=undefined;
    let level=0;
    for (let q of doc.querySelectorAll(".quote")){
        q.classList.remove(`quote_0`,
                           `quote_1`,
                           `quote_2`,
                           `quote_unpair`,
                           `quote_current_pair`);
        switch(q.textContent){
            case `{`:
            case `[`:
            case `(`:
                unpair_list.push(q);
                level=level+1;
                break;
            case `}`:
            case `]`:
            case `)`:
                last=unpair_list[unpair_list.length-1];
                if(last != undefined && paired(last.textContent) == q.textContent ){
                    unpair_list.pop();
                    level=level-1;
                    last.classList.add(`quote_${level % 3}`);
                    q.classList.add(`quote_${level % 3}`);
                }else{
                    unpair_list.push(q);
                }
                break;
            default:
                //PASS
        }
    }
    for(let unpair of unpair_list){
        unpair.classList.add(`quote_unpair`);
    }
    return unpair_list.map(q=>q.textContent);
}
function current_pair(sel){
    //can it redesign?
    pair(document);
    sel=resel(sel.cloneRange());
    let fcon=(con,ofs)=>{
        if(con.nodeName == `#text`){
            return con;
        }else{
            let tmp = con.childNodes[ofs];
            return  ( tmp == undefined ) ? null : tmp; //Although in below, e != null will be false where e == undefined
        }
    }
    let search_quote=(init_con,next,level,target_level)=>{
        let con = null;
        for(let e=init_con; e != null && level != target_level; e=next(e)){
            if(e.nodeName == `SPAN`){
                switch(e.textContent){
                    case `{`:
                    case `[`:
                    case `(`:
                        level = level + 1;
                        con = e;
                        break;
                    case `}`:
                    case `]`:
                    case `)`:
                        level = level - 1;
                        con = e;
                        break;
                    default:
                        //PASS
                }
            }else{
                //PASS
            }
        }
        return (level == target_level)? con : null;
    };
    let mark=(sel,container,offset,next,
              target_level,class_name,
              init_level,
              default_offset)=>{
        let con = fcon(container(sel),offset(sel));
        let root=(con == null)? null : con.parentNode;
        con=search_quote(con,next,init_level,target_level);
        if(con != null){
            con.classList.add(class_name);
        }else{
            con=(root == null)? null : root.childNodes[default_offset(root)];
                // default_offset (container -> offset) is used for returning a default con (contanier) to set sel
                // in the returned lambda func of func current_pair
                // See it at below, before return expr
        }
        return con;
    };
    let unpair=pair(sel.cloneContents());
    let start=mark(sel,(s)=>s.startContainer,(s)=>s.startOffset-1,(s)=>s.previousSibling,
         1,`quote_current_pair`,
         unpair.reduce((x,y)=>x + ( ( `)]}`.includes(y) ) ? -1 : 0 ) , 0),
         (r)=>0);
    let end=mark(sel,(s)=>s.endContainer,(s)=>s.endOffset,(s)=>s.nextSibling,
         -1,`quote_current_pair`,
         unpair.reduce((x,y)=>x + ( ( `{[(`.includes(y) ) ? 1 : 0 ) , 0),
         (r)=>r.childNodes.length-1);
    return (sel)=>{
        if(start != null && end != null){
            sel.setStartBefore(start);
            sel.setEndAfter(end);
            return true;
        }else{
            return false;
        }
    };
}
function resel(sel){
    let move=(sel,container,offset,
              setSideBefore,setSideAfter)=>{
        let con=container(sel).parentNode;
        if(con.nodeName == `SPAN`){
            if(offset(sel) == 0){
                setSideBefore(sel,con);
            }else{
                setSideAfter(sel,con);
            }
        }else{
            //PASS
        }
    }
    move(sel,(s)=>s.startContainer,(s)=>s.startOffset,
         (s,c)=>s.setStartBefore(c),(s,c)=>s.setStartAfter(c));
    move(sel,(s)=>s.endContainer,(s)=>s.endOffset,
         (s,c)=>s.setEndBefore(c),(s,c)=>s.setEndAfter(c));
    return sel;
}
function getsel(){
    let sel=window.getSelection().getRangeAt(0);
    return sel;
}
function after_edit(){
    //pair(document);
    document.normalize();

   // current_pair(getsel());
}
function edit(str){
    let sel=resel(getsel());
    sel.deleteContents();
    sel.insertNode(doc(str));
    sel.collapse(false);
    after_edit();
}
function is_mobile(){
  return (`ontouchstart` in document.documentElement); 
  //See more at: https://www.ruanyifeng.com/blog/2021/09/detecting-mobile-browser.html
  //NOTE: I don't know whether it works in any devices.
}
function edit_arrow(){
    edit(`→`);
}
function edit_varrow(){
    edit(`←`);
}
function edit_pair(empty_pair){
    let sel=resel(getsel());
    let ct=sel.cloneContents();
    edit(empty_pair);
    sel=resel(getsel());
    sel.setStartBefore(sel.startContainer.childNodes[sel.startOffset-1]);
    sel.collapse(true);
    sel.insertNode(ct);
    sel.collapse(false);
    after_edit();
}
function keydown(event) {
    if((event.ctrlKey || event.altKey || event.shiftKey)){
        if(/(Arrow)?Right/.test(event.key)){
            event.preventDefault();
            edit_arrow();
        }else if(/(Arrow)?Left/.test(event.key)){
            event.preventDefault();
            edit_varrow();
        }else{
            //pass
        }
    }else if(/Enter/.test(event.key)){
        event.preventDefault();
        edit(`\n`);
    }else if(/\(/.test(event.key)){
        event.preventDefault();
        edit_pair(`()`);
    }else if(/\[/.test(event.key)){
        event.preventDefault();
        edit_pair(`[]`);
    }else if(/\{/.test(event.key)){
        event.preventDefault();
        edit_pair(`{}`);
    }else if((event.ctrlKey || event.altKey) && /Q|q/.test(event.key)){
        event.preventDefault();
        let sel=getsel();
        let fsel=current_pair(sel);
        fsel(sel);
    }else if(/Tab/.test(event.key)){
        event.preventDefault();
        edit(`\t`);
    }else{
        /*PASS*/
    }
}
function beforeinput(event) {
    if(/insertText/.test(event.inputType)){
        event.preventDefault();
        edit(event.data);
    } else if (/insertCompositionText/.test(event.inputType)) {
        // Pending
    }else if(/deleteContentBackward/.test(event.inputType)){//press backspace
        resel(getsel());
    } else if(/deleteContentForward/.test(event.inputType)){// press del
        resel(getsel());

    }else{
        //PASS
    }
}
function input(event) {
    if(/deleteContentBackward/.test(event.inputType)){//press backspace
        after_edit();
    } else if(/deleteContentForward/.test(event.inputType)){// press del
        after_edit();
    }else{
        //PASS
    }
}
function compositionstart(event) {
    let sel=resel(getsel());
    sel.deleteContents();
    sel.insertNode(node(`<span id="tmp">&zwnj;</span>`));
    sel.setStart(document.getElementById("tmp"),0);
    sel.setEnd(document.getElementById("tmp"),1);
}
function compositionend(event) {
    let rng = getsel();
    rng.selectNode(document.getElementById("tmp"));
    edit(rng.toString());
}
function copy(event) {
    resel(getsel());
}
function cut(event) {
    resel(getsel());
    //After edit
}
function paste(event) {
    event.preventDefault();
    edit(event.clipboardData.getData("text/plain"));
}
function focus(event){
    //console.log(event);   
    current_pair(getsel());
}
function selectionchange(event){
    //console.log(event);   
    current_pair(getsel());
}
function init(code){
    code.focus();
   // setInterval(focus,100);
    code.addEventListener("keydown",keydown);
    code.addEventListener("beforeinput", beforeinput);
    code.addEventListener("input", input);
    code.addEventListener('compositionstart', compositionstart);
    //code.addEventListener('compositiin')
    code.addEventListener('compositionend', compositionend);
    code.addEventListener("copy", copy());
    code.addEventListener("cut", cut());
    code.addEventListener("paste", paste);
    code.addEventListener("focus",focus);
    document.addEventListener("selectionchange",selectionchange); // selectionchange is base on document specialy
    //==============
    let key_frame=document.styleSheets[0].cssRules[1]; //@key_frame arrow_animi
    for(let i=0;i<=100;i=i+1){
        key_frame.appendRule(`
        ${i}% {
            background-image:linear-gradient(to right,orange ${i-100}%,red,orange ${i}%,red,orange ${i+100}%);
        }`);
    }
    if(is_mobile() == true){
        edit(`Please use computer visits it.`); 
    }else{
        edit(`\
( to input ()
[ to input []
{ to input {}
Alt or Ctrl or Shift + RightArrow to input →
Alt or Ctrl or Shift + LeftArrow to input ←
`);
    }
}
