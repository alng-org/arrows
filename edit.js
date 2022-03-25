function fhtml(str){
    const div=document.createElement("div");
    div.innerText=str;
    return div.getInnerHTML();
}
function tonode(html){
    let range = document.createRange();
    return range.createContextualFragment(html);
}
function format(str,keys){
    str=`\x01${str}\0`;
    for (let key of keys){
        str=str.replaceAll(key,`\0\x02${key}\0\x01`);
    }
    str=fhtml(str).replaceAll("\x01",`<span class="text" style="color:black;">`)
                  .replaceAll("\x02",`<span class="text" style="color:red;">`)
                  .replaceAll("\0",`</span>`);
    return tonode(str);
}
function edit(str,keys){
    range=window.getSelection().getRangeAt(0);
    range.deleteContents();
    range.insertNode(format(str,keys));
    range.collapse(false);
}
function finput(it,event){

}
function init(code,keys){
    code.addEventListener("keydown", (event) => {
        if(event.key=="Enter"){
            event.preventDefault();
            edit("\n\n",keys);
        }else{
            //PASS
        }
    });
    code.addEventListener("beforeinput", (event) => {
        log(event.inputType);
        if(/insertText/.test(event.inputType)){
            event.preventDefault();
            rng=window.getSelection().getRangeAt(0);
            edit(event.data,keys);
        }else if(/insertCompositionText/.test(event.inputType)){
            event.preventDefault();
        }
    });
    code.addEventListener('compositionstart', (event) => {
        log(event.type);
        rng=window.getSelection().getRangeAt(0);
        rng.deleteContents();
        rng.insertNode(tonode(`<span id="cop" style="color:green">|</span>`));
        rng.setStart(document.getElementById("cop"),0);
        rng.setEnd(document.getElementById("cop"),1);
    });
    code.addEventListener('compositionend', (event) => {
        rng=window.getSelection().getRangeAt(0);
        rng.selectNode(document.getElementById("cop"));
        edit(rng.toString(),keys);
    });
    code.addEventListener("paste", async (event) => {
        event.preventDefault();
        //let str=(event.clipboardData||window.clipboardData).getData("text");
        let str = await navigator.clipboard.readText();
        edit(str,keys);
    });
}