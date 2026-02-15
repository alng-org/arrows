class core_edit{
    #node;
    #brakets_set; //all L,R
    #brakets_map; // L -> R
    #brakets_class; // R -> C
    #braket_unpaired_class;
    #braket_paired_class;
    #braket_current_paired_class;
    #classes; // all determined class
    #highlights_map; //supplier
    #content_class;
    #current_pair = null;
    /**
     * @param node the editeable element
     * @param brakets a list like [[L,C,R],...] which L, R is paired brakets, in single grapheme, uniqued, at least one paired,
     *                becare for, "\u0301" is a single grapheme, while "e\u0301" also is. so if you defined "\u0301" as braket,
     *                you couldn't expect "\u0301" in "e\u0301" while be regonized
     *                C is a class for the text in brakets in default, e.g. "main_quoted"
     * @param braket_unpaired_class a class, e.g. "unpaired"
     * @param braket_paired_class a list of class, e.g. ["paired_0",...]
     * @param braket_current_paired_class a class, e.g. "current"
     * @param content_class (content) => class , reveived a continuous content,return the custom class for content, e.g. "custom_key", or special val in examples
     * @examples class should be uniqued, which defined by CSS  ::highlight(class){...}
     * @examples grapheme, language indepent, defined by Unicode, aka segmenter with locales = "und"
     * @examples content_class returns null if determined to use default highlight
     * @examples content_class returns undefined if no determined
     * @link https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API
     * @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
     */
    constructor(
        node,
        brakets,
        braket_unpaired_class,
        braket_paired_class,
        braket_current_paired_class,
        content_class
    ){
        if(this.#assert_brakets(brakets)){
            this.#node = node;
            this.#braket_unpaired_class = braket_unpaired_class;
            this.#braket_paired_class = braket_paired_class;
            this.#braket_current_paired_class = braket_current_paired_class;

            this.#classes = [
                this.#braket_unpaired_class,
                ...this.#braket_paired_class,
                this.#braket_current_paired_class,
                ...this.#brakets_class.values()
            ];
            let classes_pair = this.#classes.map( (t) => [t,[]] );
            this.#highlights_map = () => new Map(classes_pair);
            
            this.#content_class = content_class;
            this.#init();
        }else{
            throw new Error("illegal brakets");
        }
    }

    static #clear_highlights_in(classes){
        for(let clazz of classes){
            CSS.highlights.delete(clazz);
        }
    }

    static #highlights(class_name,range_list){
        let highlight = new Highlight(...range_list);
        CSS.highlights.set(class_name,highlight);
    }
    
    static #in_paired(left,right){
        let sel = core_edit.get_sel();
        return (
            left.compareBoundaryPoints(Range.START_TO_END,sel) <= 0 &&
            right.compareBoundaryPoints(Range.END_TO_START,sel) >= 0
        );
    }

    static *#graphemes(str,grapheme_int_set){
        for(let grapheme of new Intl.Segmenter('und').segment(str) ){
            if(int_set.has(grapheme.segment)){
                yield grapheme;
            }else{
                //pass
            }
        }
    }

    static #empty_set = new Set();
    static *#walker(node,grapheme_int_set = core_edit.#empty_set){
        node.normalize();

        let abstract_walker = function* (node) {
            let filter = (node) => {
                if(
                    (node.nodeType === Node.TEXT_NODE) ||
                    (node.nodeName == `BR` && node.className == ``)
                ){
                    return NodeFilter.FILTER_ACCEPT;
                }else{
                    return NodeFilter.FILTER_REJECT;
                }
            };
            let val = (node) => {
                return {
                    content: (node.nodeType === Node.TEXT_NODE) ? node.textContent : "\n",
                    select: (text,index) =>{
                        let range = new Range();
                        if(node.nodeType === Node.TEXT_NODE){
                            range.setStart(node,index);
                            range.setEnd(node,index + text.length);
                            return range;
                        }else{
                            range.selectNode(node);
                            return range;
                        }
                    }
                };
            };

            if(filter(node) === NodeFilter.FILTER_ACCEPT){
                yield val(node);
            }else{
                let walker = document.createTreeWalker(
                    node,
                    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
                    filter
                );
                while(walker.nextNode()){
                    yield val(walker.currentNode);
                }
            }
        };

        if(grapheme_int_set.size !== 0){
            for(let {content,select} of abstract_walker(node)){
                for(let grapheme of core_edit.#graphemes(content,grapheme_int_set)){
                    yield {
                        content: grapheme.segment,
                        range: select(grapheme.segment,grapheme.index)
                    };
                }
            }
        }else{
            for(let {content,select} of abstract_walker(node)){
                yield {
                    content: content,
                    range: select(content,0)
                };
            }
        }
    }

    #core_shader(){
        let highlights = this.#highlights_map();
        core_edit.#clear_highlights_in(this.#classes);
        let expect = [];
        let ranges = [];
        let index = -1;
        for(let {content,range} of core_edit.#walker(this.#node,this.#brakets_set)){
            index = expect.lastIndexOf(content);
            if(index === -1){ //no found
                expect.push(
                    this.#brakets_map.get(content) ?? ""
                );
                ranges.push( range );
            }else{
                //??
            }
        }
        
    }





    

    #assert_brakets(brakets){
        if(
            (brakets instanceof Array) && (brakets.length >= 1) &&
            brakets.every( 
                (paired) => (paired instanceof Array) && (paired.length === 3) &&
                                       paired.every((t) => typeof(t) === "string")
            )
        ){
            let brakets_pair = brakets.map( ([L,_,R]) => [L,R] );
            let flat_brakets = brakets.flat();

            
            this.#brakets_set = new Set(flat_brakets);
            this.#brakets_map = new Map(brakets_pair);
            this.#brakets_class = new Map(
                brakets.map( ([_,C,R]) => [R,C] )
            );
            
            return flat_brakets.every( 
                 (t) => [...core_edit.#graphemes(t)].length === 1
            ) && this.#brakets_set.size === flat_brakets.length;
        }else{
            return false;
        }
    }

    #is_braket(ch){
        return this.#brakets_set.has(ch);
    }

    #class_for(braket){
        return this.#brakets_class.get(braket);
    }

    #expect_for(braket){
        return this.#brakets_map.get(braket);
    }

    #indent(){
        let sel = core_edit.get_sel().cloneRange();
        let con = sel.startContainer?.childNodes?.[sel.startOffset] ?? sel.startContainer;
        while(con !== null && core_edit.src(con) !== "\n"){
            con = con.previousSibling;
        }
        if(con === null){
            sel.setStart(this.#node,0);
        }else{
            sel.setStartAfter(con);
        }
        return core_edit.src(
            sel.cloneContents()
        ).replace(
            /\S[\s\S]*$/gv,
            ""
        );
    }

    #insert(str,highlight_now = true,collapse_to_start = false){
        let sel = core_edit.get_sel();
        let indent = this.#indent();
        sel.deleteContents();
        sel.insertNode(core_edit.doc(str,indent));
        sel.collapse(collapse_to_start);

        if(highlight_now === true){
            this.#render();
        }else{
            //PASS
        }

    }

    #render(){

        this.visible_sel();
    }

    #keydown(event) {
        if(
            (event.ctrlKey || event.altKey) &&
            /Q|q/.test(event.key)
        ){
            event.preventDefault();
            this.expand_sel();
        }else if(/Enter/.test(event.key)){
            event.preventDefault();
            this.insert_with_paired(`\n`);
        }else if(/Tab/.test(event.key)){
            event.preventDefault();
            this.insert_with_paired(`\t`);
        }else{
            /*PASS*/
        }
    }

    #beforeinput(event) {
        if(/insertText/.test(event.inputType)){
            event.preventDefault();
            this.insert_with_paired(event.data);
        }else{
            //PASS
        }
    }

    #input(event) {
        if(/deleteContentBackward/.test(event.inputType)){//press backspace
            this.#render();
        }else if(/deleteContentForward/.test(event.inputType)){// press del
            this.#render();
        }else if(/deleteByCut/.test(event.inputType)){// after cut
            this.#render();
        }else{
            //PASS
        }
    }

    #compositionstart(event) {
        let sel= core_edit.get_sel();
        sel.deleteContents();
        let node = document.createElement("span");
        node.innerText = "\u200c";
        sel.insertNode(node);
        sel.selectNodeContents(node);

        this.#node.addEventListener(
            "compositionend",
            (event) => {
                let rng = core_edit.get_sel();
                rng.selectNode(node);
                this.insert_with_paired(core_edit.src(node));
            },
            {once: true}
        )

    }

    #paste(event) {
        event.preventDefault();
        this.insert_with_paired(
            event.clipboardData.getData("text/plain")
        );
    }

    #focus(event){
        this.#render();
    }

    #selectionchange(event){
        this.#render();
    }

    #resize(event){
        this.#render();
    }

    #init(){
        this.#node.addEventListener("keydown",(event) => this.#keydown(event));
        this.#node.addEventListener("beforeinput",(event) => this.#beforeinput(event));
        this.#node.addEventListener("input",(event) => this.#input(event));
        this.#node.addEventListener('compositionstart',(event) => this.#compositionstart(event));
        this.#node.addEventListener("paste",(event) => this.#paste(event));
        this.#node.addEventListener("focus",(event) => this.#focus(event));
        document.addEventListener("selectionchange",(event) => this.#selectionchange(event)); // selectionchange is base on document specialy
        window.visualViewport.addEventListener("resize",(event) => this.#resize(event)); // resize is base on window.visualViewport
    }

    static doc(str,indent = ""){
        let Doc=document.createDocumentFragment();
        for(let line of str.match(/\n|[^\n]+/gv) ?? []){
            if(line === "\n"){
                Doc.append(
                    document.createElement("br"),
                    indent
                );
            }else{
                Doc.append(
                    line
                );
            }
        }
        return Doc;
    }

    static src(node){
        return [...core_edit.#walker(node)].map(({content}) => content).join("");
    }

    static get_sel(){
        let sel=window.getSelection().getRangeAt(0);
        return sel;
    }

    /**
     * @param other_rect return a DOMRect located the sel (null means can't locate the sel)
     */
    static rect_sel(sel,other_rect = (sel)=> null){
        if(sel.commonAncestorContainer.nodeName === "#text"){
            return sel.getBoundingClientRect();
        }else{
            let before_sel = sel.startContainer?.childNodes?.[sel.startOffset - 1];
            let after_sel = sel.endContainer?.childNodes?.[sel.endOffset];
            if(
                after_sel?.nodeName === "BR"
            ){
                return after_sel.getBoundingClientRect();
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
                return other_rect(sel);
            }
        }
    }

    visible_sel(){
        // keep the caret visibility
        let sel = core_edit.get_sel();
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
            let node_rect = new DOMRect(
                0,                // x (special)
                0,                // y (special)
                this.#node.clientWidth, // width
                this.#node.clientHeight // height
            );
            let sel_rect = core_edit.rect_sel(sel);
            let half_sel_h = sel_rect.height / 2;
            let padding = Number.parseFloat( window.getComputedStyle(this.#node).padding );
            let xscroll = fscroll(
                node_rect.left + padding,
                node_rect.right - padding,
            );
            let yscroll = fscroll(
                node_rect.top + padding + half_sel_h,
                node_rect.bottom - padding - half_sel_h,
            );

            this.#node.scrollBy(
                {
                    left: xscroll(sel_rect.x),
                    top: yscroll(sel_rect.y + half_sel_h),
                    behavior:"smooth"
                }
            );
        }else{
            //PASS
        }   
    }

    expand_sel(){
        let sel = core_edit.get_sel();
        if(this.#current_pair === null){
            //PASS
        }else{
            let [left,right] = this.#current_pair;

            sel.setStart(left.startContainer,left.startOffset);
            sel.setEnd(right.endContainer,right.endOffset);

            this.#render();
        }
    }

    insert_with_paired(str){
        let paired = this.#brakets.find(
            ([l,_,r]) => l === str || r === str
        );

        if(paired === undefined){
            this.#insert(str);
        }else{
            let [left,_,right] = paired;
            let sel = core_edit.get_sel();
            let content= core_edit.src( sel.cloneContents() );
            this.#insert(left,false);
            this.#insert(content,false);
            this.#insert(right,true,true);
        }
    }
}



