function keys(){
    return [`→`,`←`,
            `↥`,`↵`,
            `↱`,`↲`];
}
function keymap(event = null) {
    let conds= [[/^(Arrow)?Right/,event.altKey], [/^(Arrow)?Left/,event.altKey], 
                [/^(Arrow)?Up/,event.altKey], [/Enter/,event.altKey&&event.shiftKey],
                [/'/,event.altKey], [/Enter/,event.altKey]];
    for(let i=0;i<conds.length;i=i+1){
        if(conds[i][0].test(event.key)&&conds[i][1]){
            return keys()[i];
        }
    }
    return ``;
}