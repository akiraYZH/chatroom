export type globalState = {
    login: boolean,
    user: {
        id:string,
        username: string,
        avatar:string,
    },
    usersInfo:userObj[],
    roomsInfo:roomsInfo,
    loading: boolean,
}
export type userObj = {id:string, username:string, avatar: string};
export type roomObj = {id?:string, roomName:string };
export type joinRoomArg = {room:roomObj, user:userObj};
export type roomsInfo = {id:string, roomName:string, users: [{id:string, username:string, avatar: string}]}[];

export interface login{
    (data:userObj, callback?:Function): void;
}
export interface createRoom{
    (arg:joinRoomArg): void;
}
export interface startLoading{
    (): void;
}
export interface stopLoading{
    (): void;
}

export interface setUserInfo{
    (data:userObj[]): void;
}
export interface setRoomsInfo{
    (data:roomsInfo): void;
}

export type usersInfo = userObj[];

export interface fetchInterface{
    (api:string, data?: any): Promise<Response>;
}