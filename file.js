//This API was based On File System API and FileReader
function fget(){
    // fget the text content in file
    return window.showOpenFilePicker().then(
        (handles)=>
            handles[0].getFile().then(
                (file)=>
                    new Promise(
                        (resolve,reject)=>{
                            const read=new FileReader();
                            read.onload=(content)=>resolve(content.target.result); // process the text content in file
                            read.onerror=(error)=>reject(error); // handle the error
                            read.readAsText(file);
                        }
                    )
            )
    );
}
function fput(content){
    // fput text content into the file
    return window.showSaveFilePicker().then(
        (handle)=>handle.createWritable()
    ).then(
        (fout)=>fout.write(content).then(
            (_)=>fout.close()
        )
    );
}