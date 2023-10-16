class map{
    constructor(left,right,has_quote){
        this.left=left;
        this.right=right;
        this.has_quote=has_quote;
    }
    tree(src){
        
    }
}
function struct(src){
    //(a#b) => [a,#, b]
    //(a#b#c..) => [a,#,b,#,c,#,...]
    //Suppose str is paired
    //Need to be redesign
    let data = []; // now building
    let pre_atom=``; //the previous atom
    let push_if=(data,pre_atom)=>{ //push the empty atom
        switch(pre_atom){
            case `(`:
            case `→`:
                data.push(``);
                break;
            default:
                break;
        }
        return data;
    }
    let st=[]; // building pause for wait the sub-expr building
    for(let atom of src.match(/\(|→|\)|[^\(→\)]+/g)){
        switch(atom){
            case `(`:
                st.push(data);
                data=[];
                break;
            case `→`:
                push_if(data,pre_atom);
                data.push(atom);
                break;
            case `)`:
                push_if(data,pre_atom);
                let tp=data;
                data=st.pop();
                data.push(tp);
                break;
            default:
                data.push(atom);
        }
        pre_atom=atom;
    }
    return data;
}
function* gen_atom(src){
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
 function f(src){
    for(let atom of gen_atom(src)){
        console.log(atom);
    }
 }
 function tomap(src){
    let map=[];
    let st=[];
    /*let expand=(xs)=>{
        let t=xs[xs.length-1];
        if(typeof(t) === typeof([])){
            return xs.concat(xs.pop());
        }else{
            return xs;
        }
    }*/
    let last=(xs)=>xs[xs.length-1];
    let format=(xs)=>{
        xs=xs.reduce((left,right)=>{
            if(last(left) === null){
                left.pop();
                if(typeof(last(left)) !== typeof([]) || last(left)[0] !== null){
                    last(left) =[null,last(left)]; //error == ReferenceError: Invalid left-hand side in assignment
                }else{
                    //PASS
                }
                last(left)=last(left).concat(right);
            }else{
                left=left.concat(right);
            }
            return left;
        },[]);
        if(typeof(last(xs)) === typeof([]) && last(xs)[0] !== null){
            xs=xs.concat(xs.pop());
        }else{
            //PASS
        }
        return xs;
    };
    for(let atom of gen_atom(src)){
        if(typeof(atom) == typeof([])){
            atom=atom[0];
            map.push(null);
        }
        switch(atom){
            case '(':
                st.push(map);
                map=[];
                break;
            case ')':
                let par=st.pop();
                par.push(format(map));
                //par.push(map);
                map=par;
                break;
            default:
                map.push(atom);
        }
    }
    return format(map);
    //return map;
 }