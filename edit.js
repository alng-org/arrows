function fhtml(str){
    const div=document.createElement("div");
    div.innerText=str;
    return div.innerHTML;
}
function tonode(html){
    let range = document.createRange();
    return range.createContextualFragment(html);
}
function format(str,keys){
    for (let key of keys){
        str=str.replaceAll(key,`\x01${key}\0`);
    }
    str=fhtml(str).replaceAll(" ","&ensp;")
                  .replaceAll("\x01",`<span class="text" style="color:red;">`)
                  .replaceAll("\0",`</span>`);
    let lines=str.split("<br>");
    lines=[lines[0]].concat(lines.slice(1).map((x)=>`<div>${x}</div>`));
    str=lines.join(``);
    return tonode(str);
}
function edit(str,keys){
    range=window.getSelection().getRangeAt(0);
    reselect(range);
    range.deleteContents();
    range.insertNode(format(str,keys));
    range.collapse(false);
}
function reselect(rng,extend=false){
    let getnode=(container)=>{
        let node=undefined;
        while(/DIV|SPAN/.test(container.nodeName)==false){
            node=container;
            container=container.parentElement;
        }
        return {container:container,node:node};
    };
    if(rng.collapsed==false||extend==true){
        let start=getnode(rng.startContainer).container;
        let end=getnode(rng.endContainer).container;
        if(start.nodeName=="SPAN"){
            rng.setStartBefore(start);
        }
        if(end.nodeName=="SPAN"){
            rng.setEndAfter(end);
        }
    }else{
        let start=getnode(rng.startContainer).container;
        let end=getnode(rng.endContainer).container;
        if(start.nodeName=="SPAN"&&rng.startOffset==0){
            rng.setStartBefore(start);
            rng.setEndBefore(end);
        }else if(start.nodeName=="SPAN"){
            rng.setStartAfter(start);
            rng.setEndAfter(end);
        }
    }
}
function init(code,keys){
    /*code.addEventListener("keydown", (event) => {
        if(event.key=="Enter"){
            event.preventDefault();
            edit("\n\n",keys);
        }else{
            //PASS
        }
    });*/
    code.addEventListener("keydown",(event)=>{
        let key=keymap(event);
        if(key!=``){
            event.preventDefault();
            edit(key,keys);
        }
    })
    code.addEventListener("beforeinput", (event) => {
        if(/insertText/.test(event.inputType)){
            event.preventDefault();
            edit(event.data,keys);
        }else if(/insertCompositionText/.test(event.inputType)){
            //PASS
        }else if(/delete/.test(event.inputType)){
            reselect(window.getSelection().getRangeAt(0),true);
        }
    });
    code.addEventListener('compositionstart', (event) => {
        reselect(window.getSelection().getRangeAt(0));
        let rng=window.getSelection().getRangeAt(0);
        rng.deleteContents();
        rng.insertNode(tonode(`<span id="cop" style="color:green;">&zwnj;</span>`));
        rng.setStart(document.getElementById("cop"),0);
        rng.setEnd(document.getElementById("cop"),1);
        //rng.selectNode(document.getElementById("txt"));
    });
    //code.addEventListener('compositiin')
    code.addEventListener('compositionend', (event) => {
        let rng=window.getSelection().getRangeAt(0);
        rng.selectNode(document.getElementById("cop"));
        edit(rng.toString(),keys);
    });
    code.addEventListener("copy", (event) => {
        reselect(window.getSelection().getRangeAt(0));
    });
    code.addEventListener("cut", (event) => {
        reselect(window.getSelection().getRangeAt(0));
    });
    code.addEventListener("paste", async (event) => {
        event.preventDefault();
        //let str=(event.clipboardData||window.clipboardData).getData("text");
        let str = await navigator.clipboard.readText();
        edit(str,keys);
    });
}