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
      users:props.users,
      user:{},
      room:'',
      widthcolumntwo:"0%",
      widthcolumnthree:"60%",
      height:"0.5vh",
      togglechat:false
  }
this.setInitialChats()
this.handleuserchange=this.handleuserchange.bind(this)

}


componentDidMount() {
    let server = process.env.PORT||"http://localhost:5000";
    this.props.dispatch(getChats());
    this.socket = io();

    this.socket.on("Output Chat Message", messageFromBackEnd => {
        console.log("messageFromBackEnd",messageFromBackEnd)
        let chatscopy=JSON.parse(JSON.stringify(this.state.chats))
        console.log(chatscopy)
        chatscopy.push(messageFromBackEnd[0])
        console.log(chatscopy)
        this.setState({chats:chatscopy})

        if (messageFromBackEnd[0]['recipient']){
          if(this.state.user._id==messageFromBackEnd[0]['recipient']){
            let usercopy=JSON.parse(JSON.stringify(this.state.user))
            usercopy.recentprivatemessages.push(messageFromBackEnd[0])

                  let userscopy=JSON.parse(JSON.stringify(this.state.users))
                  for (let us of userscopy){
                    us.unreadmessages=0
              for (let message of usercopy.recentprivatemessages){

                  if(message.sender==us._id){
                    us.unreadmessages+=1
                  }
                }
              }
              console.log("USERS COPY",userscopy)
                this.setState({users:userscopy})
          }
        }
    })


    this.socket.on("Joined Room", messageFromBackEnd => {
        console.log("Joined Room",messageFromBackEnd)
        this.setState({user:messageFromBackEnd})
              let userscopy=JSON.parse(JSON.stringify(this.state.users))
              for (let user of userscopy){
                user.unreadmessages=0
          for (let message of messageFromBackEnd.recentprivatemessages){

              if(message.sender==user._id){
                user.unreadmessages+=1
              }
            }
          }
          console.log("USERS COPY",userscopy)
            this.setState({users:userscopy})
    })


    this.socket.on("Output pm", messageFromBackEnd => {
        console.log("mp",messageFromBackEnd)
if(messageFromBackEnd['recipient']==auth.isAuthenticated().user._id){
  let usercopy=JSON.parse(JSON.stringify(this.state.user))
  console.log("usercopy",usercopy[`recentprivatemessages`],messageFromBackEnd)

  usercopy[`recentprivatemessages`].push(messageFromBackEnd)
  console.log("usercopy",usercopy[`recentprivatemessages`])
  let userscopy=JSON.parse(JSON.stringify(this.state.users))
  for (let us of userscopy){
    us.unreadmessages=0
for (let message of usercopy.recentprivatemessages){
console.log(message)
  if(message.sender==us._id){
    us.unreadmessages+=1
  }
}
}
console.log("USERS COPY",userscopy)
this.setState({users:userscopy,user:usercopy})
      }
    })
}


async setInitialChats(){
  await fetch(`/api/chat/getChats`)
      .then(response => response.json())
      .then(data=>{
        console.log("get chats",data)
        this.setState({chats:[...data]})
      })

    let us=await fetch(`/groups/getuser/`+auth.isAuthenticated().user._id)
          .then(response => response.json())
          .then(data=>{
            console.log("user",data.data)
            return data.data
          })

      let userscopy=JSON.parse(JSON.stringify(this.state.users))
      userscopy=userscopy.filter(item=>!(item._id==auth.isAuthenticated().user._id))
      for (let user of userscopy){
        user.unreadmessages=0
  for (let message of us.recentprivatemessages){

      if(message.sender==user._id){
        user.unreadmessages+=1
      }
    }
  }
  console.log("USERS COPY",userscopy)
    this.setState({users:userscopy,user:us})
}


handleInputChange = (e) => {
    this.setState({
        chatMessage: e.target.value
    })
}



async handleuserchange(e){


  if(e.target.value=="All Group Chat"){
    this.setState({usertomessage:''})
    this.setInitialChats()
  }else{
    let recipientId
    let recipientName
    for (let us of this.state.users){
      if(us.name==e.target.value){
        recipientId=us._id
        recipientName=us.name
      }
    }
    console.log("user",e.target.value,auth.isAuthenticated().user.name)
    let room=[auth.isAuthenticated().user.name,e.target.value]
    room=room.sort()
    room=room.join()

    let userId=auth.isAuthenticated().user._id
    let userName=recipientName

    this.socket.emit("join room", {room,userName,userId,recipientId});


    this.setState({
        usertomessage: e.target.value,room: room
    })
    console.log(this.state.usertomessage)
    let chatsarray=[]


  try{

    console.log("recipientid",recipientId)
    chatsarray=await fetch(`/api/chat/getChatsWithParticularUser/${recipientId}/${auth.isAuthenticated().user._id}`)
          .then(response => response.json())
          .then(data=>{
              console.log("get chats one",data)
              let arr=[...data]
              return arr
          })
        }catch(err){
        console.log(err)
      }

            console.log("CHATSARRAY",chatsarray)

        this.setState({
            chats: chatsarray
        })
  }
}



    componentDidUpdate() {
        this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
    }





    submitChatMessage = (e) => {
        e.preventDefault();


        if (this.props.user.userData && !this.props.user.userData.isAuth) {
            return alert('Please Log in first');
        }


        let chatMessage = this.state.chatMessage
        let userId = auth.isAuthenticated().user._id
        let userName = auth.isAuthenticated().user.name;
        let nowTime = moment();
        let type = "Text"
        let recipient
        let room=this.state.room


for (let us of this.state.users){
  if(us.name==this.state.usertomessage){
    recipient=us
  }
}


console.log("recipient",recipient)

        this.socket.emit(recipient?"Input Chat Message To User":"Input Chat Message", {
            chatMessage,
            userId,
            userName,
            nowTime,
            type,
            recipient,
            room
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

    <button style={{display:"inline"}} className="submitbutton" onClick={this.submitChatMessage}>Submit Message</button>
      <select style={{margin:"5px",display:"inline",width:"17vw"}} name="room" id="room" onChange={this.handleuserchange}>
      <option value="All Group Chat">All Group Chat</option>
      {this.state.users&&this.state.users.map(user=>{
        return(
            <option key={user._id} value={user.name}>{user.name} {user.unreadmessages} unread messages </option>
        )
      })}
      </select>
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
                          this.setState({ togglechat:!this.state.togglechat,height:this.state.togglechat?"0.5vh":"40vh"});
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
