import React, {useState,useRef,useEffect} from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import {create} from './api-user.js'
import {Link} from 'react-router-dom'
import auth from './../auth/auth-helper'
import {Image} from 'cloudinary-react'
import io from "socket.io-client";
import Axios from 'axios'
const mongoose = require("mongoose");


const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
  },
  error: {
    verticalAlign: 'middle'
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },

}))

export default function Signup (){
  const classes = useStyles()
  const [numImages, setNumImages] = useState([0]);
  const [values, setValues] = useState({
    name: '',
    password: '',
    email: '',
    expertise:'',
    website:'',
    youtube:'',
    promovideos:'',
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


  useEffect(()=>{
    console.log("use EFFECT",numImages)
  },[numImages,setNumImages])

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

  async function createUser(){
    var userId=mongoose.Types.ObjectId()

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


    const user = {
      _id:userId,
      name: values.name || undefined,
      email: values.email || undefined,
      website: values.website||undefined,
      youtube: values.youtube||undefined,
      promovideos: values.promovideos||undefined,
      performancedescription:values.performancedescription||undefined,
      expertise: values.expertise || undefined,
      rates:values.rates || undefined,
      images:imageids,
      password: values.password || undefined
    }
    console.log(user)
    create(user).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error})
      } else {
        setValues({ ...values, error: '', open: true})
      }
    })
  }


    const handleChange = name => event => {
      setValues({ ...values, [name]: event.target.value })
    }

    const clickSubmit = (e) => {
          createUser()
    }

    return (
        <div className="signupform">
        <div className="innersignupform">
          <h4 style={{textAlign:"center"}}>
            Sign Up
          </h4>
          <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Name </h5><input id="name" placeHolder={values.name} label="Name" value={values.name} onChange={handleChange('name')} margin="normal"/></div>
          <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Email </h5><input id="email" placeHolder={values.email} type="email" label="Email" value={values.email} onChange={handleChange('email')} margin="normal"/></div>
          <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Website </h5><input id="website" placeHolder={values.website} type="website" label="website" value={values.website} onChange={handleChange('website')} margin="normal"/></div>
          <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Youtube Channel </h5><input id="youtube" placeHolder={values.youtube} type="youtube" label="youtube" value={values.youtube} onChange={handleChange('youtube')} margin="normal"/></div>
          <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Promo Videos, separate youtube video link urls with a comma </h5><input id="promovideos" placeHolder={values.promovideos} type="promovideos" label="promotional videos, please add youtube url links separated by a comma" value={values.promovideos} onChange={handleChange('promovideos')} margin="normal"/></div>
          <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Expertise </h5><input id="expertise" type="expertise" placeHolder={values.expertise} label="expertise" value={values.expertise} onChange={handleChange('expertise')} margin="normal"/></div>
          <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Password </h5><input id="password" type="password" placeHolder={values.password} label="Password" value={values.password} onChange={handleChange('password')} margin="normal"/></div>
          <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Performance Description </h5><input id="performancedescription" placeHolder={values.performancedescription} type="performancedescription" label="Performance Description"  value={values.performancedescription} onChange={handleChange('performancedescription')} margin="normal"/></div>
          <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Rates, if you have several different services you may put a variety of different rates </h5><input id="rates" placeHolder={values.rates} type="rates" label="Rates"  value={values.rates} onChange={handleChange('rates')} margin="normal"/></div>

          <h5 className="ruletext">  Images </h5>
          <div style={{display:((numImages.length>=1)?"block":"none")}}  className="eventformbox ruletext">
          <input style={{width:"90%"}} id="file" type="file" ref={selectedFile1}/>
          </div>

          <div style={{display:((numImages.length>=2)?"block":"none")}} className="eventformbox ruletext">
          <input style={{width:"90%"}} id="file" type="file" ref={selectedFile2}/>
          </div>

          <div style={{display:((numImages.length>=3)?"block":"none")}}  className="eventformbox ruletext">
          <input style={{width:"90%"}} id="file" type="file" ref={selectedFile3}/>
          </div>

          <div style={{display:((numImages.length>=4)?"block":"none")}}  className="eventformbox ruletext">
          <input style={{width:"90%"}} id="file" type="file" ref={selectedFile4}/>
          </div>

          <div style={{display:((numImages.length>=5)?"block":"none")}}  className="eventformbox ruletext">
          <input style={{width:"90%"}} id="file" type="file" ref={selectedFile5}/>
          <p>Max 5 images</p>
          </div>
          <button style={{marginLeft:"30%"}} onClick={(e) => extraImage(e)}>Add Extra Image</button>
          <button onClick={(e) => lessImage(e)}>One Less Image</button>
          <button id="submit" onClick={clickSubmit}>Submit</button>
          <br/> {
            values.error && (<Typography component="p" color="error">
              <Icon color="error" className={classes.error}>error</Icon>
              {values.error}</Typography>)
          }
        </div>
        <Dialog open={values.open} disableBackdropClick={true}>
          <DialogTitle>New Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              New account successfully created.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Link to="/signin">
              <Button color="primary" autoFocus="autoFocus" variant="contained">
                Sign In
              </Button>
            </Link>
          </DialogActions>
        </Dialog>
        </div>
    )
}
