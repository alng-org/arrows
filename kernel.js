class map{
    #map=[];
    #err_info=``;
    static #farrow(arrow){
        let lst=[`→`,`←`,`(`,`)`,`[`,`]`,`{`,`}`];
        for(let x of lst){
            switch(arrow){
                case x:
                    return Symbol.for(x);
                case Symbol.for(x):
                    return x;
                default:
                    //pass
            }
        }
        return arrow;
    }
    #shift(){
        return this.#map.shift();
    }
    #unshift(val){
        this.#map.unshift(val);
        return this;
    }
    #pop(){
        return this.#map.pop();
    }
    #push(val){
        this.#map.push(val);
        return this;
    }
    #empty(){
        this.#map=[];
        return this;
    }
    #length(){
        return this.#map.length;
    }
    #at(index){
        let len=this.#length();
        if(0 <= index && index < len){
            return this.#map[index];
        }else if(-len <= index && index <0){
            return this.#map[len+index];
        }else{
            return null;
        }
    }
    #fst(){
        return this.#at(0);
    }
    #lst(){
        return this.#at(-1);
    }
    static #type(val,real=true){
        //redesign
    }
    *[Symbol.iterator](){
        //review
        for(let i=0;i<this.#length()-1;i=i+1){
            yield this.#at(i);
        }
        let v=this.#at(-1);
        if(type(v) === type(new map())){
            yield* v[Symbol.iterator]();
        }else{
            yield v;
        }
    }
    toString(){
        return this.#map.map((x)=>map.#farrow(x).toString()).join('');
    }
    error_info(){
        return this.#err_info;
    }
    valueOf(){
        //check what it means
        return this.toString();
    }
    constructor(src=null){
        if(type(src) !== type(``)){
            this.#map=[];
            this.#err_info=``;
        }else{
            let atom_list=src.match(/\{|\[|\(|→|←|\)|\]|\}|[^\{\[\(→←\)\]\}]+/g);
            let a_map=
            atom_list.reduce((m,atom)=>{
                let atom_element=map.#farrow(atom);
                let omit_arrow=map.#farrow(`←`);
                let omit_atom=map.#farrow(``);
                switch(atom){
                    case `{`:
                    case `[`:
                    case `(`:
                        if(type(m.#lst()) === type(new map()) ||
                           type(m.#lst()) === type(``)){
                            m.#push(omit_arrow);
                        }else{
                            //pass
                        }
                        m.#push(
                            (new map()).#push(m).#push(atom_element)
                        );
                        return m.#lst();
                    case `}`:
                    case `]`:
                    case `)`:
                        if( m.#at(1) === map.#farrow(paired(atom)) ){
                            if(type(m.#lst()) === type(Symbol.for(``))){
                                m.#push(omit_atom);
                            }else{
                                //pass
                            }
                            m.#push(atom_element);
                            return m.#shift();
                        }else{
                            m.#push(
                                (new map()).#push(m).#push(atom_element)
                            );
                            return m.#lst();
                        }
                    case `→`:
                    case `←`:
                        if(type(m.#lst()) === type(Symbol.for(``))){
                            m.#push(omit_atom);
                        }else{
                            //pass
                        }
                        return m.#push(atom_element);
                    default:
                        if(type(m.#lst()) === type(new map())){
                            m.#push(omit_arrow);
                        }else{
                            //pass
                        }
                        return m.#push(atom_element);
                }
            }, (new map()) );
            if( paired(map.#farrow(a_map.#at(1))) === null ){
                this.#map=a_map.#map;
                this.#err_info=``;
            }else{
                this.#map=[];
                this.#err_info=`Bracket like () , [] , {} missed paired.`;
            }
        }
    }
    
}
function paired(str){
    //return char that paired to str
    //return null if it has no paired char
    let pair=[`()`,`[]`,`{}`];
    let tmp=``;
    if(type(str) === type(``) && str.length == 1){
        for(let x of pair){
            tmp=x.replace(str,``);
            if(tmp.length === 1){
                return tmp;
            }else{
                //pass
            }
        }
        return null;
    }else{
        return null;
    }
}
function type(val){
    //reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
    let btype=typeof(val);
    let ctype=val?.constructor?.name;
    if(val === null){
        return `null`;
    }else if(btype !== `object`){
        return btype;
    }else if(typeof(ctype) === typeof(``) && ctype !== ``){
        return ctype;
    }else{
        return `?`;
    }
}