import React, {useRef,useState} from 'react'
import auth from '../auth/auth-helper'
import io from "socket.io-client";
const mongoose = require("mongoose");


export default function CreateLeadForm(props) {
const titleValue = React.useRef('')
const descriptionValue = React.useRef('')
const locationValue = React.useRef('')
const coordinatesValue = React.useRef('')
const timeValue = React.useRef('')
const durationValue = React.useRef('')
const [toggle, setToggle] = useState(false);
let server = "http://localhost:5000";
let socket = io(server);


async function handleSubmit(e) {
e.preventDefault()
    var d = new Date();
    var n = d.getTime();
    var leadId=mongoose.Types.ObjectId()
    leadId=leadId.toString()

  let coordinates=await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationValue.current.value}.json?access_token=pk.eyJ1IjoianVsaWFuYnVsbCIsImEiOiJja25zbXJibW0wNHgwMnZsaHJoaDV6MTg4In0.qPBGW4XMJcsZSUCrQej8Zw`)
      .then(response => response.json())
      .then(data => {
        console.log("mapbox coordinates",[data['features'][0]['center'][1],data['features'][0]['center'][0]])
        return [data['features'][0]['center'][1],data['features'][0]['center'][0]]
    })

    const newLead={
      _id:leadId,
      title:titleValue.current.value,
      description:descriptionValue.current.value,
      location:locationValue.current.value,
      coordinates:coordinates,
      time:timeValue.current.value,
      duration:durationValue.current.value,
      timecreated:n,
    }
    var d = new Date();
    var n = d.getTime();


    let chatMessage=`created an gig lead called ${titleValue.current.value}`
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


console.log("new lead", newLead)
    props.updateLeads(newLead)
    console.log(newLead)
    const options={
        method: "POST",
        body: JSON.stringify(newLead),
        headers: {
            "Content-type": "application/json; charset=UTF-8"}}


      await fetch("/leads/createlead/"+leadId, options)
              .then(response => response.json()).then(json => console.log(json));
}


  return (
    <div className='form'>
      <form>
<div className="eventformbox">
        <br/>
        <label htmlFor='name'>Event Title</label>
        <input
          className="leadforminput"
          type='text'
          name='titleValue'
          id='titleValue'
          ref={titleValue}
        />
</div>
<div className="eventformbox">
        <label htmlFor='name'>Briefly describe your event and the sort of entertainment you are looking for</label>
        <input
          className="leadforminput"
          type='text'
          name='descriptionValue'
          id='descriptionValue'
          ref={descriptionValue}
        />
</div>
<div className="eventformbox">
        <label htmlFor='name'>Where is it? (All these details can be approximate, but specific is better)</label>
        <input
          className="leadforminput"
          type='text'
          name='locationValue'
          id='locationValue'
          ref={locationValue}
        />
</div>
<div className="eventformbox">
        <label htmlFor='name'>When is it?</label>
        <input
          className="leadforminput"
          type='text'
          name='timeValue'
          id='timeValue'
          ref={timeValue}
        />
</div>
<div className="eventformbox">
        <label htmlFor='name'>How long will it go for?</label>
        <input
          className="leadforminput"
          type='text'
          name='durationValue'
          id='durationValue'
          ref={durationValue}
        />
</div>
        <button onClick={(e) => handleSubmit(e)}>Submit Lead</button>


      </form>
    </div>
  )}
