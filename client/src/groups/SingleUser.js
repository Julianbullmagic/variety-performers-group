import React, { useState, useEffect, useRef} from 'react'
import {Redirect, Link} from 'react-router-dom'
import ChatPage from "./../ChatPage/ChatPage"
import {Image} from 'cloudinary-react'
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import auth from './../auth/auth-helper'
import io from "socket.io-client";
import Axios from 'axios'
const mongoose = require("mongoose");




export default function SingleUser({ match }) {
  const [user, setUser] = useState({})
  const [numImages, setNumImages] = useState([0]);
  const jwt = auth.isAuthenticated()
  const [values, setValues] = useState({
    name: '',
    password: '',
    email: '',
    expertise:'',
    performancedescription:'',
    rates:'',
    images:'',
    error:'',
    open: false,
  })
  const selectedFile1 = React.useRef(null)
  const selectedFile2 = React.useRef(null)
  const selectedFile3 = React.useRef(null)
  const selectedFile4 = React.useRef(null)
  const selectedFile5 = React.useRef(null)
  let server = "http://localhost:5000";
  let socket = io(server);

  useEffect(() => {
    getUser()
  }, [])

  function extraImage(e){
    e.preventDefault()
    let imagenum=numImages
    console.log(imagenum)
    if(imagenum.length<5){
    imagenum.push(0)
    }
    console.log("after push",imagenum)
    setNumImages([...imagenum])
  }

  function lessImage(e){
    e.preventDefault()
    console.log(imagenum)
    let imagenum=numImages
    if(imagenum.length>0){
    imagenum.pop()
    }
    console.log(imagenum)
    setNumImages([...imagenum])
  }


  async function getUser(){
    await fetch(`/groups/getuser/`+match.params.userId)
        .then(response => response.json())
        .then(data=>{
          console.log("user",data.data)
          setUser(data.data)
        })
  }



  async function updateUser(){

    let imageids=[]
    console.log(selectedFile1.current.files[0],selectedFile2.current.files[0],
      selectedFile3.current.files[0],selectedFile4.current.files[0],selectedFile5.current.files[0])
  if(selectedFile1.current.files[0]){
    const formData = new FormData();
  formData.append('file', selectedFile1.current.files[0]);
  formData.append("upload_preset", "jvm6p9qv");
  await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
  .then(response => {
    console.log("cloudinary response",response)
    imageids.push(response.data.public_id)
  })}

  if(selectedFile2.current.files[0]){const formData = new FormData();
  formData.append('file', selectedFile2.current.files[0]);
  formData.append("upload_preset", "jvm6p9qv");
  await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
  .then(response => {
    console.log("cloudinary response",response)
    imageids.push(response.data.public_id)
  })}

  if(selectedFile3.current.files[0]){const formData = new FormData();
  formData.append('file', selectedFile3.current.files[0]);
  formData.append("upload_preset", "jvm6p9qv");
  await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
  .then(response => {
    console.log("cloudinary response",response)
    imageids.push(response.data.public_id)
  })}

  if(selectedFile4.current.files[0]){const formData = new FormData();
  formData.append('file', selectedFile4.current.files[0]);
  formData.append("upload_preset", "jvm6p9qv");
  await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
  .then(response => {
    console.log("cloudinary response",response)
    imageids.push(response.data.public_id)
  })}

  if(selectedFile5.current.files[0]){const formData = new FormData();
  formData.append('file', selectedFile5.current.files[0]);
  formData.append("upload_preset", "jvm6p9qv");
  await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
  .then(response => {
    console.log("cloudinary response",response)
    imageids.push(response.data.public_id)
  })}

  console.log("imageids",imageids)
let youtubevids=values.promovideos.split(",")
youtubevids=youtubevids.map(item=>{
  let x=item.split("=")
  console.log(x)
  return (
    x[1]
)})

youtubevids=youtubevids.map(item=>{
  return(
    "https://www.youtube.com/embed/"+item
  )
})
console.log(youtubevids)

    const newuser = {
      _id:match.params.userId,
      name: values.name || undefined,
      email: values.email || undefined,
      website: values.website||undefined,
      youtube: values.youtube||undefined,
      promovideos: youtubevids||undefined,
      performancedescription:values.performancedescription||undefined,
      expertise: values.expertise || undefined,
      rates:values.rates || undefined,
      images:imageids,
      password: values.password || undefined
    }
    console.log(user)
setUser(newuser)

    const options={
        method: "PUT",
        body: JSON.stringify(newuser),
        headers: {
            "Content-type": "application/json; charset=UTF-8"}}


      await fetch("/groups/updateuser/"+match.params.userId, options)
              .then(response => response.json()).then(json => console.log(json));
  }


    const handleChange = name => event => {
      setValues({ ...values, [name]: event.target.value })
    }

    const clickSubmit = (e) => {
          updateUser()
    }

    return (
      <>
      {user&&(
      <div className="signupform">
      <div style={{position: "relative",  zIndex: -2}} className="innersignupform">
      <h1 style={{textAlign:"center"}}><strong>Name:</strong> {user.name}</h1>
      <h3 style={{textAlign:"center"}}><strong>Website:</strong> {user.website}</h3>
      <h3 style={{textAlign:"center"}}><strong>Youtube Channel:</strong> {user.youtube}</h3>
      <h3 style={{textAlign:"center"}}><strong>Expertise:</strong> {user.expertise}</h3>
      <h3 style={{textAlign:"center",}}><strong>Performance Description:</strong> {user.performancedescription}</h3>
      <h3 style={{textAlign:"center"}}><strong>Rates:</strong> {user.rates}</h3>
      <br/>
      <h3 style={{textAlign:"center"}}>Images</h3>
      <AwesomeSlider style={{marginLeft:"20%",width:"60%",position: "relative",  zIndex: -1}}>
      {user.images&&user.images.map(item=>{return (<div><Image style={{width:"100%"}} cloudName="julianbullmagic" publicId={item} /></div>)})}
      </AwesomeSlider>
      <br/>
      <br/>
      <h3 style={{textAlign:"center"}}><strong>Youtube Videos</strong></h3>
      <AwesomeSlider style={{marginLeft:"20%",width:"60%",position: "relative",  zIndex: -1}}>
      {user.promovideos&&user.promovideos.map(item=>{return (<div><iframe style={{width:"100%"}} src={item}/></div>)})}
      </AwesomeSlider>
      <br/>
      <br/>
      </div>
      </div>)}


      {(auth.isAuthenticated().user._id==match.params.userId)&&(
        <div className="signupform">
        <div className="innersignupform">
          <h1 style={{textAlign:"center"}}>
            Edit Listing
          </h1>
          <div className="signininput">
          <h5 style={{marginRight:"1vw"}} className="ruletext">Name </h5><input id="name" placeHolder={user.name} label="Name"value={values.name} onChange={handleChange('name')} margin="normal"/>
          </div>

          <div className="signininput">
          <h5 style={{marginRight:"1vw"}} className="ruletext">Email </h5><input id="email" placeHolder={user.email} type="email" label="Email"  value={values.email} onChange={handleChange('email')} margin="normal"/>
          </div>

          <div className="signininput">
          <h5 style={{marginRight:"1vw"}} className="ruletext">Website </h5><input id="website" placeHolder={user.website} type="website" label="website" value={values.website} onChange={handleChange('website')} margin="normal"/>
          </div>

          <div className="signininput">
          <h5 style={{marginRight:"1vw"}} className="ruletext">Youtube Channel </h5><input id="youtube" placeHolder={user.youtube} type="youtube" label="youtube" value={values.youtube} onChange={handleChange('youtube')} margin="normal"/>
          </div>

          <div className="signininput">
          <h5 style={{marginRight:"1vw"}} className="ruletext">Promotional Youtube Videos </h5><input id="promovideos" placeHolder={user.promovideos} type="promovideos" label="promotional videos, please add youtube url links separated by a comma" value={values.promovideos} onChange={handleChange('promovideos')} margin="normal"/>
          </div>

          <div className="signininput">
          <h5 className="ruletext">Expertise </h5><input id="expertise" placeHolder={user.expertise} type="expertise" label="expertise" value={values.expertise} onChange={handleChange('expertise')} margin="normal"/>
          </div>

          <div className="signininput">
          <h5 style={{marginRight:"1vw"}} className="ruletext">Password </h5><input id="password" placeHolder={user.password} type="password" label="Password" value={values.password} onChange={handleChange('password')} margin="normal"/>
          </div>

          <div className="signininput">
          <h5 style={{marginRight:"1vw"}} className="ruletext">Performance Description </h5><input id="performancedescription" placeHolder={user.performancedescription} type="performancedescription" label="Performance Description" value={values.performancedescription} onChange={handleChange('performancedescription')} margin="normal"/>
          </div>

          <div className="signininput" style={{display:((numImages.length>=4)?"block":"none")}}>
          <h5 style={{marginRight:"1vw"}} className="ruletext">Rates </h5><input id="rates" placeHolder={user.rates} type="rates" label="Rates" value={values.rates} onChange={handleChange('rates')} margin="normal"/>
          </div>

          <div className="signininput" style={{display:((numImages.length>=4)?"block":"none")}}>
          <input style={{width:"100%"}} id="file" type="file" ref={selectedFile1}/>
          </div>

          <div className="signininput" style={{display:((numImages.length>=4)?"block":"none")}}>
          <input style={{width:"100%"}} id="file2" type="file" ref={selectedFile2}/>
          </div>

          <div className="signininput" style={{display:((numImages.length>=4)?"block":"none")}}>
          <input style={{width:"100%"}} id="file3" type="file" ref={selectedFile3}/>
          </div>

          <div className="signininput" style={{display:((numImages.length>=4)?"block":"none")}}>
          <input style={{width:"100%"}} id="file4" type="file" ref={selectedFile4}/>
          <p>Max 5 images</p>
          </div>

          <div className="signininput" style={{display:((numImages.length>=4)?"block":"none")}}>
          <input style={{width:"100%"}} id="file5" type="file" ref={selectedFile5}/>
          </div>
          <button style={{marginLeft:"30%"}} onClick={(e) => extraImage(e)}>Add Extra Image</button>
          <button onClick={(e) => lessImage(e)}>One Less Image</button>
          <button id="submit" onClick={clickSubmit}>Submit</button>
        </div>
        </div>
        )}

      <ChatPage/>
     </>
    )
}
