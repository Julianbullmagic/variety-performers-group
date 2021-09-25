import React, {useRef,useState} from 'react'
import auth from '../auth/auth-helper'
import io from "socket.io-client";
const mongoose = require("mongoose");


export default function CreateRuleForm(props) {
const ruleValue = React.useRef('')
const explanationValue = React.useRef('')
const [toggle, setToggle] = useState(false);
let server = "http://localhost:5000";
let socket = io(server);


async function handleSubmit(e) {
e.preventDefault()
    var d = new Date();
    var n = d.getTime();
    var ruleId=mongoose.Types.ObjectId()
    ruleId=ruleId.toString()

    const newRule={
      _id:ruleId,
      rule: ruleValue.current.value,
      explanation:explanationValue.current.value,
      timecreated:n,
      approval:[auth.isAuthenticated().user._id]
    }



    let chatMessage=`created an rule; ${ruleValue.current.value}`
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



console.log("newPost.group",newRule)
    props.updateRules(newRule)
    console.log(newRule)
    const options={
        method: "POST",
        body: JSON.stringify(newRule),
        headers: {
            "Content-type": "application/json; charset=UTF-8"}}


      await fetch("/rules/createrule/"+ruleId, options)
              .then(response => response.json()).then(json => console.log(json));
}


  return (
    <div className='form'>

      <form className='search-form'>
      <div className="eventformbox">
        <label htmlFor='name'>Rule</label>
        <input
          type='text'
          name='ruleValue'
          id='ruleValue'
          ref={ruleValue}

        />
        </div>
        <div className="eventformbox">
        <label htmlFor='name'>Explanation</label>
        <textarea
          rows="4"
          type='text'
          name='explanationValue'
          id='explanationValue'
          ref={explanationValue}

        />
        </div>
        <button onClick={(e) => handleSubmit(e)}>Submit Rule</button>


      </form>
    </div>
  )}
