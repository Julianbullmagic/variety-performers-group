import React, {useRef,useState,useEffect} from 'react'
import auth from '../auth/auth-helper'
import io from "socket.io-client";
import isEmail from 'validator/lib/isEmail';
const mongoose = require("mongoose");

export default function CreateLeadForm(props) {
  const [users, setUsers] = useState(props.users);
  const [viewForm, setViewForm] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [phoneError, setPhoneError] = useState(false);
  const [addressError, setAddressError] = useState(false);
  const [fixErrors, setFixErrors] = useState(false);
  const [sendNotif,setSendNotif] = useState(props.sendnotif)
  const titleValue = useRef('')
  const descriptionValue = useRef('')
  const locationValue = useRef('')
  const timeValue = useRef('')
  const durationValue = useRef('')
  const customerNameValue = useRef('')
  const emailValue = useRef('')
  const phoneValue = useRef('')
  const [formSubmitted, setFormSubmitted] = useState(false);
  let server = "http://localhost:5000";
  let socket
  if(sendNotif){
  if(process.env.NODE_ENV==="production"){
    socket=io();
  }
  if(process.env.NODE_ENV==="development"){
    socket=io(server);
  }
}

  function sendAnother(e){
    setFormSubmitted(!formSubmitted)
  }

  useEffect(() => {
    setUsers(props.users)
    if(props.sendnotif){
      console.log("send notif",props.sendnotif)
      setSendNotif(props.sendnotif)
    }
  },[props])

  function handleGenreChange(event){
    console.log(event.target.value)
    setGenre(event.target.value)
  }

  function sendLeadEmailNotification(item){
    console.log("sending Lead notification",props.users,item.genres)
    let userscopy=JSON.parse(JSON.stringify(props.users))
    console.log(userscopy.length)
    userscopy=userscopy.filter(user=>user.leads)
    console.log(userscopy)

    userscopy=userscopy.filter(user=>item.genres.includes(user.jobtitle.toLowerCase()))
    console.log(userscopy)
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
  var phoneExpression = /^[0-9]+$/

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
          genres:genres,
          location:locationValue.current.value,
          coordinates:coordinates,
          views:[],
          time:timeValue.current.value,
          duration:durationValue.current.value,
          phone:phoneValue.current.value,
          email:emailValue.current.value,
          timecreated:n,
        }

        if(props.updateLeads){
          props.updateLeads(newLead)

          if(!props.homepage){

          }
          let chatMessage=`created an gig lead called ${titleValue.current.value} visit https://variety-performers-group.herokuapp.com to see details`
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

              setGenres([])
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

        function addGenre(e){
          e.preventDefault()
          let genrescopy=[...genres]
          if (!genres.includes(genre)){
            genrescopy.push(genre)
          }
          setGenres(genrescopy)
        }
        function removeGenre(e,item){
          e.preventDefault()
          console.log(item)
          let filteredgenres=[]
          for (let genre of genres){
            if(!(genre===item)){
              filteredgenres.push(genre)
            }
          }
          console.log(filteredgenres)
          setGenres(filteredgenres)
        }

        let genreoptions=[]
        if (users){
          for (let user of users){
            if (!genreoptions.includes(user.jobtitle.toLowerCase())){
              genreoptions.push(...user.jobtitle.toLowerCase().split(","))
            }
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
          <label htmlFor='name'>What kind of performance are you looking for? Press button to add. You can add several.</label>
          <select style={{width:"40vw"}} id="restriction" onChange={(e) => handleGenreChange(e)}>
          <option value="all">all</option>
          {genreoptions&&genreoptions.map(item=><option key={item} value={item}>{item}</option>)}
          </select>
          <button onClick={(e) => addGenre(e)}>Add performance type</button>
          {genres&&genres.map(item=><div key={item}><h5 style={{display:"inline",marginLeft:"2vw"}}>{item}</h5><button style={{display:"inline"}} onClick={(e) => removeGenre(e,item)}>Remove</button></div>)}
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
            {!sendNotif&&<br/>}
            </>
          )}
