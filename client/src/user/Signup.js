import React, {useState,useRef} from 'react'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import {create} from './api-user.js'
import {Link} from 'react-router-dom'
import Axios from 'axios'
import validator from 'validator';
const mongoose = require("mongoose");

export default function Signup (){
  const [numImages, setNumImages] = useState([0]);
  const [loading,setLoading]=useState(false);
  const [websiteError,setWebsiteError]=useState(false);
  const [youtubeChannelError,setYoutubeChannelError]=useState(false);
  const [emailError,setEmailError]=useState(false);
  const [phoneError,setPhoneError]=useState(false);
  const [fixErrors,setFixErrors]=useState(false)
  const [values, setValues] = useState({
    name: '',
    jobtitle:'',
    password: '',
    passwordtwo:'',
    passworderror:false,
    email: '',
    phone:'',
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
  const selectedFile1 = useRef(null)
  const selectedFile2 = useRef(null)
  const selectedFile3 = useRef(null)
  const selectedFile4 = useRef(null)
  const selectedFile5 = useRef(null)


  function extraImage(e){
    e.preventDefault()
    let imagenum=numImages
    console.log(imagenum)
    if(imagenum.length<5){
      imagenum.push(0)
    }
    setNumImages([...imagenum])
  }

  function lessImage(e){
    e.preventDefault()
    let imagenum=numImages
    if(imagenum.length>0){
      imagenum.pop()
    }
    setNumImages([...imagenum])
  }

function changer(){
  let errors=false

  if(values.youtube!==""){
    if(validator.isURL(values.youtube)&&values.youtube.includes("youtube")){
      setYoutubeChannelError(false)
    }else{
      setYoutubeChannelError(true)
      setFixErrors(true)
      errors=true
    }
  }

if(values.website!==""){
  if(validator.isURL(values.website)){
    setWebsiteError(false)
  }else{
    setWebsiteError(true)
    setFixErrors(true)
    errors=true
  }
}


  if(!(values.password===values.passwordtwo)){
    setValues({ ...values, passworderror:true})
  }
  let notallyoutub=false

if(values.promovideos!==""){
  let youtubevids=values.promovideos.split(",")
  for (let vid of youtubevids){
    if (!vid.includes("youtube")){
      notallyoutub=true
      errors=true
    }
  }
}
  if(notallyoutub){
    setValues({ ...values, passworderror:true})
  }

  if (errors){
    setFixErrors(true)
  }else{
    setFixErrors(false)
  }
  console.log(values.passworderror)
}


  async function createUser(){
    var errors=false
    var notallyoutub=false

    if(values.youtube!==""){
      if(validator.isURL(values.youtube)&&values.youtube.includes("youtube")){
        setYoutubeChannelError(false)
      }else{
        setYoutubeChannelError(true)
        setFixErrors(true)
        errors=true
      }
    }

  if(values.website!==""){
    if(validator.isURL(values.website)){
      setWebsiteError(false)
    }else{
      setWebsiteError(true)
      setFixErrors(true)
      errors=true
    }
  }

    if(!(values.password===values.passwordtwo)){
      setValues({ ...values, passworderror:true})
    }

  if(values.promovideos!==""){
    let youtubevids=values.promovideos.split(",")
    for (let vid of youtubevids){
      if (!vid.includes("youtube")){
        notallyoutub=true
        errors=true
      }
    }
  }




      if((values.password===values.passwordtwo)&&!notallyoutub){
        setValues({ ...values, passworderror:false})
        setLoading(true)
        var userId=mongoose.Types.ObjectId()
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
                        jobtitle: values.jobtitle || undefined,
                        name: values.name || undefined,
                        phone: values.phone || undefined,
                        email: values.email || undefined,
                        website: values.website||undefined,
                        youtube: values.youtube||undefined,
                        promovideos:  youtubevids||undefined,
                        approvedmember:false,
                        approval:[],
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

                      setLoading(false)
                    }
                  }



                const handleChange = name => event => {
                  setValues({ ...values, [name]: event.target.value })
                }

                const clickSubmit = (e) => {
                  createUser()
                }

                let youtubevideos=values.promovideos.split(",")
                let notallyoutube=false
                for (let vid of youtubevideos){
                  if (!vid.includes("youtube")){
                    notallyoutube=true
                  }
                }

                return (


                  <div className="signupform" style={{marginTop:"6vh"}}>
                  <h2  className="innersignupform" style={{display:(loading?"block":"none")}}>Uploading profile, please wait...</h2>
                  <div className="innersignupform" style={{display:(!loading?"block":"none")}}>
                  <h4 style={{textAlign:"center",marginTop:"0.5vh"}}>
                  Sign Up
                  </h4>
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Name </h5><input id="name" placeHolder={values.name} label="Name" value={values.name} onChange={handleChange('name')} margin="normal"/></div>
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Email </h5><input id="email" placeHolder={values.email} type="email" label="Email" value={values.email} onChange={handleChange('email')} margin="normal"/></div>
                  {emailError&&<p style={{color:"red"}}>This is not a valid email address</p>}
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Phone </h5><input id="phone" placeHolder={values.phone} type="number" label="Phone" value={values.phone} onChange={handleChange('phone')} margin="normal"/></div>
                  {phoneError&&<p style={{color:"red"}}>This is not a valid phone number</p>}
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Website </h5><input id="website" placeHolder={values.website} type="website" label="website" value={values.website} onChange={handleChange('website')} margin="normal"/></div>
                  {websiteError&&<p style={{color:"red"}}>This is not a valid website url</p>}
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Youtube Channel </h5><input id="youtube" placeHolder={values.youtube} type="youtube" label="youtube" value={values.youtube} onChange={handleChange('youtube')} margin="normal"/></div>
                  {youtubeChannelError&&<p style={{color:"red"}}>This is not a valid youtube channel</p>}
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Promo Videos, separate youtube video link urls with a comma </h5><input id="promovideos" placeHolder={values.promovideos} type="promovideos" label="promotional videos, please add youtube url links separated by a comma" value={values.promovideos} onChange={handleChange('promovideos')} margin="normal"/></div>
                  {(notallyoutube&&!values.promovideos==="")&&<h5 style={{marginRight:"1vw",color:"red"}} className="ruletext">Includes links that are not for Youtube</h5>}
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Job Title, what kind of performer are you? Magician, juggler, acrobat, etc? Separate each job title with a comma. </h5><input id="job title" type="job title" placeHolder={values.jobtitle} label="job title" value={values.jobtitle} onChange={handleChange('jobtitle')} margin="normal"/></div>
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Expertise, how did you learn your skill? (Optional) </h5><input id="expertise" type="expertise" placeHolder={values.expertise} label="expertise" value={values.expertise} onChange={handleChange('expertise')} margin="normal"/></div>
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
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Password </h5><input id="password" type="password" placeHolder={values.password} label="Password" value={values.password} onChange={handleChange('password')} margin="normal"/></div>
                  <div className="signupinput"><h5 style={{marginRight:"1vw"}} className="ruletext">Confirm Password </h5><input id="passwordtwo" type="password" placeHolder={values.passwordtwo} label="Confirm Password" value={values.passwordtwo} onChange={handleChange('passwordtwo')} margin="normal"/></div>
                  {fixErrors&&<h5 style={{marginRight:"1vw",color:"red"}} className="ruletext">Please fix errors</h5>}
                  {(!(values.password===values.passwordtwo)&&!(values.passwordtwo===""))&&<h5 style={{marginRight:"1vw",color:"red"}} className="ruletext">Passwords Do Not Match</h5>}
                  <button onClick={(e) => createUser(e)}>Submit Profile</button>

                  </div>
                  <Dialog style={{textAlign:"center"}} open={values.open} disableBackdropClick={true}>
                  <h2 style={{textAlign:"center"}}>New Account</h2>
                  <DialogContent>
                  <DialogContentText>
                  New account successfully created. Existing members will need to vote to approve your membership.
                  </DialogContentText>
                  </DialogContent>
                  <div style={{textAlign:"center",margin:"2vw"}}>
                  <Link to="/signin">
                  <button>
                  Sign In
                  </button>
                  </Link>
                  </div>
                  </Dialog>
                  </div>

                )
              }
