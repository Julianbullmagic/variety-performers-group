import React, {useState, useEffect, useRef} from 'react'
import auth from './../auth/auth-helper'
import Comment from '../post/Comment'
import Poll from './Poll'
import io from "socket.io-client";

const mongoose = require("mongoose");


export default function Polls (props) {
  const [viewForm, setViewForm] = useState(false);
  const [polls, setPolls] = useState([]);
  const [poll, setPoll] = useState("");
  const [comment, setComment] = useState("");
  const [page, setPage] = useState(1);
  const [pageNum, setPageNum] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const pollquestion = React.useRef('')
  let server = "http://localhost:5000";
  let socket = io(server);

  useEffect(() => {
console.log("props",props)
    fetch("/polls/getpolls")
    .then(res => {
      return res.json();
    }).then(polls => {

      let po=polls.data
    po.reverse()
  setPolls(po)
console.log("PPPOOOOOO!!!!!!!!!!!",po)
  let currentpage=po.slice(0,10)
  console.log("currentpage",currentpage)
  setCurrentPageData(currentpage)

  let pagenum=Math.ceil(polls.data.length/10)
  console.log("page num",pagenum)
  let pagenums=[]
  while(pagenum>0){
  pagenums.push(pagenum)
  pagenum--
  }
  pagenums.reverse()
  console.log(pagenums)
  setPageNum(pagenums)



})
},[props])



function decidePage(e,pagenum){

  console.log("decide page",(pagenum*10-10),pagenum*10)
  let currentpage=polls.slice((pagenum*10-10),pagenum*10)
  console.log("currentpage",currentpage)
  setPage(pagenum)
  setCurrentPageData(currentpage)
}


  function handleSubmit(e){
    e.preventDefault()
      var d = new Date();
      var n = d.getTime();
      var pollId=mongoose.Types.ObjectId()

      const newPoll={
        _id:pollId,
        pollquestion:pollquestion.current.value,
        suggestions:[],
        timecreated:n,
        createdby:auth.isAuthenticated().user._id
      }

      const newPollToRender={
        _id:pollId,
        suggestions:[],
        pollquestion:pollquestion.current.value,
        timecreated:n,
        createdby:auth.isAuthenticated().user
      }

      console.log("NEW POLL!!",newPoll)
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
      pollscopy.reverse()
      pollscopy.push(newPollToRender)
      pollscopy.reverse()
      setPolls(pollscopy)


           console.log("page",page)
                 let current=pollscopy.slice((page*10-10),page*10)
                 console.log(current)
      setCurrentPageData(current)


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

      console.log("page",page)
            let current=filteredarray.slice((page*10-10),page*10)
            console.log(current)
     setCurrentPageData(current)


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




    function sendPollNotification(item){
      console.log("SENDING POLL NOTIFICATION")
      let pollscopy=JSON.parse(JSON.stringify(polls))
      for (let pol of pollscopy){
        if(pol._id==item._id){
          pol.notificationsent=true
        }
      }
      console.log(pollscopy,item)
      setPolls(pollscopy)
      let current=pollscopy.slice((page*10-10),page*10)
      console.log(current)
      setCurrentPageData(current)

      if(!item.notificationsent){
        console.log("sending Poll notification",props.users)
        let emails=props.users.map(item=>{return item.email})


        console.log(emails)
          let notification={
            emails:emails,
            subject:"New Poll Suggestion",
            message:`${item.createdby.name} suggested the poll: ${item.pollquestion}`
          }

          const options = {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
               body: JSON.stringify(notification)
          }

          fetch("/groups/sendemailnotification", options
        ) .then(res => {
        console.log(res);
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

        fetch("/polls/notificationsent/"+item._id, optionstwo
        ) .then(res => {
        console.log(res);
        }).catch(err => {
        console.log(err);
        })
      }
    }



var pollsmapped=currentPageData.map((item,i)=>{

  return (
  <>
<div className="postbox">
<div>
<Poll poll={item} users={props.users} deletePoll={deletePoll} sendPollNotification={sendPollNotification}/>
</div>
<Comment id={item._id}/>
</div>
  </>
)})

    return (
  <>
  <button style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Create Poll Form?</button>

  <div className="form" style={{maxHeight:!viewForm?"0":"100vw",overflow:"hidden",transition:"max-height 2s"}}>
  <form style={{display:!viewForm?"none":"block"}}>
          <div className="pollform">
        <label htmlFor='name'>Create Poll, write a question then suggest possible answers</label>
        <button onClick={(e) => handleSubmit(e)}>New Poll?</button>
        </div>
      <textarea ref={pollquestion} id="story" rows="5"/>
        </form>
        </div>
        <h4 style={{display:"inline"}}>Choose Page</h4>
        {(pageNum&&polls)&&pageNum.map(item=>{
          return (<>
            <button style={{display:"inline"}} onClick={(e) => decidePage(e,item)}>{item}</button>
            </>)
        })}
        {pollsmapped}
        <h4 style={{display:"inline"}}>Choose Page</h4>
        {(pageNum&&polls)&&pageNum.map(item=>{
          return (<>
            <button style={{display:"inline"}} onClick={(e) => decidePage(e,item)}>{item}</button>
            </>)
        })}
        </>
    )
}
