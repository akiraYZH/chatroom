
interface callback {(data:any):void}
export interface socket {
    emit:Function,
    broadcast:{
        emit:Function,
    },
    on: (event:string, callback: callback) => void,
    off:(event:string) => void
}
export type systemMessage = {
    username: string,
    status: string, 
}
export interface emit {
    (event: string, data?: any): void
}