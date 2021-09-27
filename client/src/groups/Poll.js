import React, {useState, useEffect, useRef} from 'react'
import auth from './../auth/auth-helper'
const mongoose = require("mongoose");


export default function Poll (props) {
  const [suggestions, setSuggestions] = useState([]);
  const pollsuggestion = React.useRef('')

  useEffect(() => {
console.log("props",props)
    fetch("/polls/getsuggestions/"+props.poll._id)
    .then(res => {
      return res.json();
    }).then(suggestions => {
      console.log("suggestions!!!!!!!!!!!!!!!!!!",suggestions)
  setSuggestions(suggestions.data)})
},[props])



  function handleSubmit(e){
e.preventDefault()
      var d = new Date();
      var n = d.getTime();
      var pollSuggestionId=mongoose.Types.ObjectId()

      const newPollSuggestion={
        _id:pollSuggestionId,
        suggestion:pollsuggestion.current.value,
        pollid:props.poll._id,
        timecreated:n,
        approval:[auth.isAuthenticated().user._id],
        createdby:auth.isAuthenticated().user._id
      }


console.log("newpollsuggestion",newPollSuggestion)
      var suggestionscopy=JSON.parse(JSON.stringify(suggestions))
      suggestionscopy.push(newPollSuggestion)
      setSuggestions(suggestionscopy)
      console.log(suggestionscopy)
      const options={
          method: "POST",
          body: JSON.stringify(newPollSuggestion),
          headers: {
              "Content-type": "application/json; charset=UTF-8"}}


        fetch("/polls/createpollsuggestion/"+pollSuggestionId, options)
                .then(response => response.json()).then(json => console.log(json));
  }


    function deletePollSuggestion(e,id) {
      e.preventDefault()
      var suggestionscopy=JSON.parse(JSON.stringify(suggestions))
      var filteredarray =suggestionscopy.filter(function( obj ) {
   return obj._id !== id;
   });
      setSuggestions(filteredarray);

        console.log(filteredarray)
        const options={
            method: "Delete",
            body: '',
            headers: {
                "Content-type": "application/json; charset=UTF-8"}}


           fetch("/polls/deletesuggestion/"+id, options)
                  .then(response => response.json()).then(json => console.log(json));

    }


    function approveofsuggestion(e,id){
var suggestionscopy=JSON.parse(JSON.stringify(suggestions))
function checkSuggestion() {
return id!==auth.isAuthenticated().user._id
}
for (var suggestion of suggestionscopy){
if (suggestion._id==id){

if(!suggestion.approval.includes(auth.isAuthenticated().user._id)){
suggestion.approval.push(auth.isAuthenticated().user._id)
}

setSuggestions(suggestionscopy)
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

      fetch("/polls/approveofsuggestion/" + id +"/"+ auth.isAuthenticated().user._id, options
).then(res => {
 console.log(res);
}).catch(err => {
 console.log(err);
})

}


    function withdrawapprovalofsuggestion(e,id){

      console.log("ID!!!!!",id)
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
) .then(res => {
 console.log(res);
}).catch(err => {
 console.log(err);
})

    }


let suggestionsmapped=<></>
if(suggestions&&props.users){
  console.log("users in Poll",props.users)
  var d = new Date();
  var n = d.getTime();
  suggestionsmapped=suggestions.map(item=>{
    let approval=<></>
    if(props.users){
      approval=Math.round((item.approval.length/props.users.length)*100)
    }
    if (approval<75&&(n-item.timecreated)>604800000){
      this.deleteSuggestion(item)
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

    return (<>
      <div className="pollbox">
<h5 className="ruletext">{item.suggestion}, suggested by {item.createdby.name}, </h5>
<h5 className="ruletext">{approval}% of members approve this suggestion, {item.approval.length}/{props.users.length}</h5>
{(item.approval.length>0)&&<h5 className="ruletext">, approvees=</h5>}
{approveenames&&approveenames.map((item,index)=>{return(<h5 className="ruletext"> {item}{(index<(approveenames.length-2))?", ":(index<(approveenames.length-1))?" and ":"."}</h5>)})}
{!item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext" onClick={(e)=>approveofsuggestion(e,item._id)}>Approve this suggestion?</button>}
{item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext" onClick={(e)=>withdrawapprovalofsuggestion(e,item._id)}>Withdraw Approval?</button>}
<div className="percentagecontainer"><div style={{width:width}} className="percentage"></div></div>
</div>
    </>)})
}

    return (
  <>
  <div>
  <div className="pollbox">
  <h3 className="ruletext">{props.poll.pollquestion}  </h3>
  <h4 className="ruletext">Poll Created By {props.poll.createdby.name}</h4>
  <button onClick={(e)=>props.deletePoll(e,props.poll)}>Delete?</button>
  <form>
          <div >
          <h5 className="ruletext">Create Poll Suggestion</h5>
        <button className="ruletext" onClick={(e) => handleSubmit(e)}>New Poll Suggestion?</button>
      <textarea ref={pollsuggestion} id="story" rows="2" />
          </div>
        </form>
        </div>
        <div>
        {suggestionsmapped}
        </div>
        </div>
        </>
    )
}
