import axios from 'axios';
import {
    GET_CHATS,
    GET_GROUP_CHATS,
    AFTER_POST_MESSAGE
} from './types';
import { CHAT_SERVER } from './Config.js';

export function getChats(){
    const request = axios.get(`${CHAT_SERVER}/getChats`)
        .then(response => response.data);

    return {
        type: GET_CHATS,
        payload: request
    }
}

export function getGroupChats(data){
return {
            type: GET_GROUP_CHATS,
            payload: data
        }
}

export function afterPostMessage(data){

    return {
        type: AFTER_POST_MESSAGE,
        payload: data
    }
}
