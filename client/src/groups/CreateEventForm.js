import React, {useRef,useState} from 'react'
import auth from '../auth/auth-helper'
import Axios from 'axios'
const mongoose = require("mongoose");


export default function CreateEventForm(props) {
  const [viewForm, setViewForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coordError, setCoordError] = useState(false);
  const titleValue = useRef('')
  const descriptionValue = useRef('')
  const locationValue = useRef('')
  const startTimeValue = useRef(0)
  const endTimeValue = useRef(0)
  const selectedFile1 = useRef(null)

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
        console.log(data)
        return data['features'][0]['center']
      })
      .catch(err => {
        console.error(err);
      })



      if(!coords){
        setCoordError(true)
      }else{
        setCoordError(false)
      }


      if(coords){
        let imageids=[]
        if(selectedFile1.current.files[0]){
          const formData = new FormData();
          formData.append('file', selectedFile1.current.files[0]);
          formData.append("upload_preset", "jvm6p9qv");
          await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
          .then(response => {
            console.log(response.data.public_id)
            imageids.push(response.data.public_id)
          })
          .catch(err => {
            console.error(err);
          })
        }

        const newEvent={
          _id:eventId,
          title: titleValue.current.value,
          groupIds:[props.groupId],
          starttime:String(startTimeValue.current.value),
          endtime:String(endTimeValue.current.value),
          description:descriptionValue.current.value,
          createdby:auth.isAuthenticated().user._id,
          location:locationValue.current.value,
          coordinates:[coords[1],coords[0]],
          notificationsent:false,
          approvalnotificationsent:false,
          images:imageids,
          timecreated:n,
          approval:[auth.isAuthenticated().user._id]
        }
        var newEventToRender=JSON.parse(JSON.stringify(newEvent))

        newEventToRender.createdby=auth.isAuthenticated().user
        console.log("new event",newEventToRender)

          props.updateEvents(newEventToRender)

          const options={
            method: "POST",
            body: JSON.stringify(newEvent),
            headers: {
              "Content-type": "application/json; charset=UTF-8"}}


              await fetch("/events/createevent/"+eventId, options)
              .then(response => response.json()).then(json => console.log(json))
                .then(res=>console.log(res))
                .catch(err => {
                  console.error(err);
                })
              }
              setUploading(false)
            }

            return (
              <>
              <button className="formbutton" style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Create Event Form?</button>
              <div className='form' style={{maxHeight:!viewForm?"0":"1000vh",overflow:"hidden",transition:"max-height 2s"}}>
              <form>
              <div className="eventformbox">
              <label style={{display:"block"}} htmlFor='name'>Title</label>
              <input
              className="posttextarea"
              style={{width:"80vw"}}
              type='text'
              name='titleValue'
              id='titleValue'
              ref={titleValue}
              />
              </div>
              <div className="eventformbox">
              <label htmlFor='name'>Description</label>
              <input
              className="posttextarea"
              style={{width:"80vw"}}
              type='text'
              name='descriptionValue'
              id='descriptionValue'
              ref={descriptionValue}
              />
              </div>
              <div className="eventformbox">
              <label htmlFor='name'>Location</label>
              <input
              className="posttextarea"
              type='text'
              name='locationValue'
              style={{width:"80vw"}}
              id='locationValue'
              ref={locationValue}
              />
              {coordError&&<p style={{color:"red"}}>Not a valid location</p>}
              <label htmlFor='name'>Start Time</label>
              <input
              className="posttextarea"
              type='datetime-local'
              name='startTimValue'
              style={{width:"80vw",overflow:"hidden"}}
              id='startTimeValue'
              ref={startTimeValue}
              />
              <label htmlFor='name'>End Time</label>
              <input
              className="posttextarea"
              type='datetime-local'
              name='endTimeValue'
              style={{width:"80vw",overflow:"hidden"}}
              id='endTimeValue'
              ref={endTimeValue}
              />
              </div>
              <div className="eventformbox">
              <label htmlFor='name'>Image</label>

              <input id="file" type="file" ref={selectedFile1}/>
              </div>
              {!uploading&&<button className="formsubmitbutton" onClick={(e) => handleSubmit(e)}>Submit Event?</button>}
              {uploading&&<h3>uploading!!!!!</h3>}
              </form>
              </div>

              </>
            )}
