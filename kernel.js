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
                    yield* gen_base(atom,[atom]);
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
    *[Symbol.iterator](){
        for(let i=0;i<this.#map.length-1;i=i+1){
            yield this.#map[i];
        }
        let v=this.#map[this.#map.length-1];
        if(typeof(v) === typeof(new map(null))){
            yield* v[Symbol.iterator]();
        }else{
            yield v;
        }
    }
    toString(){
        let s="";
        for(let v of this.#map){
            if(typeof(v) === typeof("")){
                s=s.concat(v);
            }else{
                s=s.concat(`(${v.toString()})`);
            }
        }
        return s;
    }
    valueOf(){
        return this.toString();
    }
    static #group(list){
        let v=new map(null);
        v.#map=list;
        return v;
    }
    constructor(src){
        let st=[];
        if(typeof(src) === typeof("")){
            for(let atom of map.#gen_atom(src)){
                if(typeof(atom) == typeof([])){
                    atom=atom[0];
                    this.#map.push(null);
                }
                switch(atom){
                    case '(':
                        st.push(this.#map);
                        this.#map=[];
                        break;
                    case ')':
                        let par=st.pop();
                        par.push(map.#group(this.#map));
                        this.#map=par;
                        break;
                    default:
                        this.#map.push(atom);
                }
            }
            return this;
        }else{
            return this;
        }
    }
}