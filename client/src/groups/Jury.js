import React, {useState, useEffect, useRef} from 'react'
import auth from './../auth/auth-helper'
import Comment from '../post/Comment'
import Poll from './Poll'
import io from "socket.io-client";
const mongoose = require("mongoose");
const MILLISECONDS_IN_A_DAY=86400000
const MILLISECONDS_IN_A_WEEK=604800000

export default function Jury(props) {
  const [viewForm, setViewForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(props.users[`${props.users.length-1}`]);
  const [group, setGroup] = useState(props.group);
  const [users, setUsers] = useState(props.users);
  const [allGroups, setAllGroups] = useState([props.group])
  const [searchTerm, setSearchTerm] = useState('');
  const [restriction, setRestriction] = useState('cannot post');
  const [uploadComplete, setUploadComplete] = useState(false);
  const [isShown,setIsShown]=useState(false)
  const [leaderCreatingRestriction,setLeaderCreatingRestriction]=useState(false)
  const [explanation, setExplanation] = useState('');
  const [duration, setDuration] = useState(0);
  const [restrictionPolls, setRestrictionPolls] = useState([]);
  const [comment, setComment] = useState("");
  const [page, setPage] = useState(1);
  const [pageNum, setPageNum] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const pollquestion = React.useRef('')
  let server = "http://localhost:5000";
  let socket
  if(process.env.NODE_ENV=="production"){
    socket=io();
  }
  if(process.env.NODE_ENV=="development"){
    socket=io(server);
  }
console.log("node env",process.env.NODE_ENV)
  useEffect(()=>{
    setGroup(props.group)
    setAllGroups([props.group])
    setUsers(props.users)
    setSelectedUser(props.users[0])
  },[props])

  useEffect(() => {

    fetch("/polls/getrestrictionpolls/"+props.groupId)
    .then(res => {
      return res.json();
    }).then(restrictionpolls => {

      let po=restrictionpolls.data
      po.reverse()
      setRestrictionPolls(po)

      let currentpage=po.slice(0,10)

      setCurrentPageData(currentpage)
      let pagenum=Math.ceil(restrictionpolls.data.length/10)

      let pagenums=[]
      while(pagenum>0){
        pagenums.push(pagenum)
        pagenum--
      }
      pagenums.reverse()

      setPageNum(pagenums)
    }).catch(err => {
      console.error(err);
    })
  },[])


  function decidePage(e,pagenum){

    let currentpage=restrictionPolls.slice((pagenum*10-10),pagenum*10)

    setPage(pagenum)
    setCurrentPageData(currentpage)
  }



  async function leaderCreateRestriction(e){
    setLeaderCreatingRestriction(true)
    e.preventDefault()

    var d = new Date();
    var n = d.getTime();

    let chatMessage=`created a restriction for ${selectedUser.name}`
    let userId=auth.isAuthenticated().user._id
    let userName=auth.isAuthenticated().user.name
    let nowTime=n
    let type="text"
    let groupTitle=group.title
    let groupId=group._id


    socket.emit("Input Chat Message", {
      chatMessage,
      userId,
      userName,
      nowTime,
      type,
      groupId,
      groupTitle});

      let rest=[]

      if(selectedUser.restrictions){
        for (let r of selectedUser.restrictions){
          let concatenated=`${r.restriction}${r.duration}`
          rest.push(concatenated)
        }
      }
      let currentrest=`${restriction}${duration}`


      if(!rest.includes(currentrest)){


        var d = new Date();
        var n = d.getTime();

        var restrictionId=mongoose.Types.ObjectId()
        restrictionId=restrictionId.toString()
        const newRestriction={
          _id:restrictionId,
          usertorestrict:selectedUser._id,
          restriction:restriction,
          createdby:auth.isAuthenticated().user._id,
          explanation:explanation,
          groupId:props.groupId,
          groupIds:allGroups,
          duration:duration,
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
        console.error(err);
      })

      const optionstwo = {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: ''
      }

      let updateduser=await fetch("/groups/addrestrictiontouser/" + selectedUser._id +"/"+ restrictionid.data._id, optionstwo
    ).then(res => {
      return res.json()
    }).catch(err => {
      console.error(err);
    })
  }
  setLeaderCreatingRestriction(false)
  setUploadComplete(true)
  setTimeout(() => {
    setUploadComplete(false)
  }, 5000)
}


function handleSubmit(e){
  e.preventDefault()

  var d = new Date();
  var n = d.getTime();
  var restrictionPollId=mongoose.Types.ObjectId()

  const newRestrictionPoll={
    _id:restrictionPollId,
    usertorestrict: selectedUser._id,
    usertorestrictname: selectedUser.name,
    explanation:explanation,
    groupId:props.groupId,
    groupIds:allGroups,
    restriction: restriction,
    duration:duration,
    approval: [auth.isAuthenticated().user._id],
    timecreated:n,
    createdby:auth.isAuthenticated().user._id
  }

  let newRestrictionPollToRender=JSON.parse(JSON.stringify(newRestrictionPoll))
  newRestrictionPollToRender.usertorestrict=selectedUser

  newRestrictionPollToRender.createdby=auth.isAuthenticated().user
  let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
  restrictionpollscopy.reverse()
  restrictionpollscopy.push(newRestrictionPollToRender)
  restrictionpollscopy.reverse()
  setRestrictionPolls(restrictionpollscopy);
  let current=restrictionpollscopy.slice((page*10-10),page*10)
  setCurrentPageData(current)

  const options={
    method: "POST",
    body: JSON.stringify(newRestrictionPoll),
    headers: {
      "Content-type": "application/json; charset=UTF-8"}}

      fetch("/polls/createrestrictionpoll/"+restrictionPollId, options)
      .then(response => response.json())
      .then(json =>console.log(json))
      .catch(err => {
        console.error(err);
      })
    }
function delRestPoll(e,item){
  var restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
  var filteredarray = restrictionpollscopy.filter(function( obj ) {
    return obj._id !== item._id;
  });
  setRestrictionPolls(filteredarray);

  let current=filteredarray.slice((page*10-10),page*10)

  setCurrentPageData(current)
}

    function deleteRestrictionPoll(e,item) {

      deleteRestriction(item)
      var restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))


      var d = new Date();
      var n = d.getTime();


      let chatMessage=`deleted a restriction poll for ${item.usertorestrict.name} ${item.restriction} for ${item.duration} days`
      let userId=auth.isAuthenticated().user._id
      let userName=auth.isAuthenticated().user.name
      let nowTime=n
      let type="text"
      let groupTitle=group.title
      let groupId=group._id

      socket.emit("Input Chat Message", {
        chatMessage,
        userId,
        userName,
        nowTime,
        type,
        groupId,
        groupTitle});


        const options={
          method: "Delete",
          body: '',
          headers: {
            "Content-type": "application/json; charset=UTF-8"}}


            fetch("/polls/deleterestrictionpoll/"+item._id, options)
            .then(json =>console.log(json))
            .catch(err => {
              console.error(err);
            })

          }


          async function deleteRestriction(item) {
            let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
            let chatMessage=`The restriction, ${item.restriction} for ${item.duration} days, has been deleted for ${item.usertorestrict.name}`
            let userId=auth.isAuthenticated().user._id
            let userName=auth.isAuthenticated().user.name
            let nowTime=n
            let type="text"
            let groupTitle=group.title
            let groupId=group._id

            socket.emit("Input Chat Message", {
              chatMessage,
              userId,
              userName,
              nowTime,
              type,
              groupId,
              groupTitle});


              setRestrictionPolls(restrictionpollscopy)
              let current=restrictionpollscopy.slice((page*10-10),page*10)

              setCurrentPageData(current)

              let userscopy=JSON.parse(JSON.stringify(props.users))


              userscopy=userscopy.filter(user=>user.restriction)

              let emails=userscopy.map(item=>{return item.email})

              let notification={
                emails:emails,
                subject:"Restriction Deleted",
                message:`The restriction ${item.restriction} for ${item.duration} in the group ${group.title} at level ${group.level}
                has been deleted for ${item.usertorestrict.name}`
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
              console.log(res)
            }).catch(err => {
              console.error(err);
            })

            const opt={
              method: "Delete",
              body: JSON.stringify(item),
              headers: {
                "Content-type": "application/json; charset=UTF-8"}}

                let rest=await fetch("/groups/deleterestriction", opt)
                .then(res=>res.json())
                .then(json => {return json.data})
                .catch(err => {
                  console.error(err);
                })
                console.log("returned restriction",rest)
                if(rest){
                  const opttwo={
                    method: "Put",
                    body: '',
                    headers: {
                      "Content-type": "application/json; charset=UTF-8"}}

                      await fetch("/groups/removerestrictionfromuser/"+rest._id+"/"+item.usertorestrict._id, opttwo)
                      .then(json =>{return json})
                      .catch(err => {
                        console.error(err);
                      })
                }
                  }


              function handleMemberChange(event){

                for (let user of props.users){

                  if(user._id===event.target.value){
                    console.log(selectedUser)
                    setSelectedUser(user)
                    console.log(user)
                  }
                }
              }

              function handleRestrictionChange(event){

                setRestriction(event.target.value)
              }

              function handleExplanationChange(event){

                setExplanation(event.target.value)
              }

              function handleDurationChange(event){

                setDuration(event.target.value)
              }

              function appr(e,item){
                let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))

                for (let restriction of restrictionpollscopy){
                    let approval
                  if (restriction._id==item._id){

                    if(!restriction.approval.includes(auth.isAuthenticated().user._id)){
                      restriction.approval.push(auth.isAuthenticated().user._id)
                    }
                    approval=Math.round((restriction.approval.length/group.members.length)*100)

                    console.log("appr restriction",approval)

                    setRestrictionPolls(restrictionpollscopy)
                    let current=restrictionpollscopy.slice((page*10-10),page*10)
                    setCurrentPageData(current)}}
              }

             function approve(e,item){
                let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))

                for (let restriction of restrictionpollscopy){
                    let approval
                  if (restriction._id==item._id){
                    if(!restriction.approval.includes(auth.isAuthenticated().user._id)){
                      restriction.approval.push(auth.isAuthenticated().user._id)
                    }

                    approval=Math.round((restriction.approval.length/group.members.length)*100)

                    let d = new Date();
                    let n = d.getTime();


                    console.log("approving restriction",approval)

                    if(approval>=10&&!restriction.notificationsent){
                      sendRestrictionPollNotification(restriction)
                    }
                    if (approval<75&&(n-restriction.timecreated)>MILLISECONDS_IN_A_WEEK){
                      deleteRestrictionPoll(null,restriction)
                    }
                  }

                  let restricteduser={}
                  for (let user of props.users){

                    if(user._id==restriction.usertorestrict._id){
                      restricteduser=user

                      let rest=[]
                      if(restricteduser.restrictions){
                        for (let r of restricteduser.restrictions){
                          let concatenated=`${r.restriction}${r.duration}`
                          rest.push(concatenated)
                        }
                      }
                      let currentrest=`${restriction.restriction}${restriction.duration}`


                      if(!rest.includes(currentrest)&&approval>75){
                        sendRestrictionPollApprovedNotification(restriction)
                        createRestriction()

                        async function createRestriction(){
                        var d = new Date();
                        var n = d.getTime();

                        let restrictionId=mongoose.Types.ObjectId()
                        restrictionId=restrictionId.toString()
                        const newRestriction={
                          _id:restrictionId,
                          usertorestrict:restriction.usertorestrict._id,
                          restriction:restriction.restriction,
                          explanation:restriction.explanation,
                          groupIds:allGroups,
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

                        let restrictionid= await fetch("/groups/createuserrrestriction", options
                      ).then(res => {
                        return res.json()
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

                      await fetch("/groups/addrestrictiontouser/" + restriction.usertorestrict._id +"/"+ restrictionid.data._id, optionstwo
                    ).then(res => {
                      return res.json()
                    }).catch(err => {
                      console.error(err);
                    })
                  }
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
            console.log(res)
          }).catch(err => {
            console.error(err);
          })
        }







        function withdrawapproval(e,item){
          let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
          function checkRestriction(userid) {
            return userid!=auth.isAuthenticated().user._id
          }
          for (let restriction of restrictionpollscopy){
            if (restriction._id==item._id){

              let filteredapproval=restriction.approval.filter(checkRestriction)
              restriction.approval=filteredapproval
            }
            let d = new Date();
            let n = d.getTime();

            let approval=0

            if(props.users){
              approval=Math.round((restriction.approval.length/props.users.length)*100)
            }

            if (approval<75&&(n-restriction.timecreated)>MILLISECONDS_IN_A_WEEK){
              deleteRestrictionPoll(null,restriction)
            }
          }
          setRestrictionPolls(restrictionpollscopy)
          let current=restrictionpollscopy.slice((page*10-10),page*10)

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
          console.log(res)
        }).catch(err => {
          console.error(err);
        })
      }



      function sendRestrictionPollNotification(item){
        if(!item.notificationsent){
          var restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
          for (let pol of restrictionpollscopy){
            if (pol._id==item._id){
              pol.notificationsent=true
            }}

            let chatMessage=`The restriction, ${item.restriction} for ${item.duration} days, has been suggested for ${selectedUser.name}`
            let userId=auth.isAuthenticated().user._id
            let userName=auth.isAuthenticated().user.name
            let nowTime=n
            let type="text"
            let groupTitle=group.title
            let groupId=group._id

            socket.emit("Input Chat Message", {
              chatMessage,
              userId,
              userName,
              nowTime,
              type,
              groupId,
              groupTitle});


              setRestrictionPolls(restrictionpollscopy)
              let current=restrictionpollscopy.slice((page*10-10),page*10)

              setCurrentPageData(current)

              let userscopy=JSON.parse(JSON.stringify(props.users))


              userscopy=userscopy.filter(user=>user.restriction)

              let emails=userscopy.map(item=>{return item.email})

              let notification={
                emails:emails,
                subject:"New Restriction Suggestion In Group Jury",
                message:`${item.createdby.name} suggested a restriction ${item.restriction} for ${item.usertorestrict.name} in the group ${group.title} at level ${group.level}`
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

            fetch("/polls/restrictionnotificationsent/"+item._id, optionstwo
          ) .then(res => {
            console.log(res)
          }).catch(err => {
            console.error(err);
          })
        }
      }


      function sendRestrictionPollApprovedNotification(item){

        let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))

        if(!item.ratificationnotificationsent){
          for (let pol of restrictionpollscopy){
            if (pol._id==item._id){
              pol.ratificationnotificationsent=true
            }}

            setRestrictionPolls(restrictionpollscopy)
            let current=restrictionpollscopy.slice((page*10-10),page*10)

            setCurrentPageData(current)

            let userscopy=JSON.parse(JSON.stringify(props.users))

            let chatMessage=`The restriction, ${item.restriction} for ${item.duration} days, has been approved for ${item.usertorestrict.name}`
            let userId=auth.isAuthenticated().user._id
            let userName=auth.isAuthenticated().user.name
            let nowTime=n
            let type="text"
            let groupTitle=group.title
            let groupId=group._id

            socket.emit("Input Chat Message", {
              chatMessage,
              userId,
              userName,
              nowTime,
              type,
              groupId,
              groupTitle});

              userscopy=userscopy.filter(user=>user.restrictionsapproved)
              let emails=userscopy.map(item=>{return item.email})

              let notification={
                emails:emails,
                subject:"A restriction has been approved by group jury",
                message:`The restriction, ${item.restriction} for ${item.duration} days, has been approved for ${item.usertorestrict.name}
                in the group ${group.title} at level ${group.level}`
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

            fetch("/polls/restrictionratificationnotificationsent/"+item._id, optionstwo
          ) .then(res => {
            console.log(res)
          }).catch(err => {
            console.error(err);
          })
        }
      }


      function areYouSure(e,item){
        console.log(item)
        let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
        console.log(restrictionpollscopy)
        for (let poll of restrictionpollscopy){
          if (poll._id==item._id){
            poll.areyousure=true
          }}
          console.log(restrictionpollscopy)
          let current=restrictionpollscopy.slice((page*10-10),page*10)
          setRestrictionPolls(restrictionpollscopy)
          setCurrentPageData(current)
        }

        function areYouNotSure(e,item){
          console.log(item)
          let restrictionpollscopy=JSON.parse(JSON.stringify(restrictionPolls))
          console.log(restrictionpollscopy)
          for (let poll of restrictionpollscopy){
            if (poll._id==item._id){
              poll.areyousure=false
            }}
            console.log(restrictionpollscopy)
            let current=restrictionpollscopy.slice((page*10-10),page*10)
            setRestrictionPolls(restrictionpollscopy)
            setCurrentPageData(current)
          }

          function searchMembers(e){
            setSearchTerm(e.target.value)
          }

      var d = new Date();
      var n = d.getTime();

      var restrictionpollsmapped=currentPageData.map((item,i)=>{
        let approval=<></>

        if(props.users){
          approval=Math.round((item.approval.length/props.users.length)*100)
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
        if (approval<75&&(n-item.timecreated)>MILLISECONDS_IN_A_WEEK){
          deleteRestrictionPoll(null,item)
        }

        return (
          <>
          <div key={item._id} className="postbox">
          <div className="juryboxform">
          <h4 className="ruletext"><strong>Restriction:</strong> {item.restriction} for {item.duration} days, </h4>
          <h4 className="ruletext"><strong>User to Restrict:</strong> {item.usertorestrictname} ,</h4>
          <h4 className="ruletext"><strong>Created By:</strong> {item.createdby.name} ,</h4>
          {props.users&&<h4 className="ruletext">{approval}% of members approve this restriction, {item.approval.length}/{props.users.length}</h4>}
          {(item.approval.length>0)&&<h4 className="ruletext">, approvees=</h4>}
          {approveenames&&approveenames.map((item,index)=>{return(<h4 className="ruletext"> {item}{(index<(approveenames.length-2))?", ":(index<(approveenames.length-1))?" and ":"."}</h4>)})}
          {!item.approval.includes(auth.isAuthenticated().user._id)&&<button style={{margin:"0.5vw"}} className="ruletext" onClick={(e)=>{approve(e,item);appr(e,item);}}>Approve?</button>}
          {item.approval.includes(auth.isAuthenticated().user._id)&&<button style={{margin:"0.5vw"}} className="ruletext" onClick={(e)=>withdrawapproval(e,item)}>Withdraw Approval?</button>}
          {group.groupabove&&<>
            {(((item.createdby&&(item.createdby._id==auth.isAuthenticated().user._id))||group.groupabove.members.includes(auth.isAuthenticated().user._id))&&!item.areyousure)&&
              <button className="ruletext deletebutton" onClick={(e)=>areYouSure(e,item)}>Delete Restriction Poll?</button>}
            </>}
            {item.areyousure&&<button className="ruletext deletebutton" onClick={(e)=>areYouNotSure(e,item)}>Not sure</button>}
            {item.areyousure&&<button className="ruletext deletebutton" onClick={(e)=>{deleteRestrictionPoll(e,item);delRestPoll(e,item);}}>Are you sure?</button>}
            <h4 style={{margin:"0vw",marginBottom:"0.5vw"}}><strong>Explanation:</strong> {item.explanation} </h4>
            <div className="percentagecontainer"><div style={{width:width}} className="percentage"></div></div>
            </div>
            <Comment id={item._id}/>
            </div>
            </>
          )})

          let allusers=users

          let alluserscopy=JSON.parse(JSON.stringify(allusers))
          let usernames=[]
          allusers=[]
          for (let user of alluserscopy){
            if (!usernames.includes(user.name)){
              usernames.push(user.name)
              allusers.push(user)
            }
          }
          if (searchTerm){
            allusers=allusers.filter(user=>user.name.toLowerCase().includes(searchTerm.toLowerCase()))
          }
          console.log("all users",allusers)

          let inthisgroup=group.members.map(item=>item._id)
          inthisgroup=inthisgroup.includes(auth.isAuthenticated().user._id)
          console.log("props.users[0]",props.users,props.users[`${props.users.length-1}`])
          return (
            <>
            <div style={{marginBottom:"20vw"}}>
            {inthisgroup&&<><button style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Restriction Poll Form?</button>
            <div className="juryform" style={{maxHeight:!viewForm?"0":"300vw",overflow:"hidden",transition:"max-height 2s"}}>
            <form>
            <div className="eventformbox" >
            <h3>Propose a punishment for a member</h3>
            </div>
            <div className="eventformbox">
            {(group.level>1)&&<><input style={{width:"30vw",margin:'1vw'}} type='text' onChange={(e) => searchMembers(e)}/>
            <p htmlFor="duration">Search for users then select from the drop down menu below</p></>}
            <select name="room" id="room" onChange={(e) => handleMemberChange(e)}>
            {allusers&&allusers.map(item=>{return (
              <option key={item._id} value={item._id}>{item.name}</option>
            )})}
            </select>
            <p htmlFor="room"> Members</p>
            </div>
            <div className="eventformbox">
            <select id="restriction" onChange={(e) => handleRestrictionChange(e)}>
            <option value="cannot post">cannot post</option>
            <option value="cannot create polls">cannot create polls</option>
            <option value="cannot suggest rules or vote for rules">cannot suggest rules or vote for rules</option>
            <option value="cannot use chat">cannot use chat</option>
            <option value="cannot vote for leaders">cannot vote for leaders</option>
            <option value="cannot see events">cannot see events</option>
            <option value="cannot vote in jury">cannot vote in jury</option>
            <option value="remove from group">remove from group</option>
            </select>
            <p htmlFor="room"> Choose a punishment</p>

            </div>
            <div className="eventformbox">
            <input type='text' name='duration' id='duration' onChange={(e) => handleDurationChange(e)}/>
            <p htmlFor="duration"> How many days?</p>
            </div>
            <div className="eventformbox">
            <input type='text' name='explanation' id='explanation' onChange={(e) => handleExplanationChange(e)}/>
            <p htmlFor="room"> Explanation</p>

            <div className="restrictionexplanation">
            <p style={{display:"block"}} htmlFor="duration">
            Explain why you think this restriction should be imposed? Which rule or rules have been broken?
            What is your evidence? Why do you think this punishment is proportionate to the crime? Avoid
            enforcing rules that have not been agreed on and made explicit in the group rules tab. People
            will not follow a rule if they don't even know it exists. A rule might seem like common sense
            to you, but to someone of a different background, culture, nationality, religion or ethnicity,
            it might not.
            </p>
            </div>
            </div>
            <button className="formsubmitbutton" style={{margin:"0.5vw"}} onClick={(e) => handleSubmit(e)}>New Restriction Poll</button>
              <p style={{margin:"0.5vw"}}>Restriction polls are activated at 75% approval.</p>
              </form>
              </div></>}



              {pageNum.length>1&&<h4 style={{display:"inline"}}>Choose Page</h4>}
              {(pageNum.length>1&&pageNum&&restrictionPolls)&&pageNum.map((item,index)=>{
                return (<>
                  <button style={{display:"inline",opacity:(index+1==page)?"0.5":"1"}} onClick={(e) => decidePage(e,item)}>{item}</button>
                  </>)
                })}
                {restrictionpollsmapped}

                {pageNum.length>1&&<h4 style={{display:"inline"}}>Choose Page</h4>}
                {(pageNum.length>1&&pageNum&&restrictionPolls)&&pageNum.map((item,index)=>{
                  return (<>
                    <button style={{display:"inline",opacity:(index+1==page)?"0.5":"1"}} onClick={(e) => decidePage(e,item)}>{item}</button>
                    </>)
                  })}
                  </div>
                  </>
                )
              }
