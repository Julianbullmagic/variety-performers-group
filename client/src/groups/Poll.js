import React, {useState, useEffect, useRef} from 'react'
import auth from './../auth/auth-helper'
const mongoose = require("mongoose");
const MILLISECONDS_IN_A_DAY=86400000
const MILLISECONDS_IN_A_WEEK=604800000

export default function Poll (props) {
  const [suggestions, setSuggestions] = useState([]);
  const [poll, setPoll] = useState(props.poll);
  const [sure, setSure] = useState(false);
  const [group, setGroup] = useState(props.group);
  const pollsuggestion = React.useRef('')

  useEffect(() => {
    fetch("/polls/getsuggestions/"+props.poll._id)
    .then(res => {
      return res.json();
    }).then(suggestions => {
      setSuggestions(suggestions.data)})
      .catch(err => {
        console.error(err);
      })
    },[])



    function sendPollDown(){


      if(!poll.sentdown){
        var pollcopy=JSON.parse(JSON.stringify(poll))

        pollcopy.sentdown=true

        setPoll(pollcopy)

        let allmembers=[]
        for (let g of group.groupsbelow){
          allmembers.push(g.members)
          for (let gr of g.groupsbelow){
            allmembers.push(gr.members)
          }}

          const options = {
            method: 'put',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(allmembers)
          }



          fetch("/polls/marksentdown/" + poll._id, options
        ).then(res => {
          console.log(res)
        }).catch(err => {
          console.error(err);
        })


        let lowergroupids=[]
        for (let grou of group.groupsbelow){

          if(grou.groupsbelow){
            lowergroupids.push(...grou.groupsbelow)
          }
          lowergroupids.push(grou._id)
        }

        for (let gr of lowergroupids){

          fetch("/polls/sendpolldown/" + poll._id +"/"+ gr, options
        ).then(res => {
          console.log(res)
        }).catch(err => {
          console.error(err);
        })
      }
    }
  }

  function approveOfSendingPollDown(e,pollId){
    var pollcopy=JSON.parse(JSON.stringify(poll))

    let approval=0

    if(!pollcopy.approval.includes(auth.isAuthenticated().user._id)){
      pollcopy.approval.push(auth.isAuthenticated().user._id)
    }

    let votesfrommembers=[]
    let memberids=group.members.map(item=>item._id)

    for (let vote of pollcopy.approval){
      if (memberids.includes(vote)){
        votesfrommembers.push(vote)
      }
    }
    pollcopy.approval=votesfrommembers

    if(group.members.length>0){
      approval=Math.round((pollcopy.approval.length/group.members.length)*100)
    }

    if (approval>75){
      sendPollDown()
    }
    setPoll(pollcopy)
    const options = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: ''
    }

    fetch("/polls/approveofsendingpolldown/" + pollId +"/"+ auth.isAuthenticated().user._id, options
  ).then(res => {
    console.log(res)
  }).catch(err => {
    console.error(err);
  })
}

function withdrawApprovalOfSendingPollDown(e,pollId){
  var pollcopy=JSON.parse(JSON.stringify(poll))

  function checkPoll(userid) {
    return userid!=auth.isAuthenticated().user._id
  }

  var filteredapproval=pollcopy.approval.filter(checkPoll)
  pollcopy.approval=filteredapproval

  setPoll(pollcopy)

  const options = {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: ''
  }

  fetch("/polls/withdrawapprovalofsendingpolldown/" + pollId +"/"+ auth.isAuthenticated().user._id, options
).then(res => {
  console.log(res)
}).catch(err => {
  console.error(err);
})
}


