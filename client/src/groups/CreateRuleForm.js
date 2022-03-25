import React, {useRef,useState} from 'react'
import auth from '../auth/auth-helper'
const mongoose = require("mongoose");


export default function CreateRuleForm(props) {
  const ruleValue = useRef('')
  const explanationValue = useRef('')
  const [viewForm, setViewForm] = useState(false);



  async function handleSubmit(e) {
    e.preventDefault()
    let d = new Date();
    let n = d.getTime();
    let ruleId=mongoose.Types.ObjectId()
    ruleId=ruleId.toString()

    const newRule={
      _id:ruleId,
      rule: ruleValue.current.value,
      groupIds:[props.groupId],
      level:props.level,
      createdby:auth.isAuthenticated().user._id,
      explanation:explanationValue.current.value,
      notificationsent:false,
      ratificationnotificationsent:false,
      timecreated:n,
      approval:[auth.isAuthenticated().user._id]
    }
    console.log("NEW RULE",newRule)

    const newRuleToRender=JSON.parse(JSON.stringify(newRule))
    newRuleToRender.createdby=auth.isAuthenticated().user



      props.updateRules(newRuleToRender)
      const options={
        method: "POST",
        body: JSON.stringify(newRule),
        headers: {
          "Content-type": "application/json; charset=UTF-8"}}


          await fetch("/rules/createrule/"+ruleId, options)
          .then(response => response.json())
          .then(json => console.log(json))
          .catch(err => {
            console.error(err);
          })
        }


        return (
          <>
          <button className="formbutton" style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Create Rule Form?</button>
          <div className='form'  style={{maxHeight:!viewForm?"0":"100vw",overflow:"hidden",transition:"max-height 2s"}}>
          <form className='search-form'>
          <div className="eventformbox">
          <label htmlFor='name'>Rule</label>
          <input
          className="posttextarea"
          type='text'
          name='ruleValue'
          id='ruleValue'
          ref={ruleValue}
          style={{width:"95%"}}
          />
          </div>
          <div className="eventformbox">
          <label htmlFor='name'>Explanation</label>
          <textarea
          className="posttextarea"
          rows="4"
          type='text'
          name='explanationValue'
          id='explanationValue'
          ref={explanationValue}

          />
          </div>
          <button className="formsubmitbutton" onClick={(e) => handleSubmit(e)}>Submit Rule</button>
          </form>
          </div>
          </>
        )}
