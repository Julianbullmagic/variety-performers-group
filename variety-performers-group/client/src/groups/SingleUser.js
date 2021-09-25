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
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      {user&&
      <>
      <h1>{user.name}</h1>
      <h3>{user.website}</h3>
      <h3>{user.youtube}</h3>
      <h3>{user.expertise}</h3>
      <h3>{user.performancedescription}</h3>
      <h3>{user.rates}</h3>
      <AwesomeSlider style={{width:"60vw",position: "static",  zIndex: -1}}>
      {user.images&&user.images.map(item=>{return (<div><Image style={{width:"100%"}} cloudName="julianbullmagic" publicId={item} /></div>)})}
      </AwesomeSlider>
      <AwesomeSlider style={{width:"60vw",position: "static",  zIndex: -1}}>
      {user.promovideos&&user.promovideos.map(item=>{return (<div><iframe style={{width:"100%"}} src={item}/></div>)})}
      </AwesomeSlider>
      </>}


      {(auth.isAuthenticated().user._id==match.params.userId)&&<>
        <div style={{position: "static"}}>
        <CardContent>
          <Typography id="title" variant="h6">
            Edit Listing
          </Typography>
          <TextField id="name" placeHolder={user.name} label="Name"value={values.name} onChange={handleChange('name')} margin="normal"/><br/>
          <TextField id="email" placeHolder={user.email} type="email" label="Email"  value={values.email} onChange={handleChange('email')} margin="normal"/><br/>
          <TextField id="website" placeHolder={user.website} type="website" label="website" value={values.website} onChange={handleChange('website')} margin="normal"/><br/>
          <TextField id="youtube" placeHolder={user.youtube} type="youtube" label="youtube" value={values.youtube} onChange={handleChange('youtube')} margin="normal"/><br/>
          <TextField id="promovideos" placeHolder={user.promovideos} type="promovideos" label="promotional videos, please add youtube url links separated by a comma" value={values.promovideos} onChange={handleChange('promovideos')} margin="normal"/><br/>
          <TextField id="expertise" placeHolder={user.expertise} type="expertise" label="expertise" value={values.expertise} onChange={handleChange('expertise')} margin="normal"/><br/>
          <TextField id="password" placeHolder={user.password} type="password" label="Password" value={values.password} onChange={handleChange('password')} margin="normal"/><br/>
          <TextField id="performancedescription" placeHolder={user.performancedescription} type="performancedescription" label="Performance Description" value={values.performancedescription} onChange={handleChange('performancedescription')} margin="normal"/><br/>
          <TextField id="rates" placeHolder={user.rates} type="rates" label="Rates" value={values.rates} onChange={handleChange('rates')} margin="normal"/>

          <input id="file" type="file" ref={selectedFile1}/>
          <input id="file2" type="file" ref={selectedFile2}/>
          <input id="file3" type="file" ref={selectedFile3}/>
          <input id="file4" type="file" ref={selectedFile4}/>
          <input id="file5" type="file" ref={selectedFile5}/>

        </CardContent>
        <CardActions>
        <button id="submit" onClick={clickSubmit}>Submit</button>
        </CardActions>
        </div>
        </>}

      <ChatPage/>
</>
    )
}
