import React, { Component } from 'react'
import io from "socket.io-client";
import { connect } from "react-redux";
import moment from "moment";
import {getChats} from "./../actions/chat_actions"
import ChatCard from "./Sections/ChatCard"
import auth from './../auth/auth-helper'
import addNotification from 'react-push-notification';


export class ChatPage extends Component {

constructor(props){
  super(props)
  this.state = {
      chatMessage: "",
      chats:[],
      users:props.users,
      grouptitle:props.grouptitle,
      user:{},
      currentgroupmessage:{},
      lastgroupmessage:{},
      chattingtouser:'',
      unreadwholegroupmessages:0,
      usertomessage:"",
      room:'',
      socket:props.socket,
      widthcolumntwo:"0%",
      widthcolumnthree:"60%",
      height:"0vh",
      togglechat:false
  }
this.handleuserchange=this.handleuserchange.bind(this)
this.setInitialChats=this.setInitialChats.bind(this)
}



componentWillReceiveProps(nextProps) {
   if (nextProps.users !== this.props.users) {
     this.setState({
       users: nextProps.users
     });
   }
   if (nextProps.grouptitle !== this.props.grouptitle) {
     this.setState({
       grouptitle: nextProps.grouptitle
     });
   }
   if (nextProps.socket !== this.props.socket) {
     this.setState({socket:nextProps.socket})
   }
 }

componentDidMount(props) {
    // let server ="http://localhost:5000";
    //
    // this.props.dispatch(getChats());
    // if(process.env.NODE_ENV==="production"){
    //   this.socket=io();
    // }
    // if(process.env.NODE_ENV==="development"){
    //   this.socket=io(server);
    // }

console.log("node env",process.env.NODE_ENV)
    this.setInitialChats()

    this.state.socket.on("increase unread whole group count", messageFromBackEnd => {
      if(this.state.chattingtouser){
        this.setState({unreadwholegroupmessages:this.state.unreadwholegroupmessages+1})
      }
})

    this.state.socket.on("Output Chat Message", messageFromBackEnd => {
        if(this.state.usertomessage!=="All Group Chat"){
          this.setState({unreadallgroupmessages:this.state.unreadallgroupmessages+1})
        }
        if(this.state.usertomessage==="All Group Chat"){
          this.setState({unreadallgroupmessages:0})
        }
        console.log("OUTPUT CHAT MESSAGE messageFromBackEnd",messageFromBackEnd)

    addNotification({
    title: `New notifications in group ${messageFromBackEnd.groupId}`,
    subtitle: '',
    message: messageFromBackEnd.message,
    theme: 'darkblue',
    native: true
});

        let chatscopy=JSON.parse(JSON.stringify(this.state.chats))
        chatscopy.push(messageFromBackEnd[0])

        if(chatscopy.length>50){
          chatscopy=chatscopy.slice((chatscopy.length-50),(chatscopy.length-1))
        }
        this.setState({chats:chatscopy,currentgroupmessage:messageFromBackEnd[0]})

        if (messageFromBackEnd[0]['recipient']){
          if(this.state.user._id===messageFromBackEnd[0]['recipient']){

            let usercopy=JSON.parse(JSON.stringify(this.state.user))
            usercopy.recentprivatemessages.push(messageFromBackEnd[0])

                  let userscopy=JSON.parse(JSON.stringify(this.state.users))
                  for (let us of userscopy){
                    us.unreadmessages=0
              for (let message of usercopy.recentprivatemessages){

                  if(message.sender===us._id){
                    us.unreadmessages+=1
                  }
                }
              }
              this.setState({users:userscopy})
          }
        }
    })


    this.state.socket.on("Joined Room", messageFromBackEnd => {
        this.setState({user:messageFromBackEnd})
              let userscopy=JSON.parse(JSON.stringify(this.state.users))
              for (let user of userscopy){
                user.unreadmessages=0
          for (let message of messageFromBackEnd.recentprivatemessages){
              if(message.sender===user._id){
                user.unreadmessages+=1
              }
            }
          }
            this.setState({users:userscopy})
    })

    this.state.socket.on("Output pm", messageFromBackEnd => {
if(messageFromBackEnd['recipient']===auth.isAuthenticated().user._id){
  let usercopy=JSON.parse(JSON.stringify(this.state.user))
  usercopy[`recentprivatemessages`].push(messageFromBackEnd)
  let userscopy=JSON.parse(JSON.stringify(this.state.users))
  for (let us of userscopy){
    us.unreadmessages=0
for (let message of usercopy.recentprivatemessages){
console.log(message)
  if(message.sender===us._id){
    us.unreadmessages+=1
  }
}
}
this.setState({users:userscopy,user:usercopy})
      }
    })
}

async setInitialChats(){
  let room=this.props.grouptitle
  let userName=auth.isAuthenticated().user.name
    this.state.socket.emit("join group room", {room,userName});
  await fetch(`/api/chat/getChats/`+this.props.groupId)
      .then(response => response.json())
      .then(data=>{
        console.log("get chats",data)
        if(data.length>50){
          data=data.slice((data.length-50),(data.length-1))
          console.log(data)
        }
        this.setState({chats:[...data]})
      })

    let us=await fetch(`/groups/getuser/`+auth.isAuthenticated().user._id)
          .then(response => response.json())
          .then(data=>{
            return data.data
          })

      let userscopy=JSON.parse(JSON.stringify(this.state.users))

      for (let user of userscopy){
        user.unreadmessages=0
  for (let message of us.recentprivatemessages){
      if(message.sender===user._id){
        user.unreadmessages+=1
      }
    }
  }
    this.setState({users:userscopy,user:us})
}

handleInputChange = (e) => {
    this.setState({
        chatMessage: e.target.value
    })
}

async handleuserchange(e){
  if(e.target.value==="All Group Chat"){
    this.setState({usertomessage:'',unreadwholegroupmessages:0})
    this.setInitialChats()
    let room=this.props.groupId
    let userName=auth.isAuthenticated().user.name
    this.state.socket.emit("join group room", {room,userName});
    this.setState({chattingtouser:false})
  }else{
    let recipientId
    let recipientName
    for (let us of this.state.users){
      if(us.name===e.target.value){
        recipientId=us._id
        recipientName=us.name
      }
    }
    let room=[auth.isAuthenticated().user.name,e.target.value]
    room=room.sort()
    room=room.join()
    let groupId=this.props.groupId
    let userId=auth.isAuthenticated().user._id
    let userName=recipientName

    this.state.socket.emit("join room", {room,userName,userId,recipientId,groupId});
    if(this.state.usertomessage===""){
      this.setState({lastgroupmessage:this.state.currentgroupmessage})
    }
    this.setState({usertomessage: e.target.value,room: room,chattingtouser:true})
    let chatsarray=[]
  try{
    chatsarray=await fetch(`/api/chat/getChatsWithParticularUser/${recipientId}/${auth.isAuthenticated().user._id}`)
          .then(response => response.json())
          .then(data=>{
              let arr=[...data]
              return arr
          })
        }catch(err){
        console.error(err)
      }

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
        let groupId=this.props.groupId
        let groupTitle=this.state.grouptitle
        let nowTime = moment();
        let type = "Text"
        let recipient
        let room=this.state.room


for (let us of this.state.users){
  if(us.name===this.state.usertomessage){
    recipient=us
  }
}
console.log(recipient?"Input Chat Message To User":"Input Chat Message")
        this.state.socket.emit(recipient?"Input Chat Message To User":"Input Chat Message", {
            chatMessage,
            userId,
            userName,
            nowTime,
            type,
            recipient,
            room,
            groupId,
            groupTitle
                  });
        this.setState({ chatMessage: "" })
    }


    render() {

      var chats=  <p>No conversation so far.</p>
var type=Array.isArray(this.state.chats)
if(type===true){
  chats=this.state.chats.map(chat =>{
    return (
      <ChatCard key={chat._id}  {...chat} />
    )
  })}
let users=this.state.users.map(item=>item._id)
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

    {(users.includes(auth.isAuthenticated().user._id))&&
      <button style={{display:"inline",marginTop:"0.5vh"}} className="submitbutton" onClick={this.submitChatMessage}>Submit Message</button>}
      <select style={{marginLeft:"1vw",marginTop:"0.5vh",display:"inline"}} name="room" id="room" onChange={this.handleuserchange}>
      <option value="All Group Chat">All Group Chat {this.state.unreadwholegroupmessages} unread messages</option>
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
                            <div className="togglechatbutton chat" style={{
                              bottom:this.state.height,
                              borderColor:"#c7cecc",
                              borderStyle: "solid",
                              borderRightWidth:"0.5vw",
                              borderleftWidth:"0.5vw",
                              borderTopWidth:"0.5vw",
                              width:"100vw",
                              transition:"bottom 2s"}}>
                            <button style={{transform:"translateY(-30%)",margin:"8px",borderRadius:"5px"}} onClick={(e) => {e.preventDefault();
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
