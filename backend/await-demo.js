function wait(ms){
    return new Promise((resolve)=>{
        setTimeout(()=> resolve('done'), ms)
    })
}

async function main(){
    const withoutAwait = wait(100)
    console.log('withoutAwait:',withoutAwait)

const withAwait = await wait(100);
console.log('withAwait:',withAwait);


}

main()