function handleSubmit(e){
  e.preventDefault()
  var d = new Date();
  var n = d.getTime();
  var pollSuggestionId=mongoose.Types.ObjectId()

  let newPollSuggestion={
    _id:pollSuggestionId,
    suggestion:pollsuggestion.current.value,
    pollid:props.poll._id,
    timecreated:n,
    approval:[auth.isAuthenticated().user._id],
    createdby:auth.isAuthenticated().user._id
  }
let newPollSuggestionToRender=JSON.parse(JSON.stringify(newPollSuggestion))
newPollSuggestionToRender.createdby=auth.isAuthenticated().user


  var suggestionscopy=JSON.parse(JSON.stringify(suggestions))
  suggestionscopy.reverse()
  suggestionscopy.push(newPollSuggestionToRender)
  suggestionscopy.reverse()

  setSuggestions(suggestionscopy)

  const options={
    method: "POST",
    body: JSON.stringify(newPollSuggestion),
    headers: {
      "Content-type": "application/json; charset=UTF-8"}}


      fetch("/polls/createpollsuggestion/"+pollSuggestionId, options)
      .then(response => response.json())
      .then(json =>console.log(json))
        .catch(err => {
          console.error(err);
        })
      }


      function deletePollSuggestion(e,item) {
        var suggestionscopy=JSON.parse(JSON.stringify(suggestions))
        var filteredarray =suggestionscopy.filter(function( obj ) {
          return obj._id !== item._id;
        });
        setSuggestions(filteredarray);

        const options={
          method: "Delete",
          body: '',
          headers: {
            "Content-type": "application/json; charset=UTF-8"}}


            fetch("/polls/deletesuggestion/"+item._id, options)
            .then(response => response.json())
            .then(json =>console.log(json))
              .catch(err => {
                console.error(err);
              })
            }


            function approveofsuggestion(e,id){
              console.log(id)
              var suggestionscopy=JSON.parse(JSON.stringify(suggestions))
              function checkSuggestion() {
                return id!==auth.isAuthenticated().user._id
              }
              for (var suggestion of suggestionscopy){
                let votesfrommembers=[]
                let memberids=group.members.map(item=>item._id)
                console.log("memberids",memberids)
                for (let vote of suggestion.approval){
                  if (memberids.includes(vote)){
                    votesfrommembers.push(vote)
                  }
                }
                suggestion.approval=votesfrommembers
                console.log(suggestion.approval)

                if (suggestion._id==id){
                  if(!suggestion.approval.includes(auth.isAuthenticated().user._id)){
                    suggestion.approval.push(auth.isAuthenticated().user._id)
                  }
                }
                console.log("APPROVAL",suggestion.approval)
              }
              if(suggestions.length>=3&&!props.poll.notificationsent){
                props.sendPollNotification(props.poll)
              }

              setSuggestions(suggestionscopy)
              const options = {
                method: 'put',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: ''
              }

              fetch("/polls/approveofsuggestion/" + id +"/"+ auth.isAuthenticated().user._id, options
            ).catch(err => {
              console.error(err);
            })
          }


          function withdrawapprovalofsuggestion(e,id){
            console.log(id)
            var suggestionscopy=JSON.parse(JSON.stringify(suggestions))
            function checkSuggestion(userid) {
              return userid!=auth.isAuthenticated().user._id
            }
            for (var suggestion of suggestionscopy){
              if (suggestion._id==id){
                var filteredapproval=suggestion.approval.filter(checkSuggestion)
                suggestion.approval=filteredapproval
              }
            }
            setSuggestions(suggestionscopy)

            const options = {
              method: 'put',
              headers: {
                'Content-Type': 'application/json'
              },
              body: ''
            }

            fetch("/polls/withdrawapprovalofsuggestion/" + id +"/"+ auth.isAuthenticated().user._id, options
          ).catch(err => {
            console.error(err);
          })
        }


        function areYouSure(e,item){
          console.log(item)
            let suggestionscopy=JSON.parse(JSON.stringify(suggestions))
            console.log(suggestionscopy)
            for (let suggest of suggestionscopy){
              if (suggest._id==item._id){
                suggest.areyousure=true
              }}
              console.log(suggestionscopy)
              setSuggestions(suggestionscopy)
            }

            function areYouNotSure(e,item){
              console.log(item)
              let suggestionscopy=JSON.parse(JSON.stringify(suggestions))
                console.log(suggestionscopy)
                for (let suggest of suggestionscopy){
                  if (suggest._id==item._id){
                    suggest.areyousure=false
                  }}
                  console.log(suggestionscopy)
                  setSuggestions(suggestionscopy)
                }

                function areYouSur(e){
                      setSure(true)
                    }

                    function areYouNotSur(e){
                          setSure(false)
                        }

        let suggestionsmapped=<></>
        if(suggestions&&props.users){

          var d = new Date();
          var n = d.getTime();


          if(suggestions.length>=3&&!props.poll.notificationsent){

            props.sendPollNotification(props.poll)
          }

          suggestionsmapped=suggestions.map(item=>{
            let approval=<></>
            console.log("approval in render",item.suggestion,item.approval)
            let votesfrommembers=[]
            let memberids=group.members.map(item=>item._id)
            console.log("memberids in render",group.members,memberids)
            for (let vote of item.approval){
              if (memberids.includes(vote)){
                votesfrommembers.push(vote)
              }
            }
            item.approval=votesfrommembers
            console.log("votes from members",item.approval)
            approval=Math.round((item.approval.length/group.members.length)*100)


            let approveenames=[]
            for (let user of group.members){
              for (let approvee of item.approval){
                if (approvee==user._id){
                  approveenames.push(user.name)
                }
              }
            }

            let width=`${(item.approval.length/group.members.length)*100}%`
            console.log(item.approval,item.approval.length,group.members.length)

            return (<>
              <div key={item._id} className="pollbox">
              <h5 className="ruletext">{item.suggestion}, suggested by {item.createdby.name}, </h5>
              <h5 className="ruletext">{approval}% of members in this group approve this suggestion, {item.approval.length}/{group.members.length}</h5>
              {group.groupabove&&<>
              {(((item.createdby._id==auth.isAuthenticated().user._id)||group.groupabove.members.includes(auth.isAuthenticated().user._id))&&approval<75&&!item.areyousure)&&
                <button className="ruletext deletebutton" onClick={(e)=>areYouSure(e,item)}>Delete Suggestion?</button>}
                {item.areyousure&&<button className="ruletext deletebutton" onClick={(e)=>areYouNotSure(e,item)}>Not sure</button>}
                {item.areyousure&&<button className="ruletext deletebutton" onClick={(e)=>deletePollSuggestion(e,item)}>Are you sure?</button>}
                </>}
                {!item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext" onClick={(e)=>approveofsuggestion(e,item._id)}>Approve this suggestion?</button>}
                {item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext" onClick={(e)=>withdrawapprovalofsuggestion(e,item._id)}>Withdraw Approval?</button>}
                {approveenames&&approveenames.map((item,index)=>{return(<><h4 className="ruletext">{item}{(index<(approveenames.length-2))?", ":(index<(approveenames.length-1))?" and ":"."}</h4></>)})}
                <div className="percentagecontainer"><div style={{width:width}} className="percentage"></div></div>
                {(poll&&group.level>poll.level)&&<p>This poll has been passed down by a higher group, all of it's children groups can vote on this question</p>}
                </div>
                </>)})
              }
              let approval=<></>
              let votesfrommembers=[]
              let memberids=group.members.map(item=>item._id)
              var pollcopy=JSON.parse(JSON.stringify(poll))

              for (let vote of pollcopy.approval){
                if (memberids.includes(vote)){
                  votesfrommembers.push(vote)
                }
              }
              pollcopy.approval=votesfrommembers
              if(group.members){
                approval=Math.round((pollcopy.approval.length/group.members.length)*100)
              }

              let approveenames=[]
              for (let user of group.members){
                for (let approvee of pollcopy.approval){
                  if (approvee==user._id){
                    approveenames.push(user.name)
                  }
                }
              }
              let width=`${(pollcopy.approval.length/group.members.length)*100}%`

              return (
                <>
                <div key={props.poll._id}>
                <div className="pollbox">
                <h3 className="ruletext">{props.poll.pollquestion}  </h3>
                {props.poll.createdby&&<>
                  <h5 className="ruletext">Poll Created By {props.poll.createdby.name}</h5>
                  {group.groupabove&&<>
                {(((props.poll.createdby._id==auth.isAuthenticated().user._id)||group.groupabove.members.includes(auth.isAuthenticated().user._id))&&!sure)&&
                  <button className="ruletext deletebutton" onClick={(e)=>areYouSur(e)}>Delete Poll?</button>}</>}
                  {sure&&<button className="ruletext deletebutton" onClick={(e)=>areYouNotSur(e)}>Not sure</button>}
                  {sure&&<button className="ruletext deletebutton" onClick={(e)=>props.deletePoll(e,props.poll)}>Are you sure?</button>}
                  </>}
                  <form>
                  <div>
                  <h5 className="ruletext">Create Poll Suggestion</h5>
                  <button className="pollsuggestionbutton" className="ruletext" onClick={(e) => handleSubmit(e)}>New Poll Suggestion?</button>
                  <textarea style={{width:"75vw"}} ref={pollsuggestion} id="story" rows="2" />
                  </div>
                  </form>
                  </div>
                  <div>
                  {suggestionsmapped}

                  {(group.level==poll.level)&&<>
                    <div className="pollbox">
                      {group.level>0&&<>
                      <h5 className="ruletext">Send Down?</h5>
                      {(!poll.approval.includes(auth.isAuthenticated().user._id))&&<button onClick={(e)=>approveOfSendingPollDown(e,poll._id)}>Send poll down to children groups?</button>}
                      {(poll.approval.includes(auth.isAuthenticated().user._id))&&<button onClick={(e)=>withdrawApprovalOfSendingPollDown(e,poll._id)}>Don't send poll down to children groups?</button>}
                      {group.members&&<h4 className="ruletext">{approval}% of members want to send this poll to lower groups, {poll.approval.length}/{group.members.length}. {poll.approval.length>0&&<h4 style={{display:'inline'}}>Approvees=</h4>}</h4>}
                      {approveenames&&approveenames.map((item,index)=>{return(<><h4 className="ruletext">{item}{(index<(approveenames.length-2))?", ":(index<(approveenames.length-1))?" and ":"."}</h4></>)})}
                      <div className="percentagecontainer"><div style={{width:width}} className="percentage"></div></div></>}</div>
                      </>}
                      </div>
                      </div>
                      </>
                    )
                  }
