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
                    yield* gen_base(map.#farrow([``]));
                    yield map.#farrow(atom);
                    break;
                case `(`:
                default:
                    let fv=(x)=>(x === `(`) ? x : [x];
                    yield* gen_base(fv(map.#farrow(atom)),map.#farrow(`[→]`));
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
    static #type(val,real=true){
        //This need to test
        if(type(val) === type(Symbol.for(``))){
            return `→`;
        }else if(type(val) === type([])){
            return `v`;
        }else if(type(val) !== type(new map())){
            return null;
        }else if(val.#length() === 1){
            return (real === true) ? map.#type(val.#at(0)) : `?`;
        }else{
            return `e`;
        }
    }
    static #unwrap(val,unwarp_empty_v=false){
        if(map.#type(val,false) === `?`){
            let inner=val.#at(0);
            switch(map.#type(inner,false)){
                case `?`:
                    return map.#unwrap(inner,unwarp_empty_v);
                case `v`:
                    if(unwarp_empty_v === true){
                        return inner;
                    }else if(inner[0] !== ``){
                        return inner;
                    }else{
                        //fall though
                    }
                default:
                    return val;
            }
        }else{
            return val;
        }
    }
    static #bindable(v){
        let x=map.#unwrap(v,true);
        if(map.#type(v) === `v` && x.length === 1){
            return  x[0];
        }else{
            return null;
        }
    }
    static #bind(v,val){
        if(map.#bindable(v) !== null){
            return  [v,val];
        }else{
            return v;
        }
    }
    #apply(dict){
        let each=(v)=>{
            let key=map.#bindable(v);
            if(key !== null && Object.hasOwn(dict,key) === true){
                return map.#bind(v,dict[key]);
            }else if([`→`,`v`].includes(map.#type(v)) === true){
                return v;
            }else{
                return v.#apply(dict);
            }
        }
        let v=new map();
        v.#map=this.#map.map(each);
        return v;
    }
    static #farrow(arrow){
        switch(arrow){
            case `→`:
                return Symbol.for(`→`);
            case `[→]`:
                return Symbol.for(`[→]`);
            case Symbol.for(`→`):
                return `→`;
            case Symbol.for(`[→]`):
                return `[→]`;
            default:
                return arrow;
        }
    }
    static #fgroup(gen){
        let x=gen.next();
        let v=new map();
        while(x.done === false){
            switch(x.value){
                case '(':
                    v.#push(map.#fgroup(gen));
                    gen=v.#last().#pop(); // it's not need to do so...
                    if(map.#bindable(v.#at(-3)) !== null 
                    && map.#farrow(v.#at(-2)) === `[→]`){
                        let val=v.#pop();
                        v.#pop();
                       v.#push(map.#bind(v.#pop(),val));
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
    //test code
    static unwarp(v,uev = false){
        return map.#unwrap(v,uev);
    }
    static type(v){
        return map.#type(v);
    }
    apply(dict){
        return this.#apply(dict);
    }
    //test
    *[Symbol.iterator](){
        for(let i=0;i<this.#length()-1;i=i+1){
            yield map.#unwrap(this.#at(i));
        }
        let v=this.#at(-1);
        if(type(v) === type(new map())){
            yield* v[Symbol.iterator]();
        }else{
            yield v;
        }
    }
    uni_quote(){ //a deep copy of this with remove addtional quote
        let v=new map();
        for(let i of this){
            if(type(i) === type(``)){
                v.#push(i);
            }else if(type(i) === type(new map())){
                v.#push(i.uni_quote());
            }else if(type(i) === type([]) && i.length === 2){
                v.#push([map.#unwrap(i[0]),
                         i[1].uni_quote()]);
            }
        }
        return v;
    }
    toString(){
        let feach=(val)=>{
            switch(map.#type(val,false)){
                case `→`:
                    return ((x)=>(x === `→`) ? x : ``)(map.#farrow(val));
                case `v`:
                    return val.map((v)=>v.toString()).join(``);
                default:
                    return val.toString();
            }
        }
        let s="";
        s=this.#map.map(feach).join(``);
        return `(${s})`;
    }
    valueOf(){
        return this.toString();
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