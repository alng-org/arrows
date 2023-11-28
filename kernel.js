class map{
    #map=[];
    static *#gen_atom(src){
        let text_req=true;
        let gen_base= function*(atom,err=null){
            if(text_req == true){
                yield atom;
            }else if(err !== null){
                yield err;
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
                    yield* gen_base(atom,atom/*[atom]*/);
            }
            switch(atom){ //fallthough is right
                case `→`:
                case `(`:
                    text_req=true;
                    break;
                case `)`:
                default:
                    text_req=false;
            }
        }
    }
    static #unwrap(val){
        if(val instanceof map){
            if(val.#map.length === 1 && val.#map[0] instanceof map){
                return map.#unwrap(val.#map[0]);
            }else if(val.#map.length === 1 && typeof(val.#map[0]) === typeof(``)){
                return val.#map[0];
            }else{
                return val;
            }
        }else{
            return val;
        }
    }
    *[Symbol.iterator](){
        for(let i=0;i<this.#map.length-1;i=i+1){
            yield map.#unwrap(this.#map[i]);
        }
        let v=this.#map[this.#map.length-1];
        if(v instanceof map){
            yield* v[Symbol.iterator]();
        }else{
            yield v;
        }
    }
    uni_quote(){ //a deep copy of this with remove addtional quote
        let v=new map(null);
        for(let i of this){
            if(typeof(i) === typeof(``)){
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
            if(typeof(v) === typeof("")){
                s=s.concat(v);
            }else{
                s=s.concat(v.toString());
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
    #last(){
        return this.#map[this.#map.length-1];
    }
    static #fgroup(gen){
        let x=gen.next();
        let v=new map(null);
        while(x.done === false){
            switch(x.value){
                case '(':
                    v.#push(map.#fgroup(gen));
                    gen=v.#last().#pop(); // it's not need to do so...
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
    constructor(src){
        if(typeof(src) === typeof(``) && src[0] === `(`){
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
            if(typeof(x) === typeof(``)){
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