import React, {useState, useEffect, useRef} from 'react'
import auth from './../auth/auth-helper'
import Comment from '../post/Comment'
import Poll from './Poll'
import io from "socket.io-client";

const mongoose = require("mongoose");


export default function Jury(props) {
  const [selectedUser, setSelectedUser] = useState(props.users[0]);
  const [restriction, setRestriction] = useState('cannot post');
  const [duration, setDuration] = useState(0);
  const [restrictionPolls, setRestrictionPolls] = useState([]);
  const [comment, setComment] = useState("");
  const pollquestion = React.useRef('')
  let server = process.env.PORT||"http://localhost:5000";
  let socket = io(server);

  useEffect(() => {
console.log("props",props)
    fetch("/polls/getrestrictionpolls")
    .then(res => {
      return res.json();
    }).then(restrictionpolls => {
      console.log("polls",restrictionpolls)
  setRestrictionPolls(restrictionpolls.data)})
},[])



  function handleSubmit(e){
    e.preventDefault()
    console.log(restriction,duration,selectedUser)
      var d = new Date();
      var n = d.getTime();
      var restrictionPollId=mongoose.Types.ObjectId()

      const newRestrictionPoll={
        _id:restrictionPollId,
        usertorestrict: selectedUser._id,
        usertorestrictname: selectedUser.name,
        restriction: restriction,
        duration:duration,
        approval: [auth.isAuthenticated().user._id],
        timecreated:n,
        createdby:auth.isAuthenticated().user._id
      }

console.log("newRestrictionPoll",newRestrictionPoll)

      let chatMessage=`suggested a restriction poll for ${selectedUser.name}`
      let userId=auth.isAuthenticated().user._id
      let userName=auth.isAuthenticated().user.name
      let nowTime=n
      let type="text"

      socket.emit("Input Chat Message", {
        chatMessage,
        userId,
        userName,
        nowTime,
        type});

console.log("newrestrictionpoll",newRestrictionPoll)
      var restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
      restrictionpollscopy.push(newRestrictionPoll)
      setRestrictionPolls(restrictionpollscopy)
      console.log(restrictionpollscopy)
      const options={
          method: "POST",
          body: JSON.stringify(newRestrictionPoll),
          headers: {
              "Content-type": "application/json; charset=UTF-8"}}


        fetch("/polls/createrestrictionpoll/"+restrictionPollId, options)
                .then(response => response.json()).then(json => console.log(json));

  }


    function deleteRestrictionPoll(e,item) {
      var restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
      var filteredarray = restrictionpollscopy.filter(function( obj ) {
   return obj._id !== item._id;
   });
      setRestrictionPolls(filteredarray);
      var d = new Date();
      var n = d.getTime();


      let chatMessage=`deleted a poll called ${item.pollquestion}`
      let userId=auth.isAuthenticated().user._id
      let userName=auth.isAuthenticated().user.name
      let nowTime=n
      let type="text"

      socket.emit("Input Chat Message", {
        chatMessage,
        userId,
        userName,
        nowTime,
        type});

        console.log(filteredarray)
        const options={
            method: "Delete",
            body: '',
            headers: {
                "Content-type": "application/json; charset=UTF-8"}}


           fetch("/polls/deletepoll/"+item._id, options)
                  .then(response => response.json()).then(json => console.log(json));

    }


        function deleteRestriction(e,item) {

          let chatMessage=`restriction ${item.pollquestion} no longer
          applies for ${item.usertorestrictname}`
          let userId=auth.isAuthenticated().user._id
          let userName=""
          let nowTime=n
          let type="text"

          socket.emit("Input Chat Message", {
            chatMessage,
            userId,
            userName,
            nowTime,
            type});

            const options={
                method: "Delete",
                body: '',
                headers: {
                    "Content-type": "application/json; charset=UTF-8"}}


               fetch("/groups/deleterestriction/"+item._id, options)
                      .then(response => response.json()).then(json => console.log(json));

        }


    function handleMemberChange(event){
      console.log(event.target.value)
      for (let user of props.users){
        console.log(user.name)
        if(user._id===event.target.value){
          console.log(user)
          setSelectedUser(user)
        }
      }
    }

    function handleRestrictionChange(event){
      console.log(event.target.value)
      setRestriction(event.target.value)
    }

    function handleDurationChange(event){
      console.log(event.target.value)
      setDuration(event.target.value)
    }



          async function approve(e,id){
    var restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))

    for (var restriction of restrictionpollscopy){
      if (restriction._id==id){

     if(!restriction.approval.includes(auth.isAuthenticated().user._id)){
       restriction.approval.push(auth.isAuthenticated().user._id)
     }
      }
      let approval
      if(props.users){
        approval=(restriction.approval.length/props.users.length)*100
      }
      let restricteduser={}
      for (let user of props.users){
        if(user._id==restriction.usertorestrict){
          restricteduser=user
          console.log("restricteduser",restricteduser)
let rest=[]
if(restricteduser.restrictions){
  for (let r of restricteduser.restrictions){
    let concatenated=`${r.restriction}${r.duration}`
    rest.push(concatenated)
  }
}
let currentrest=`${restriction.restriction}${restriction.duration}`
console.log(!rest.includes(currentrest))
console.log("CREAING NEW RESTRICION?",approval)

if(!rest.includes(currentrest)&&approval>1){
  console.log("CREAtING NEW RESTRICION")



  var d = new Date();
  var n = d.getTime();





  var restrictionId=mongoose.Types.ObjectId()
  restrictionId=restrictionId.toString()
  const newRestriction={
    _id:restrictionId,
    usertorestrict:restriction.usertorestrict,
    restriction:restriction.restriction,
    duration:restriction.duration,
    timecreated:n
  }

  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
       body: JSON.stringify(newRestriction)
  }

  var restrictionid=await fetch("/groups/createuserrrestriction", options
  ).then(res => {
  return res.json()
  }).catch(err => {
  console.log(err);
  })

  const optionstwo = {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
       body: ''
  }
  console.log("RESTRICTION ID",restrictionid.data._id)

  fetch("/groups/addrestrictiontouser/" + restriction.usertorestrict +"/"+ restrictionid.data._id, optionstwo
  ).then(res => {
  console.log(res);
  }).catch(err => {
  console.log(err);
  })
}
        }
      }
    }

    setRestrictionPolls(restrictionpollscopy)
             const options = {
               method: 'put',
               headers: {
                 'Content-Type': 'application/json'
               },
                  body: ''
             }

             fetch("/polls/approveofrestriction/" + id +"/"+ auth.isAuthenticated().user._id, options
    ).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      })
    }


          function withdrawapproval(e,id){
             let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
             function checkRestriction(userid) {
               return userid!=auth.isAuthenticated().user._id
             }
             for (var restriction of restrictionpollscopy){
               if (restriction._id==id){


                 var filteredapproval=restriction.approval.filter(checkRestriction)
                 restriction.approval=filteredapproval
               }
             }
             setRestrictionPolls(restrictionpollscopy)

             const options = {
               method: 'put',
               headers: {
                 'Content-Type': 'application/json'
               },
                  body: ''
             }

             fetch("/polls/withdrawapprovalofrestriction/" + id +"/"+ auth.isAuthenticated().user._id, options
     ).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      })

           }
    var d = new Date();
    var n = d.getTime();

    var restrictionpollsmapped=restrictionPolls.map((item,i)=>{
      let approval=<></>

      if(props.users){
        approval=Math.round((item.approval.length/props.users.length)*100)
      }
      if (approval<75&&(n-item.timecreated)>604800000){
        this.deleteRestriction(item)
        this.deleteRestrictionPoll(item)
      }
      let approveenames=[]
      for (let user of props.users){
        for (let approvee of item.approval){
          if (approvee==user._id){
            approveenames.push(user.name)
          }
        }
      }

      return (
      <>
      <h4>{item.restriction}</h4>
      <h4>{item.usertorestrictname}</h4>
      {props.users&&<h4>{approval}% of members approve this restriction, {item.approval.length}/{props.users.length}</h4>}
      {approveenames&&approveenames.map(item=>{return(<><p>{item}</p></>)})}
      {item.approval.includes(auth.isAuthenticated().user._id)&&<h4>You have approved this restriction</h4>}
      {!item.approval.includes(auth.isAuthenticated().user._id)&&<button onClick={(e)=>approve(e,item._id)}>Approve?</button>}
      {item.approval.includes(auth.isAuthenticated().user._id)&&<button onClick={(e)=>withdrawapproval(e,item._id)}>Withdraw Approval?</button>}
      <Comment id={item._id}/>
      </>
    )})



    return (
  <>
  <div className="juryform">
  <form >
        <div className="eventformbox">
        <h3>Propose a punishment for a member</h3>
        </div>
        <div className="eventformbox">
        <select name="room" id="room" onChange={(e) => handleMemberChange(e)}>
          {props.users&&props.users.map(item=>{return (
            <option key={item._id} value={item._id}>{item.name}</option>
          )})}
        </select>
        <p htmlFor="room">members</p>
        </div>
        <div className="eventformbox">
        <select id="restriction" onChange={(e) => handleRestrictionChange(e)}>
            <option value="cannot post">cannot post</option>
            <option value="cannot create polls">cannot create polls</option>
            <option value="cannot suggest rules or vote for rules">cannot suggest rules or vote for rules</option>
            <option value="cannot see gig leads">cannot see gig leads</option>
            <option value="cannot use chat">cannot use chat</option>
            <option value="cannot see events">cannot see events</option>
            <option value="cannot participate in group purchases">cannot participate in group purchases</option>
            <option value="cannot vote in jury">cannot vote in jury</option>
            <option value="remove from group">remove from group</option>
        </select>
        <p htmlFor="room">Choose a punishment</p>

        </div>
        <div className="eventformbox">
        <input style={{display:"inline",width:"10vw"}} type='text' name='duration' id='duration' onChange={(e) => handleDurationChange(e)}/>
        <p htmlFor="duration">How many days?</p>
        </div>
        <button onClick={(e) => handleSubmit(e)}>New Restriction Poll?</button>
        </form>
        </div>
        {restrictionpollsmapped}
        </>
    )
}
