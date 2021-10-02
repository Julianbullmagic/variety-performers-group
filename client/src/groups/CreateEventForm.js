import React, {useRef,useState} from 'react'
import auth from '../auth/auth-helper'
import Axios from 'axios'
import io from "socket.io-client";
const mongoose = require("mongoose");


export default function CreateEventForm(props) {
  const [viewForm, setViewForm] = useState(false);
  const [uploading, setUploading] = useState(false);
const titleValue = React.useRef('')
const descriptionValue = React.useRef('')
const locationValue = React.useRef('')
const selectedFile1 = React.useRef(null)
const [toggle, setToggle] = useState(false);
const [numberOfImages, setNumberOfImages]=useState(1)
let server = "http://localhost:5000";
let socket = io(server);

function addImages(){
  var numberplusone=numberOfImages+1

  setNumberOfImages(numberplusone)
}

function lessImages(){
  var numberminusone=numberOfImages-1


  setNumberOfImages(numberminusone);

}


async function handleSubmit(e) {

e.preventDefault()
setUploading(true)
    var d = new Date();
    var n = d.getTime();
    var eventId=mongoose.Types.ObjectId()
    eventId=eventId.toString()


    let coords=await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationValue.current.value}.json?access_token=pk.eyJ1IjoianVsaWFuYnVsbCIsImEiOiJja25zbXJibW0wNHgwMnZsaHJoaDV6MTg4In0.qPBGW4XMJcsZSUCrQej8Zw`)
                      .then(response => response.json())
                        .then(data =>{
                          console.log("DATA",locationValue.current.value,data['features'][0])
                          return data['features'][0]['center']
                        })

                        let imageids=[]
                        console.log(selectedFile1.current.files[0])
                      if(selectedFile1.current.files[0]){
                        const formData = new FormData();
                      formData.append('file', selectedFile1.current.files[0]);
                      formData.append("upload_preset", "jvm6p9qv");
                      await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
                      .then(response => {
                        console.log("cloudinary response",response)
                        imageids.push(response.data.public_id)
                      })}

                      console.log("imageids",imageids)



    const newEvent={
      _id:eventId,
      title: titleValue.current.value,
      description:descriptionValue.current.value,
      createdby:auth.isAuthenticated().user._id,
      location:locationValue.current.value,
      coordinates:[coords[1],coords[0]],
      images:imageids,
      timecreated:n,
      approval:[auth.isAuthenticated().user._id]
        }

        var newEventToRender=JSON.parse(JSON.stringify(newEvent))

        newEventToRender.createdby=auth.isAuthenticated().user

console.log("newEventToRender",newEventToRender)

        var d = new Date();
        var n = d.getTime();


        let chatMessage=`created an event called ${titleValue.current.value}`
        let userId=auth.isAuthenticated().user._id
        let userName=auth.isAuthenticated().user.name
        let nowTime=n
        let type="text"
console.log("INPUT CHAT",chatMessage,
userId,
userName,
nowTime,
type)
        socket.emit("Input Chat Message", {
          chatMessage,
          userId,
          userName,
          nowTime,
          type});

console.log("new event",newEvent)
    props.updateEvents(newEventToRender)
    console.log(newEvent)
    const options={
        method: "POST",
        body: JSON.stringify(newEvent),
        headers: {
            "Content-type": "application/json; charset=UTF-8"}}


      await fetch("/events/createevent/"+eventId, options)
              .then(response => response.json()).then(json => {
                setUploading(false)
                console.log(json)});


  }




  return (
    <>
    <button style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Create Event Form?</button>
    <div className='form' style={{maxHeight:!viewForm?"0":"100vw",overflow:"hidden",transition:"max-height 2s"}}>
      <form>
      <div className="eventformbox">
        <label style={{display:"block"}} htmlFor='name'>Title</label>
        <input
          type='text'
          name='titleValue'
          id='titleValue'
          ref={titleValue}
        />
</div>
<div className="eventformbox">
        <label htmlFor='name'>Description</label>
        <input
          type='text'
          name='descriptionValue'
          id='descriptionValue'
          ref={descriptionValue}
        />
</div>
<div className="eventformbox">
        <label htmlFor='name'>Location</label>
        <input
          type='text'
          name='locationValue'
          id='locationValue'
          ref={locationValue}
        />
</div>
<div className="eventformbox">
<label htmlFor='name'>Image</label>

        <input id="file" type="file" ref={selectedFile1}/>
</div>
        {!uploading&&<button onClick={(e) => handleSubmit(e)}>Submit Event?</button>}
        {uploading&&<h3>uploading!!!!!</h3>}
      </form>
      </div>

      </>
  )}
