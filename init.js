function init(code,keys){
    initmap(code);
    setInterval(focus,100);
    code.addEventListener("keydown",keydown(keys));
    code.addEventListener("beforeinput", beforeinput(keys));
    code.addEventListener('compositionstart', compositionstart());
    //code.addEventListener('compositiin')
    code.addEventListener('compositionend', compositionend(keys));
    code.addEventListener("copy", copy(keys));
    code.addEventListener("cut", cut(keys));
    code.addEventListener("paste", paste());
    code.addEventListener("input",input(keys, code));
}
function focus(){
    let sel=getsel().cloneRange();
    sel=reselect(sel);
    focusingroup(common_min_asone(sel));
}