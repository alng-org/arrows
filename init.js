function init(code){
    initmap(code);
    code.focus();
    setInterval(focus,100);
    code.addEventListener("keydown",keydown());
    code.addEventListener("beforeinput", beforeinput());
    code.addEventListener('compositionstart', compositionstart());
    //code.addEventListener('compositiin')
    code.addEventListener('compositionend', compositionend());
    code.addEventListener("copy", copy());
    code.addEventListener("cut", cut());
    code.addEventListener("paste", paste());
    code.addEventListener("input",input());
}
function focus(){
    if(document.activeElement.nodeName!="INPUT"){
        let sel=getsel().cloneRange();
        sel=reselect(sel);
        focusingroup(common_min_asone(sel));
    }
}