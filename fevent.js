function keydown() {
    return (event) => {
        if (keys().input(event)){
            event.preventDefault();
        }else{
            if (event.key == "Enter") {
                event.preventDefault();
                newline();
            }else if(event.altKey){
                if(event.key=="s"||event=="S"){
                    reselect(getsel(),true);
                }
            }
        }
    };
}
function beforeinput() {
    return (event) => {
        if (/insertText/.test(event.inputType)) {
            event.preventDefault();
            edit(event.data);
        } else if (/insertCompositionText/.test(event.inputType)) {
            //PASS
        } else if (/delete/.test(event.inputType)) {
            rng = reselect(getsel());
            if(rng.collapsed){
                if(/deleteContentBackward/.test(event.inputType)){//press backspace
                    if(mingroup(rng.startContainer)!=null){
                        let prev=rng.startContainer.childNodes[rng.startOffset-1];
                        let len=rng.startContainer.childNodes.length;
                        if(isgroup(prev)){
                            //event.preventDefault();
                            rng.selectNode(prev);
                        }else if(isgroup(rng.startContainer)&&rng.startOffset==1){
                            if(rng.startContainer.id!="init"&&len==2){
                                rng.selectNode(rng.startContainer);
                            }else{
                                event.preventDefault();
                            }
                        }
                    }else{
                        event.preventDefault();
                    }
                }else if(/deleteContentForward/.test(event.inputType)){// press del
                    event.preventDefault();
                }
            }else if(mingroup(rng.commonAncestorContainer)==null){
                event.preventDefault();
            }
        }
    };
}
function compositionstart() {
    return (event) => {
        reselect(getsel());
        forinput("cop");
    };
}
function compositionend() {
    return (event) => {
        let rng = getsel();
        rng.selectNode(document.getElementById("cop"));
        edit(rng.toString());
    };
}
function copy() {
    return (event) => {
        reselect(getsel());
    };
}
function cut() {
    return (event) => {
        let rng=reselect(getsel());
        if(mingroup(rng.commonAncestorContainer)==null){
            event.preventDefault();
        }
    };
}
function paste() {
    return (event) => {
        let rng=reselect(getsel());
        if(mingroup(rng.commonAncestorContainer)==null){
            event.preventDefault();
        }else{
            forinput("pst", true);
        }
    };
}
function input() {
    return (event) => {
        if (/insertFromPaste/.test(event.inputType)) {
            let rng = getsel();
            let pst = document.getElementById("pst");
            rng.selectNode(pst);
            edit(getsrc(pst));
        }
    };
}