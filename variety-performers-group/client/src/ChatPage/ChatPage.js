import React, { Component } from 'react'
import io from "socket.io-client";
import { connect } from "react-redux";
import moment from "moment";
import { getChats, getGroupChats, afterPostMessage } from "./../actions/chat_actions"
import ChatCard from "./Sections/ChatCard"
import Dropzone from 'react-dropzone';
import Axios from 'axios';
import { CHAT_SERVER } from './Config.js';
import auth from './../auth/auth-helper'


export class ChatPage extends Component {

constructor(props){
  super(props)
  this.state = {
      chatMessage: "",
      chats:[],
      searchedusers:[],
      usersearchvalue:'',
      widthcolumntwo:"0%",
      widthcolumnthree:"60%",
      height:"0.5vh",
      usertomessage:'',
      togglechat:false
  }
this.setInitialChats()
}

async setInitialChats(){
  await fetch(`/api/chat/getChats`)
      .then(response => response.json())
      .then(data=>{
        console.log("get chats",data)
        this.setState({chats:data})
      })

}


handleInputChange = (e) => {
    this.setState({
        chatMessage: e.target.value
    })
}





    componentDidMount() {
        let server = "http://localhost:5000";

        this.props.dispatch(getChats());

        this.socket = io(server);


        this.socket.on("Output Chat Message", messageFromBackEnd => {
            console.log("messageFromBackEnd",messageFromBackEnd)
            var chatscopy=JSON.parse(JSON.stringify(this.state.chats))
            chatscopy.push(...messageFromBackEnd)
            this.setState({chats:chatscopy})
        })
    }

    componentDidUpdate() {
        this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }





    submitChatMessage = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (this.props.user.userData && !this.props.user.userData.isAuth) {
            return alert('Please Log in first');
        }


        let chatMessage = this.state.chatMessage
        let userId = auth.isAuthenticated().user._id
        let userName = auth.isAuthenticated().user.name;
        let nowTime = moment();
        let type = "Text"

        this.socket.emit("Input Chat Message", {
            chatMessage,
            userId,
            userName,
            nowTime,
            type
                  });
        this.setState({ chatMessage: "" })
    }




    render() {

      var chats=  <p>No conversation so far.</p>
console.log("this.state.chats",this.state.chats)
var type=Array.isArray(this.state.chats)
console.log(type)
if(type==true){
  chats=this.state.chats.map(chat =>{
    return (
      <ChatCard key={chat._id}  {...chat} />
    )
  })}


      return (
            <React.Fragment >
            <div style={{height:this.state.height}} className="chat">
                <div className="chatcoloumn1">
    <textarea style={{marginTop:"2vh",marginLeft:"2vw"}}
    placeholder="Let's start talking"
    align="top"
    type="text"
    value={this.state.chatMessage}
    onChange={this.handleInputChange}></textarea>

    <button className="submitbutton" onClick={this.submitChatMessage}>Submit Message</button>

          </div>
    <div style={{border:"white", borderStyle: "solid",borderWidth:"5px",margin:"10px"}} className="chatcoloumn2">

                    <div style={{ width:"97%",height: "90%",background:"#efefef",margin:"10px",  overflowY: 'scroll' }}>
                        {chats}
                        <div
                            ref={el => {
                                this.messagesEnd = el;
                            }}
                            style={{clear: "both" }}
                           />
                            </div>
                            </div>
                            </div>
                            <div className="togglechatbutton" style={{bottom:this.state.height}}>
                            <button style={{padding:"1px",borderRadius:"5px"}} onClick={() => {
                          this.setState({ togglechat:!this.state.togglechat,height:this.state.togglechat?"0.5vh":"40vh",});
                        }}>View Chat</button>
                            </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
        chats: state.chat
    }
}


export default connect(mapStateToProps)(ChatPage);
