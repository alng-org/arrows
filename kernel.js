class map{
    #map=[];
    static *#gen_atom(src){
        let expr_req=true;
        let gen_base= function*(atom,pre_atom=null){
            if(expr_req == true){
                yield atom;
            }else if(pre_atom !== null){
                yield pre_atom;
                yield atom;
            }else{
                //PASS
            }
        };
        for(let atom of src.match(/\(|→|\)|[^\(→\)]+/g)){
            switch(atom){ //fallthough is right
                case `→`:
                case `)`:
                    yield* gen_base(``);
                    yield atom;
                    break;
                case `(`:
                default:
                    yield* gen_base(atom,[`→`]);
            }
            switch(atom){ //fallthough is right
                case `→`:
                case `(`:
                    expr_req=true;
                    break;
                case `)`:
                default:
                    expr_req=false;
            }
        }
    }
    static #unwrap(val){
        if(type(val) === type(new map(null))){
            if(val.#length() === 1 && type(val.#at(0)) === type(new map(null))){
                return map.#unwrap(val.#at(0));
            }else if(val.#length() === 1 && type(val.#at(0)) === type(``)){
                return val.#at(0);
            }else{
                return val;
            }
        }else{
            return val;
        }
    }
    *[Symbol.iterator](){
        for(let i=0;i<this.#length()-1;i=i+1){
            yield map.#unwrap(this.#at(i));
        }
        let v=this.#at(-1);
        if(type(v) === type(new map(null))){
            yield* v[Symbol.iterator]();
        }else{
            yield v;
        }
    }
    uni_quote(){ //a deep copy of this with remove addtional quote
        let v=new map(null);
        for(let i of this){
            if(type(i) === type(``)){
                v.#push(i);
            }else{
                v.#push(i.uni_quote());
            }
        }
        return v;
    }
    toString(){
        let s="";
        for(let v of this.#map){
            if(type(v) === type(``)){
                s=s.concat(v);
            }else if(type(v) === type(new map(null))){
                s=s.concat(v.toString());
            }else if(type(v) === type([]) && v.length === 2){
                s=s.concat(v[0]).concat(v[1].toString());
            }else{
                //PASS
            }
        }
        return `(${s})`;
    }
    valueOf(){
        return this.toString();
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
    #last(){
        return this.#at(-1);
    }
    static #farrow(arrow){
        if(type(arrow) === type(``)){
            return `→`;
        }else{
            return `[→]`;
        }
    }
    static #fgroup(gen){
        let x=gen.next();
        let v=new map(null);
        while(x.done === false){
            switch(x.value){
                case '(':
                    v.#push(map.#fgroup(gen));
                    gen=v.#last().#pop(); // it's not need to do so...
                    if(type(v.#at(-3)) === type(``)
                    && map.#farrow(v.#at(-2)) === `[→]`){
                        let val=v.#pop();
                        v.#pop();
                        v.#push([v.#pop(),val]);
                    }else{
                        //PASS
                    }
                    break;
                case ')':
                    v.#push(gen);
                    return v;
                default:
                    v.#push(x.value);
            }
            x=gen.next();
        }
        v.#empty();
        v.#push(gen);
        return v;
    }
    constructor(src=null){
        if(type(src) === type(``) && src[0] === `(`){
            let gen=map.#gen_atom(src);
            gen.next();
            let v=map.#fgroup(gen);
            gen=v.#pop();
            if(gen.next().done === true){
                this.#map=v.#map;
            }else{
                this.#map=[];
            }
        }else{
            this.#map=[];
        }
    }
    #apply(dict){
        let v=new map(null);
        for(let x of this){
            if(type(x) === type(``)){
                if(Object.hasOwn(dict,x) === true){
                    v.#push(dict[x]);
                }else{
                    v.#push(x);
                }
            }else{
                v.#push(x.#apply(dict));
            }
        }
        return v;
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