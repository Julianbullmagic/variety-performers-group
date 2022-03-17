import React, {useRef,useState,useEffect} from 'react'
import auth from '../auth/auth-helper'
import io from "socket.io-client";
import isEmail from 'validator/lib/isEmail';
const mongoose = require("mongoose");

export default function CreateLeadForm(props) {
  const [viewForm, setViewForm] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [fixErrors, setFixErrors] = useState(false);
  const [sendNotif,setSendNotif] = useState(props.sendnotif)
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
  let socket
  if(process.env.NODE_ENV=="production"){
    socket=io();
  }
  if(process.env.NODE_ENV=="development"){
    socket=io(server);
  }
  function sendAnother(e){
    setFormSubmitted(!formSubmitted)
  }

  useEffect(() => {
    if(props.sendnotif){
      console.log("send notif",props.sendnotif)
      setSendNotif(props.sendnotif)
    }
  },[props])

  function sendLeadEmailNotification(item){
    console.log("sending Lead notification",props.users)
    let userscopy=JSON.parse(JSON.stringify(props.users))
    console.log(userscopy.length)
    userscopy=userscopy.filter(user=>user.leads)
    let emails=userscopy.map(item=>{return item.email})
    console.log(emails)
    console.log(emails.length)
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
console.log("errors",phoneError,emailError,addressError)
  let coordinates=await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationValue.current.value}.json?access_token=pk.eyJ1IjoianVsaWFuYnVsbCIsImEiOiJja25zbXJibW0wNHgwMnZsaHJoaDV6MTg4In0.qPBGW4XMJcsZSUCrQej8Zw`)
    .then(response => response.json())
    .then(data => {
      if(data['features']){
      if(data['features'][0]){
        if(data['features'][0]['center']){
          console.log("mapbox coordinates",[data['features'][0]['center'][1],data['features'][0]['center'][0]])
          return [data['features'][0]['center'][1],data['features'][0]['center'][0]]
        }else{
          return null
        }
      }
    }
    })
    let errors=false

  function onlyNumbers(array) {
    return array.every(element => {
      return typeof element === 'number';
    });
  }
  var phoneExpression = /^\({0,1}((0|\+61)(2|4|3|7|8)){0,1}\){0,1}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{1}(\ |-){0,1}[0-9]{3}$/;

  if(phoneValue.current.value.match(phoneExpression)){
    setPhoneError(false)
  }else{
    setPhoneError(true)
    setFixErrors(true)
    errors=true
  }
  if (coordinates){
    if(onlyNumbers(coordinates)){
      setAddressError(false)
    }else{
      setAddressError(true)
      setFixErrors(true)
      errors=true
    }
  }
  if (!coordinates){
    setAddressError(true)
    errors=true
  }

  if(isEmail(emailValue.current.value)){
    setEmailError(false)
  }else{
    setEmailError(true)
    setFixErrors(true)
    errors=true
  }

if (errors){
  setFixErrors(true)
}else{
  setFixErrors(false)
}

  if(!errors){
      setFormSubmitted(!formSubmitted)
      var d = new Date();
      var n = d.getTime();
      var leadId=mongoose.Types.ObjectId()
      leadId=leadId.toString()

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
          let groupId="Performers"
          let groupTitle="Performers"

          if(sendNotif){
            socket.emit("Input Chat Message", {
              chatMessage,
              userId,
              userName,
              nowTime,
              type,
              groupId,
              groupTitle});
            }
          }

          console.log(newLead)
          const options={
            method: "POST",
            body: JSON.stringify(newLead),
            headers: {
              "Content-type": "application/json; charset=UTF-8"}}


              await fetch("/leads/createlead/"+leadId, options)
              .then(response => response.json()).then(json => console.log(json));

              sendLeadEmailNotification(newLead)

              titleValue.current.value=""
              descriptionValue.current.value=""
              locationValue.current.value=""
              customerNameValue.current.value=""
              timeValue.current.value=""
              durationValue.current.value=""
              emailValue.current.value=""
              phoneValue.current.value=""
  }
        }


        return (
          <>
          {!props.updateLeads&&<button style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Booking Request Form?</button>}
          {props.updateLeads&&<button style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Create Lead Form?</button>}

          <div className='form' style={{width:"88vw",borderRadius:(props.homepage?"10px":"0px"),maxHeight:!viewForm?"0":"1000vh",overflow:"hidden",transition:"max-height 2s"}}>
          <form style={{display:(!formSubmitted?"block":"none")}}>
          <div className="eventformbox">
          <label htmlFor='name'>Event Title</label>
          <input
          className="leadforminput"
          style={{borderRadius:(props.homepage?"10px":"0px"),width:"85vw"}}
          type='text'
          name='titleValue'
          id='titleValue'
          ref={titleValue}
          />
          </div>

          <div className="eventformbox">
          <label htmlFor='name'>What is your name or the customer's name?</label>
          <input
          className="leadforminput"
          style={{borderRadius:(props.homepage?"10px":"0px"),width:"85vw"}}
          type='text'
          name='customerNameValue'
          id='customerNameValue'
          ref={customerNameValue}
          />
          </div>


          <div className="eventformbox">
          <label htmlFor='name'>Briefly describe your event or the customers event and the sort of entertainment you are looking for</label>
          <input
          className="leadforminput"
          style={{borderRadius:(props.homepage?"10px":"0px"),width:"85vw"}}
          type='text'
          name='descriptionValue'
          id='descriptionValue'
          ref={descriptionValue}
          />
          </div>
          <div className="eventformbox">
          <label htmlFor='name'>Where is it? (All these details can be approximate, but specific is better) <sub>Required</sub></label>
          <input
          className="leadforminput"
          type='text'
          style={{borderRadius:(props.homepage?"10px":"0px"),width:"85vw"}}
          name='locationValue'
          id='locationValue'
          ref={locationValue}
          />
          {addressError&&<p style={{color:"red"}}>Not a valid location</p>}
          </div>
          <div className="eventformbox">
          <label htmlFor='name'>When is it?</label>
          <input
          className="leadforminput"
          type='text'
          style={{borderRadius:(props.homepage?"10px":"0px"),width:"85vw"}}
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
          style={{borderRadius:(props.homepage?"10px":"0px"),width:"85vw"}}
          name='durationValue'
          id='durationValue'
          ref={durationValue}
          />
          </div>
          <div className="eventformbox">
          <label htmlFor='name'>Email? <sub>Required</sub></label>
          <input
          className="leadforminput"
          type='text'
          style={{borderRadius:(props.homepage?"10px":"0px"),width:"85vw"}}
          name='emailValue'
          id='emailValue'
          ref={emailValue}
          />
          {emailError&&<p style={{color:"red"}}>Not a valid email</p>}
          </div>
          <div className="eventformbox">
          <label htmlFor='name'>Phone? <sub>Required</sub></label>
          <input
          className="leadforminput"
          type='text'
          style={{borderRadius:(props.homepage?"10px":"0px"),width:"85vw"}}
          name='phoneValue'
          id='phoneValue'
          ref={phoneValue}
          />
          {phoneError&&<p style={{color:"red"}}>Not a valid Australian phone number</p>}
          </div>

          <button onClick={(e) => handleSubmit(e)}>Submit booking request</button>
          {fixErrors&&<p style={{color:"red"}}>Please fix errors and fill mandatory fields</p>}
          </form>
          {formSubmitted&&(<>
            <h2>Thankyou for your interest in our services</h2>
            <button style={{height:"3vw"}} onClick={(e) => sendAnother(e)}>Submit another booking request</button>
            </>)}
            </div>
            <br/>
            </>
          )}
