export let server = null;

export function setIstanceServer(serverIstance:any){
    if(!server){
        server = serverIstance;
    }
}