import React, {useState, useEffect, useRef} from 'react'
import auth from './../auth/auth-helper'
import Comment from '../post/Comment'
import Poll from './Poll'
import io from "socket.io-client";

const mongoose = require("mongoose");


export default function Polls (props) {
  const [polls, setPolls] = useState([]);
  const [poll, setPoll] = useState("");
  const [comment, setComment] = useState("");
  const pollquestion = React.useRef('')
  let server = process.env.PORT||"http://localhost:5000";
  let socket = io(server);

  useEffect(() => {
console.log("props",props)
    fetch("/polls/getpolls")
    .then(res => {
      return res.json();
    }).then(polls => {
      console.log("polls",polls)
  setPolls(polls.data)})
},[props])



  function handleSubmit(e){
    e.preventDefault()
      var d = new Date();
      var n = d.getTime();
      var pollId=mongoose.Types.ObjectId()

      const newPoll={
        _id:pollId,
        pollquestion:pollquestion.current.value,
        timecreated:n,
        createdby:auth.isAuthenticated().user._id
      }

      var d = new Date();
      var n = d.getTime();


      let chatMessage=`created a poll called ${pollquestion.current.value}`
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

console.log("newpoll",newPoll)
      var pollscopy=JSON.parse(JSON.stringify(polls))
      pollscopy.push(newPoll)
      setPolls(pollscopy)
      console.log(polls)
      const options={
          method: "POST",
          body: JSON.stringify(newPoll),
          headers: {
              "Content-type": "application/json; charset=UTF-8"}}


        fetch("/polls/createpoll/"+pollId, options)
                .then(response => response.json()).then(json => console.log(json));

  }


    function deletePoll(e,item) {
      console.log("DELETING POLL",item)
      var pollscopy=JSON.parse(JSON.stringify(polls))
      var filteredarray = pollscopy.filter(function( obj ) {
   return obj._id !== item._id;
   });
      setPolls(filteredarray);
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



var pollsmapped=polls.map((item,i)=>{

  return (
  <>
<div className="postbox">
<div>
<Poll poll={item} users={props.users} deletePoll={deletePoll}/>
</div>
<Comment id={item._id}/>
</div>
  </>
)})

    return (
  <>
  <div className="form">
  <form>
          <div className="pollform">
        <label htmlFor='name'>Create Poll, write a question then suggest possible answers</label>
        <button onClick={(e) => handleSubmit(e)}>New Poll?</button>
        </div>
      <textarea ref={pollquestion} id="story" rows="5"/>
        </form>
        </div>
        {pollsmapped}
        </>
    )
}
