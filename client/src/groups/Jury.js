import React, {useState, useEffect, useRef} from 'react'
import auth from './../auth/auth-helper'
import Comment from '../post/Comment'
import Poll from './Poll'
import io from "socket.io-client";

const mongoose = require("mongoose");


export default function Jury(props) {
  const [viewForm, setViewForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(props.users[0]);
  const [restriction, setRestriction] = useState('cannot post');
  const [duration, setDuration] = useState(0);
  const [restrictionPolls, setRestrictionPolls] = useState([]);
  const [comment, setComment] = useState("");
  const [page, setPage] = useState(1);
  const [pageNum, setPageNum] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const pollquestion = React.useRef('')
  let server = "http://localhost:5000";
  let socket = io(server);

  useEffect(() => {
console.log("props",props)
    fetch("/polls/getrestrictionpolls")
    .then(res => {
      return res.json();
    }).then(restrictionpolls => {
      console.log("polls",restrictionpolls)


  let po=restrictionpolls.data
  po.reverse()
setRestrictionPolls(po)

console.log("decide page",0,10)
let currentpage=po.slice(0,10)
console.log("currentpage",currentpage)
setCurrentPageData(currentpage)

let pagenum=Math.ceil(restrictionpolls.data.length/10)
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
},[])


function decidePage(e,pagenum){

  console.log("decide page",(pagenum*10-10),pagenum*10)
  let currentpage=restrictionPolls.slice((pagenum*10-10),pagenum*10)
  console.log("currentpage",currentpage)
  setPage(pagenum)
  setCurrentPageData(currentpage)
}


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

      let newRestrictionPollToRender=JSON.parse(JSON.stringify(newRestrictionPoll))

      newRestrictionPollToRender.createdby=auth.isAuthenticated().user

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
      restrictionpollscopy.reverse()
      restrictionpollscopy.push(newRestrictionPollToRender)
      restrictionpollscopy.reverse()
      setRestrictionPolls(restrictionpollscopy)

            let current=restrictionpollscopy.slice((page*10-10),page*10)
            console.log(current)
 setCurrentPageData(current)
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



          async function approve(e,item){
            console.log("ITEM",item)
    var restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))

    for (var restriction of restrictionpollscopy){
      if (restriction._id==item._id){

     if(!restriction.approval.includes(auth.isAuthenticated().user._id)){
       restriction.approval.push(auth.isAuthenticated().user._id)
     }
      }
      setRestrictionPolls(restrictionpollscopy)

      let current=restrictionpollscopy.slice((page*10-10),page*10)
      console.log(current)
      setCurrentPageData(current)

      let approval
      if(props.users){
        approval=(restriction.approval.length/props.users.length)*100
      }

      console.log("approval!!!!!",approval)
      let restricteduser={}
      for (let user of props.users){
        console.log("user",user,restriction)
        if(user._id==restriction.usertorestrict._id){
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
console.log("CREAtING NEW RESTRICION?",approval)

if(!rest.includes(currentrest)&&approval>10){
  console.log("CREAtING NEW RESTRICION")
restrictionPollApprovedNotification(item)


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

  var restrictionid= await fetch("/groups/createuserrrestriction", options
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

             const options = {
               method: 'put',
               headers: {
                 'Content-Type': 'application/json'
               },
                  body: ''
             }

             fetch("/polls/approveofrestriction/" + item._id +"/"+ auth.isAuthenticated().user._id, options
    ).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      })
    }







          function withdrawapproval(e,item){
             let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
             function checkRestriction(userid) {
               return userid!=auth.isAuthenticated().user._id
             }
             for (var restriction of restrictionpollscopy){
               if (restriction._id==item._id){


                 var filteredapproval=restriction.approval.filter(checkRestriction)
                 restriction.approval=filteredapproval
               }
             }
             setRestrictionPolls(restrictionpollscopy)
             let current=restrictionpollscopy.slice((page*10-10),page*10)
             console.log(current)
             setCurrentPageData(current)
             const options = {
               method: 'put',
               headers: {
                 'Content-Type': 'application/json'
               },
                  body: ''
             }

             fetch("/polls/withdrawapprovalofrestriction/" + item._id +"/"+ auth.isAuthenticated().user._id, options
     ).then(res => {
        console.log(res);
      }).catch(err => {
        console.log(err);
      })
           }



          function sendRestrictionPollNotification(item){
             if(!item.notificationsent){
               var restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
               for (let pol of restrictionpollscopy){
                 if (pol._id==item._id){
                   pol.notificationsent=true
           }}
           setRestrictionPolls(restrictionpollscopy)
           let current=restrictionpollscopy.slice((page*10-10),page*10)
           console.log(current)
           setCurrentPageData(current)

               console.log("sending rule notification",props.users)
               let emails=props.users.map(item=>{return item.email})


               console.log(emails)
                 let notification={
                   emails:emails,
                   subject:"New Restriction Suggestion In Group Jury",
                   message:`${item.createdby.name} suggested a restriction ${item.restriction} for ${item.usertorestrict.name}`
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

               fetch("/polls/restrictionnotificationsent/"+item._id, optionstwo
               ) .then(res => {
               console.log(res);
               }).catch(err => {
               console.log(err);
               })
             }
           }


           function restrictionPollApprovedNotification(item){
             console.log("restrictionPollApprovedNotification(item)",item)
             let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))

              if(!item.ratificationnotificationsent){
                for (let pol of restrictionpollscopy){
                  if (pol._id==item._id){
                    pol.ratificationnotificationsent=true
            }}

            console.log("SENDING RATIFICATION NOTIFICATION")
            setRestrictionPolls(restrictionpollscopy)
            let current=restrictionpollscopy.slice((page*10-10),page*10)
            console.log(current)
            setCurrentPageData(current)

                let emails=props.users.map(item=>{return item.email})

                console.log(emails)
                  let notification={
                    emails:emails,
                    subject:"A restriction has been approved by group jury",
                    message:`${item.usertorestrict.name} ${item.restriction} for ${item.duration}`
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

                fetch("/polls/restrictionratificationnotificationsent/"+item._id, optionstwo
                ) .then(res => {
                console.log(res);
                }).catch(err => {
                console.log(err);
                })
              }
            }


    var d = new Date();
    var n = d.getTime();

    var restrictionpollsmapped=currentPageData.map((item,i)=>{
      let approval=<></>

      if(props.users){
        approval=Math.round((item.approval.length/props.users.length)*100)
      }

      if(approval>=10&&!item.notificationsent){
        sendRestrictionPollNotification(item)
      }

      if (approval<75&&(n-item.timecreated)>604800000){
        deleteRestriction(item)
        deleteRestrictionPoll(item)
      }


      let approveenames=[]
      for (let user of props.users){
        for (let approvee of item.approval){
          if (approvee==user._id){
            approveenames.push(user.name)
          }
        }
      }
      let width=`${(item.approval.length/props.users.length)*100}%`

      return (
      <>
      <div className="postbox">
      <div className="juryboxform">
      <h4 className="ruletext"><strong>Restriction:</strong> {item.restriction} ,</h4>
      <h4 className="ruletext"><strong>For:</strong> {item.usertorestrictname} ,</h4>
      <h4 className="ruletext"><strong>Created By:</strong> {item.createdby.name} ,</h4>

      {props.users&&<h4 className="ruletext">{approval}% of members approve this restriction, {item.approval.length}/{props.users.length}</h4>}

      {(item.approval.length>0)&&<h4 className="ruletext">, approvees=</h4>}
      {approveenames&&approveenames.map((item,index)=>{return(<h4 className="ruletext"> {item}{(index<(approveenames.length-2))?", ":(index<(approveenames.length-1))?" and ":"."}</h4>)})}
      {!item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext" onClick={(e)=>approve(e,item)}>Approve?</button>}
      {item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext" onClick={(e)=>withdrawapproval(e,item)}>Withdraw Approval?</button>}
      <div className="percentagecontainer"><div style={{width:width}} className="percentage"></div></div>
      </div>
      <Comment id={item._id}/>
      </div>
      </>
    )})



    return (
  <>
  <button style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Restriction Poll Form?</button>
    <div className="juryform" style={{maxHeight:!viewForm?"0":"100vw",overflow:"hidden",transition:"max-height 2s"}}>
    <form>
          <div className="eventformbox" >
          <h3>Propose a punishment for a member</h3>
          </div>
          <div className="eventformbox">

          <select style={{width:"70vw"}} name="room" id="room" onChange={(e) => handleMemberChange(e)}>
            {props.users&&props.users.map(item=>{return (
              <option key={item._id} value={item._id}>{item.name}</option>
            )})}
          </select>
          <p htmlFor="room"> members</p>
          </div>
          <div className="eventformbox">
          <select style={{width:"70vw"}} id="restriction" onChange={(e) => handleRestrictionChange(e)}>
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
          <p htmlFor="room"> Choose a punishment</p>

          </div>
          <div className="eventformbox">
          <input style={{display:"inline",width:"70vw"}} type='text' name='duration' id='duration' onChange={(e) => handleDurationChange(e)}/>
          <p htmlFor="duration"> How many days?</p>
          </div>
          <button onClick={(e) => handleSubmit(e)}>New Restriction Poll?</button>
          </form>
          </div>


        <h4 style={{display:"inline"}}>Choose Page</h4>
        {(pageNum&&restrictionPolls)&&pageNum.map(item=>{
          return (<>
            <button style={{display:"inline"}} onClick={(e) => decidePage(e,item)}>{item}</button>
            </>)
        })}
        {restrictionpollsmapped}
        <h4 style={{display:"inline"}}>Choose Page</h4>
        {(pageNum&&restrictionPolls)&&pageNum.map(item=>{
          return (<>
            <button style={{display:"inline"}} onClick={(e) => decidePage(e,item)}>{item}</button>
            </>)
        })}
        </>
    )
}
