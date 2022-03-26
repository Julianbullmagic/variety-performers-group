import React, {useState, useEffect, useRef} from 'react'
import auth from './../auth/auth-helper'
import Comment from '../post/Comment'
import Poll from './Poll'
import io from "socket.io-client";
const mongoose = require("mongoose");


export default function Polls (props) {
  const [viewForm, setViewForm] = useState(false);
  const [polls, setPolls] = useState([]);
  const [group, setGroup] = useState(props.group);
  const [socket,setSocket] = useState(props.socket)
  const [page, setPage] = useState(1);
  const [pageNum, setPageNum] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const pollquestion = useRef('')

  // let server = "http://localhost:5000";
  // let socket
  // if(process.env.NODE_ENV==="production"){
  //   socket=io();
  // }
  // if(process.env.NODE_ENV==="development"){
  //   socket=io(server);
  // }


  useEffect(() => {
    setGroup(props.group)
    setSocket(props.socket)
    fetch("/polls/getpolls/"+props.groupId)
    .then(res => {
      return res.json();
    }).then(polls => {

      let po=polls.data
      po.reverse()
      setPolls(po)

      let currentpage=po.slice(0,10)

      setCurrentPageData(currentpage)

      let pagenum=Math.ceil(polls.data.length/10)

      let pagenums=[]
      while(pagenum>0){
        pagenums.push(pagenum)
        pagenum--
      }
      pagenums.reverse()

      setPageNum(pagenums)
    }).catch(err=>console.error(err))
  },[props])



  function decidePage(e,pagenum){


    let currentpage=polls.slice((pagenum*10-10),pagenum*10)

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
      approval:[],
      level:group.level,
      groupIds:[group._id],
      suggestions:[],
      timecreated:n,
      createdby:auth.isAuthenticated().user._id
    }

    const newPollToRender=JSON.parse(JSON.stringify(newPoll))
    newPollToRender.createdby=auth.isAuthenticated().user

    let chatMessage=`created a poll called ${pollquestion.current.value}`
    let userId=auth.isAuthenticated().user._id
    let userName=auth.isAuthenticated().user.name
    let nowTime=n
    let type="text"
    let groupId=group._id
    let groupTitle=group.title

    socket.emit("Input Chat Message", {
      chatMessage,
      userId,
      userName,
      nowTime,
      type,
      groupId,
      groupTitle});

      var pollscopy=JSON.parse(JSON.stringify(polls))
      pollscopy.reverse()
      pollscopy.push(newPollToRender)
      pollscopy.reverse()
      setPolls(pollscopy)

      let current=pollscopy.slice((page*10-10),page*10)
      setCurrentPageData(current)

      const options={
        method: "POST",
        body: JSON.stringify(newPoll),
        headers: {
          "Content-type": "application/json; charset=UTF-8"}}


          fetch("/polls/createpoll/"+pollId, options)
          .then(response => response.json())
          .then(json =>console.log(json))
            .catch(err => {
              console.error(err);
            })
          }


          function deletePoll(e,item) {
            var pollscopy=JSON.parse(JSON.stringify(polls))
            var filteredarray = pollscopy.filter(function( obj ) {
              return obj._id !== item._id;
            });
            setPolls(filteredarray);

            let current=filteredarray.slice((page*10-10),page*10)
            setCurrentPageData(current)

            var d = new Date();
            var n = d.getTime();

            let chatMessage=`deleted a poll called ${item.pollquestion}`
            let userId=auth.isAuthenticated().user._id
            let userName=auth.isAuthenticated().user.name
            let nowTime=n
            let type="text"
            let groupId=group._id
            let groupTitle=group.title

            socket.emit("Input Chat Message", {
              chatMessage,
              userId,
              userName,
              nowTime,
              type,
              groupId,
              groupTitle});

              let userscopy=JSON.parse(JSON.stringify(group.members))
              userscopy=userscopy.filter(item=>item.polls)
              let emails=userscopy.map(item=>{return item.email})
                  let notification={
                    emails:emails,
                    subject:"Poll Deleted",
                    message:`The poll called ${item.pollquestion} has been deleted in the group called
                    ${group.title} at level ${group.level}.`
                  }

                  const opt = {
                    method: 'post',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(notification)
                  }

                  fetch("/groups/sendemailnotification", opt
                ).then(res => {
                  console.log(res)
                }).catch(err => {
                  console.error(err);
                })

              const options={
                method: "Delete",
                body: '',
                headers: {
                  "Content-type": "application/json; charset=UTF-8"}}


                  fetch("/polls/deletepoll/"+item._id, options)
                  .then(response => response.json())
                  .then(json =>console.log(json))
                    .catch(err => {
                      console.error(err);
                    })

                  }




                  function sendPollEmailNotification(item){

                    let pollscopy=JSON.parse(JSON.stringify(polls))
                    for (let pol of pollscopy){
                      if(pol._id===item._id){
                        pol.notificationsent=true
                      }
                    }

                    setPolls(pollscopy)
                    let current=pollscopy.slice((page*10-10),page*10)

                    setCurrentPageData(current)

                    if(!item.notificationsent){
                      let userscopy=JSON.parse(JSON.stringify(props.users))
                      userscopy=userscopy.filter(user=>user.polls)
                      let emails=userscopy.map(item=>{return item.email})

                      let notification={
                        emails:emails,
                        subject:"New Poll",
                        message:`In the group called ${group.title} at level ${group.level}, ${item.createdby.name} created the poll: ${item.pollquestion}`
                      }

                      const options = {
                        method: 'post',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(notification)
                      }

                      fetch("/groups/sendemailnotification", options
                    ).then(res => {
                      console.log(res)
                    }).catch(err => {
                      console.error(err);
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
                    console.log(res)
                  }).catch(err => {
                    console.error(err);
                  })
                }
              }

                      function areYouSure(e,item){
                        console.log(item)
                          let pollscopy=JSON.parse(JSON.stringify(polls))
                          console.log(pollscopy)
                          for (let poll of pollscopy){
                            if (poll._id===poll._id){
                              poll.areyousure=true
                            }}
                            console.log(pollscopy)
                            let current=pollscopy.slice((page*10-10),page*10)
                            setPolls(pollscopy)
                            setCurrentPageData(current)
                          }

                          function areYouNotSure(e,item){
                            console.log(item)
                              let pollscopy=JSON.parse(JSON.stringify(polls))
                              console.log(pollscopy)
                              for (let poll of pollscopy){
                                if (poll._id===item._id){
                                  poll.areyousure=false
                                }}
                                console.log(pollscopy)
                                let current=pollscopy.slice((page*10-10),page*10)
                                setPolls(pollscopy)
                                setCurrentPageData(current)
                              }


              var pollsmapped=currentPageData.map((item,i)=>{

                return (
                  <>
                  <div  key={item._id} className="postbox">
                  <Poll poll={item} users={props.users} deletePoll={deletePoll} sendPollNotification={sendPollEmailNotification} group={group}/>
                  <Comment id={item._id}/>
                  </div>
                  </>
                )})
                let inthisgroup=group.members.map(item=>item._id)
                inthisgroup=inthisgroup.includes(auth.isAuthenticated().user._id)
                return (
                  <>
                  <div style={{marginBottom:"20vw"}}>
                  {inthisgroup&&<><button className="formbutton" style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Create Poll Form?</button>
                  <div className="form" style={{maxHeight:!viewForm?"0":"100vw",overflow:"hidden",transition:"max-height 2s"}}>
                  <form style={{display:!viewForm?"none":"block"}}>
                  <div className="pollform">
                  <label htmlFor='name'>Create Poll, write a question then suggest possible answers</label>
                  <button className="formsubmitbutton" onClick={(e) => handleSubmit(e)}>New Poll?</button>
                  </div>
                  <textarea className="posttextarea" ref={pollquestion} id="story" rows="5"/>
                  </form>
                  </div></>}

                  {pageNum.length>1&&<h4 style={{display:"inline"}}>Choose Page</h4>}
                  {(pageNum.length>1&&pageNum&&polls)&&pageNum.map((item,index)=>{
                    return (<>
                      <button style={{display:"inline",opacity:(index+1==page)?"0.5":"1"}} onClick={(e) => decidePage(e,item)}>{item}</button>
                      </>)
                    })}
                    {pollsmapped}
                    {pageNum.length>1&&<h4 style={{display:"inline"}}>Choose Page</h4>}
                    {(pageNum.length>1&&pageNum&&polls)&&pageNum.map((item,index)=>{
                      return (<>
                        <button style={{display:"inline",opacity:(index+1==page)?"0.5":"1"}} onClick={(e) => decidePage(e,item)}>{item}</button>
                        </>)
                      })}
                      </div>
                      </>
                    )
                  }
