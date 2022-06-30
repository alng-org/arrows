function edit(str){
    range=getsel();
    range=reselect(range);
    range.deleteContents();
    if(mingroup(range.commonAncestorContainer)!=null){
        range.insertNode(format(str));
    }
    //let rng=range.cloneRange();
    range.collapse(false);
    return range;
}
function forinput(id,multiline=false){
    let name=(multiline)?("div"):("span");
    let rng=getsel();
        rng.deleteContents();
        rng.insertNode(tonode(`<${name} id="${id}">&zwnj;</${name}>`));
        rng.setStart(document.getElementById(id),0);
        rng.setEnd(document.getElementById(id),1);
}