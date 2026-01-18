function node(html){
    let range = document.createRange();
    return range.createContextualFragment(html);
}

let keywords = (code) =>{
    const kw = new Highlight();
    CSS.highlights.set("keyword",kw);
    let kws = new Set();
    return (keyword = null) =>{
        
        if(keyword !== null && /^\p{L}+$/v.test(keyword) === true){
            kws.add(keyword);
        }else{
            //PASS
        }







        
        kw.clear(); //clean highlight
        for(let text of 
            [...code.childNodes].filter(
                t => t.nodeName === "#text"
            )
           ){
            //highligh core
        }
    }
};




function doc(src){
    let Doc=document.createDocumentFragment();
    for(let atom of src.match(/[\{\[\(→←\)\]\}0-9[\p{ASCII}&&[\p{S}\p{P}]]]|[^\{\[\(→←\)\]\}0-9[\p{ASCII}&&[\p{S}\p{P}]]]+/gv) ?? []){
        if(atom === `→`){
            Doc.append(node(`<span class="arrow" >→</span>`));
        }else if(atom ===`←`){
            Doc.append(node(`<span class="varrow" >←</span>`));
        }else if(`{}[]()`.includes(atom)){
            Doc.append(node(`<span class="quote" >${atom}</span>`));
        }else if(/^[0-9]$/.test(atom)){
            Doc.append(node(`<span class="num" >${atom}</span>`));
        }else if(/^[\p{ASCII}&&[\p{S}\p{P}]]$/v.test(atom)){
            Doc.append(node(`<span class="sym" >${atom}</span>`));
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
    };
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
function expand_sel(){
    let sel = getsel();
    let expand = current_pair(sel);
    return expand(sel);
}
function getsel(){
    let sel=window.getSelection().getRangeAt(0);
    return sel;
}
function rect_sel(sel){
    if(sel.commonAncestorContainer.nodeName === "#text"){
        return sel.getBoundingClientRect();
    }else{
        let before_sel = sel.startContainer?.childNodes?.[sel.startOffset - 1];
        let after_sel = sel.endContainer?.childNodes?.[sel.endOffset];
        if(
            after_sel?.nodeName === "BR" || 
            after_sel?.nodeName === "SPAN"
        ){
            return after_sel.getBoundingClientRect();
        }else if(
            before_sel?.nodeName === "SPAN"
        ){
            let brt = before_sel.getBoundingClientRect();
            return new DOMRect(
                brt.right, // x
                brt.top,   // y
                0,         // width
                brt.height // height
            );
        }else if(
            before_sel?.nodeName === "BR"
        ){
            let brt = before_sel.getBoundingClientRect();
            return new DOMRect(
                - brt.right, // x
                brt.bottom,   // y
                0,         // width
                brt.height // height
            );
        }else{
            return null; // can't locate the caret
        }
    }
}
function visible_sel(code){
    // keep the caret visibility
    let sel = resel(getsel());
    if(sel.collapsed === true){
        let fscroll = (min,max) =>{
            return (t) => {
                if(t < min){
                    return t - min;
                }else if(t > max){
                    return t - max;
                }else{
                    return 0;
                }
            };
        };
        let code_rect = new DOMRect(
            0,                // x (special)
            0,                // y (special)
            code.clientWidth, // width
            code.clientHeight // height
        );
        let sel_rect = rect_sel(sel);
        let half_sel_h = sel_rect.height / 2;
        let padding = Number.parseFloat( window.getComputedStyle(code).padding );
        let xscroll = fscroll(
            code_rect.left + padding,
            code_rect.right - padding,
            code.scrollLeft
        );
        let yscroll = fscroll(
            code_rect.top + padding + half_sel_h,
            code_rect.bottom - padding - half_sel_h,
        );

        code.scrollBy(
            {
                left:xscroll(sel_rect.x),
                top:yscroll(sel_rect.y + half_sel_h),
                behavior:"smooth"
            }
        );
    }else{
        //PASS
    }   
}
function after_edit(){
    document.normalize();
}
function edit(str){
    let sel=resel(getsel());
    sel.deleteContents();
    sel.insertNode(doc(str));
    sel.collapse(false);
    after_edit();
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
    if(event.ctrlKey || event.altKey){
        if(/(Arrow)?Right/.test(event.key)){
            event.preventDefault();
            edit_arrow();
        }else if(/(Arrow)?Left/.test(event.key)){
            event.preventDefault();
            edit_varrow();
        }else if(/Q|q/.test(event.key)){
            event.preventDefault();
            expand_sel();
        }else{
            //pass
        }
    }else if(/Enter/.test(event.key)){
        event.preventDefault();
        edit(`\n`);
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
        if(/^\($/.test(event.data)){
            edit_pair(`()`);
        }else if(/^\[$/.test(event.data)){
            edit_pair(`[]`);
        }else if(/^\{$/.test(event.data)){
            edit_pair(`{}`);
        }else{
            edit(event.data);
        }
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
    }else if(/deleteContentForward/.test(event.inputType)){// press del
        after_edit();
    }else if(/deleteByCut/.test(event.inputType)){// after cut
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
}
function paste(event) {
    event.preventDefault();
    edit(event.clipboardData.getData("text/plain"));
}
function focus(event,code){
    current_pair(getsel());
    visible_sel(code);
}
function selectionchange(event,code){
    current_pair(getsel());
    visible_sel(code);
}
function resize(event,code){
    visible_sel(code);
}
function init(code,toolbar){
    code.focus();
    code.addEventListener("keydown",keydown);
    code.addEventListener("beforeinput", beforeinput);
    code.addEventListener("input", input);
    code.addEventListener('compositionstart', compositionstart);
    code.addEventListener('compositionend', compositionend);
    code.addEventListener("copy", copy);
    code.addEventListener("cut", cut);
    code.addEventListener("paste", paste);
    code.addEventListener("focus",event => focus(event,code));
    document.addEventListener("selectionchange",event => selectionchange(event,code)); // selectionchange is base on document specialy
    window.visualViewport.addEventListener("resize",event => resize(event,code)); // resize is base on window.visualViewport
    keywords(code); //prepare keywords highlight
    //==============
    let key_frame=document.styleSheets[0].cssRules[1]; //@key_frame arrow_animi
    for(let i=0;i<=100;i=i+1){
        key_frame.appendRule(`
        ${i}% {
            background-image:linear-gradient(to right,orange ${i-100}%,red,orange ${i}%,red,orange ${i+100}%);
        }`);
    }
    let append_tool = (src, fclick)=>{
        let button = document.createElement("button");
        button.append(doc(src));
        button.addEventListener(
            "click",
            (event) => {
                code.focus();
                fclick();
            }
        );
        toolbar.append(button);
    };
    append_tool(
        "{}",
        () => edit_pair("{}")
    );
    append_tool(
        "[]",
        () => edit_pair("[]")
    );
    append_tool(
        "()",
        () => edit_pair("()")
    );
    append_tool(
        "→",
        () => edit_arrow()
    );
    append_tool(
        "←",
        () => edit_varrow()
    );
    append_tool(
        "Tab",
        () => edit(`\t`)
    );
    append_tool(
        "<{[(..)]}>",
        ()=> expand_sel()
    );
    edit(`\
( : Input ()
[ : Input []
{ : Input {}
Alt/Ctrl + → : Input →
Alt/Ctrl + ← : Input ←
Alt/Ctrl + Q/q : Expand selection to the next outer (), [], or {}
`);
}




