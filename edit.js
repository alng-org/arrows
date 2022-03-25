function format(str,keys){
    let fhtml=function(str){
        const div=document.createElement("div");
        div.innerText=str;
        return div.getInnerHTML();
    }
    str=`\x01${str}\0`;
    for (let key of keys){
        str=str.replaceAll(key,`\0\x02${key}\0\x01`);
    }
    str=fhtml(str).replaceAll("\x01",`<span class="text" style="color:black;">`)
                  .replaceAll("\x02",`<span class="text" style="color:red;">`)
                  .replaceAll("\0",`</span>`);
    let range = document.createRange();
    return range.createContextualFragment(str);
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
        if(/insertText/.test(event.inputType)){
            event.preventDefault();
            rng=window.getSelection().getRangeAt(0);
            edit(event.data,keys);
        }
    });
    code.addEventListener('compositionstart', (event) => {
        init.crng=window.getSelection().getRangeAt(0);
    });
    code.addEventListener('compositionend', (event) => {
        rng=window.getSelection().getRangeAt(0);
        console.log("NOW! ",rng);
        rng.setStart(init.crng.startContainer,init.crng.startOffset);
        console.log(init.crng,rng);
        event.preventDefault();
        edit(rng.toString(),keys);
    });
    code.addEventListener("paste", async (event) => {
        event.preventDefault();
        //let str=(event.clipboardData||window.clipboardData).getData("text");
        let str = await navigator.clipboard.readText();
        edit(str,keys);
    });
}