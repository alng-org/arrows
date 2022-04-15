function init(code,keys){
    initmap(code);
    code.addEventListener("click",(event)=>{
        focusingroup(common_min_asone(getsel()),keys);
    });
    code.addEventListener("keydown",keydown(keys));
    code.addEventListener("keyup",keyup(keys));
    code.addEventListener("beforeinput", beforeinput(keys));
    code.addEventListener('compositionstart', compositionstart());
    //code.addEventListener('compositiin')
    code.addEventListener('compositionend', compositionend(keys));
    code.addEventListener("copy", copy(keys));
    code.addEventListener("cut", cut(keys));
    code.addEventListener("paste", paste());
    code.addEventListener("input",input(keys, code));
}
