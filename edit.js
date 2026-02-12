class edit extends core_edit{

    /**
     * @param {*} editor the contentediable element
     * @param {*} keywords keyword should be surround by space
     */
    constructor(editor,keywords = ["->","=>","lambda"]){
        super(
            editor,
            [
                ["(","text_core",")"],
                ["[","text_const","]"],
                ["{","text_other","}"]
            ],
            "quote_unpair",
            ["quote_0","quote_1","quote_2"],
            "quote_current_pair",
            (content) => {
                console.log(content);
                if(content === edit.arrow() || content === edit.varrow()){
                    return "arrow";
                }else if(
                    /^\s\S+\s$/.test(content) && 
                    keywords.find(keyword => keyword === content.trim()) !== undefined
                ){
                    return "keyword";
                }else if(/^\s\S*$/.test(content)){
                    return undefined;
                }else{
                    return null;
                }
            }
        );
        
        editor.addEventListener(
            "keydown",
            (event) => this.keydown(event)
        );

        editor.focus();
    }
    
    static arrow(){
        return `→`;
    }
    
    static varrow(){
        return `←`;
    }

    keydown(event){
        if(event.ctrlKey || event.altKey){
            if(/(Arrow)?Right/.test(event.key)){
                event.preventDefault();
                this.insert_with_paired(edit.arrow());
            }else if(/(Arrow)?Left/.test(event.key)){
                event.preventDefault();
                this.insert_with_paired(edit.varrow());
            }else{
                //pass
            }
        }else{
            //pass
        }
    }

}

function init(code,toolbar){
    let editor = new edit(code);
    //=========
    let append_tool = (src, fclick)=>{
        let button = document.createElement("button");
        button.append(core_edit.doc(src));
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
        () => editor.insert_with_paired("{")
    );
    append_tool(
        "[]",
        () => editor.insert_with_paired("[")
    );
    append_tool(
        "()",
        () => editor.insert_with_paired("(")
    );
    append_tool(
        edit.arrow(),
        () => editor.insert_with_paired(edit.arrow())
    );
    append_tool(
        edit.varrow(),
        () => editor.insert_with_paired(edit.varrow())
    );
    append_tool(
        "Tab",
        () => editor.insert_with_paired(`\t`)
    );
    append_tool(
        "<{[(..)]}>",
        ()=> editor.expand_sel()
    );
    editor.insert_with_paired(
`\
( : Input ()
[ : Input []
{ : Input {}
Alt/Ctrl + → : Input →
Alt/Ctrl + ← : Input ←
Alt/Ctrl + Q/q : Expand selection to the next outer (), [], or {}
`
);

}