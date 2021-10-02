import React, {useRef,useState} from 'react'
import auth from '../auth/auth-helper'
import io from "socket.io-client";
const mongoose = require("mongoose");


export default function CreateLeadForm(props) {
const titleValue = React.useRef('')
const descriptionValue = React.useRef('')
const locationValue = React.useRef('')
const timeValue = React.useRef('')
const durationValue = React.useRef('')
const customerNameValue = React.useRef('')
const emailValue = React.useRef('')
const phoneValue = React.useRef('')
const coordinatesValue = React.useRef('')
const [formSubmitted, setFormSubmitted] = useState(false);
const [numImages, setNumImages] = useState([0]);
const [toggle, setToggle] = useState(false);
let server = "http://localhost:5000";
let socket = io(server);

function sendAnother(e){
  setFormSubmitted(!formSubmitted)
}



function sendLeadNotification(item){
    console.log("sending Lead notification",props.users)
    let emails=props.users.map(item=>{return item.email})
    console.log(emails)
      let notification={
        emails:emails,
        subject:"New Gig Lead",
        message:`An gig lead for an event called ${item.title} has been created by ${item.customername}`
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
}


async function handleSubmit(e) {
e.preventDefault()
setFormSubmitted(!formSubmitted)

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
      customername:customerNameValue.current.value,
      location:locationValue.current.value,
      coordinates:coordinates,
      views:[],
      time:timeValue.current.value,
      duration:durationValue.current.value,
      phone:phoneValue.current.value,
      email:emailValue.current.value,
      timecreated:n,
    }
    var d = new Date();
    var n = d.getTime();





console.log("new lead", newLead)
if(props.updateLeads){
  props.updateLeads(newLead)
  let chatMessage=`created an gig lead called ${titleValue.current.value}`
  let userId=''

  if(auth.isAuthenticated()){
    userId=auth.isAuthenticated().user._id
  }

  let userName="a potential customer"

  if(auth.isAuthenticated()){
    userName=auth.isAuthenticated().user.name
  }

  let nowTime=n
  let type="text"

  socket.emit("Input Chat Message", {
    chatMessage,
    userId,
    userName,
    nowTime,
    type});
}

    console.log(newLead)
    const options={
        method: "POST",
        body: JSON.stringify(newLead),
        headers: {
            "Content-type": "application/json; charset=UTF-8"}}


      await fetch("/leads/createlead/"+leadId, options)
              .then(response => response.json()).then(json => console.log(json));

sendLeadNotification(newLead)

              titleValue.current.value=""
              descriptionValue.current.value=""
              locationValue.current.value=""
              customerNameValue.current.value=""
              timeValue.current.value=""
              durationValue.current.value=""
              emailValue.current.value=""
              phoneValue.current.value=""

}


  return (
    <div className='form' style={{borderRadius:(props.homepage?"10px":"0px")}}>
      <form style={{display:(!formSubmitted?"block":"none")}}>
<div className="eventformbox">
        <br/>
        <label htmlFor='name'>Event Title</label>
        <input
          className="leadforminput"
          style={{borderRadius:(props.homepage?"10px":"0px")}}
          type='text'
          name='titleValue'
          id='titleValue'
          ref={titleValue}
        />
</div>

<div className="eventformbox">
        <br/>
        <label htmlFor='name'>What is your name or the customer's name?</label>
        <input
          className="leadforminput"
          style={{borderRadius:(props.homepage?"10px":"0px")}}
          type='text'
          name='customerNameValue'
          id='customerNameValue'
          ref={customerNameValue}
        />
</div>


<div className="eventformbox">
        <label htmlFor='name'>Briefly describe your event and the sort of entertainment you are looking for</label>
        <input
          className="leadforminput"
          style={{borderRadius:(props.homepage?"10px":"0px")}}
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
          style={{borderRadius:(props.homepage?"10px":"0px")}}
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
          style={{borderRadius:(props.homepage?"10px":"0px")}}
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
          style={{borderRadius:(props.homepage?"10px":"0px")}}
          name='durationValue'
          id='durationValue'
          ref={durationValue}
        />
</div>
<div className="eventformbox">
        <label htmlFor='name'>Email?</label>
        <input
          className="leadforminput"
          type='text'
          style={{borderRadius:(props.homepage?"10px":"0px")}}
          name='emailValue'
          id='emailValue'
          ref={emailValue}
        />
</div>
<div className="eventformbox">
        <label htmlFor='name'>Phone?</label>
        <input
          className="leadforminput"
          type='text'
          style={{borderRadius:(props.homepage?"10px":"0px")}}
          name='phoneValue'
          id='phoneValue'
          ref={phoneValue}
        />
</div>

        <button onClick={(e) => handleSubmit(e)}>Submit booking request</button>
      </form>
      {formSubmitted&&(<>
        <h2>Thankyou for your interest in our services</h2>
        <button style={{height:"3vw"}} onClick={(e) => sendAnother(e)}>Submit another booking request</button>
        </>)}
    </div>
  )}
