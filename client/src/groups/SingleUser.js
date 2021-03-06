import React, { useState, useEffect,useRef} from 'react'
import {Image} from 'cloudinary-react'
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import auth from './../auth/auth-helper'
import Axios from 'axios';
import validator from 'validator';

export default function SingleUser({ match }) {
  var phoneExpression = /^\({0,1}((0|\+61)(2|4|3|7|8)){0,1}\){0,1}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{2}(\ |-){0,1}[0-9]{1}(\ |-){0,1}[0-9]{3}$/;
  const [user, setUser] = useState({})
  const [numImages, setNumImages] = useState([0]);
  const [events,setEvents]=useState(false)
  const [leads,setLeads]=useState(false)
  const [posts,setPosts]=useState(false)
  const [polls,setPolls]=useState(false)
  const [rules,setRules]=useState(false)
  const [purchases,setPurchases]=useState(false)
  const [restriction,setRestriction]=useState([])
  const [restrictions,setRestrictions]=useState(false)
  const [rulesApproved,setRulesApproved]=useState(false)
  const [loading,setLoading]=useState(false)
  const [restrictionsApproved,setRestrictionsApproved]=useState(false)
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


  useEffect(() => {
    getUser()
  }, [])

  function extraImage(e){
    e.preventDefault()
    let imagenum=numImages
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

  async function getUser(){
    await fetch(`/groups/getuser/`+match.params.userId)
    .then(response => response.json())
    .then(data=>{
      console.log("user",data.data)
      setUser(data.data)
      setEvents(data.data.events)
      setLeads(data.data.leads)
      setPosts(data.data.posts)
      setPolls(data.data.polls)
      setRules(data.data.rules)
      setPurchases(data.data.purchases)
      setRestriction(data.data.restriction)
      setRestrictions(data.data.restrictions)
      setRulesApproved(data.data.rulesapproved)
      setRestrictionsApproved(data.data.restrictionsapproved)
    })
  }

  function changer(){
    let errors=false
    if(validator.isURL(values.youtube)&&values.youtube.includes("youtube")){
      setYoutubeChannelError(false)
    }else{
      setYoutubeChannelError(true)
      setFixErrors(true)
      errors=true
    }

    if(validator.isURL(values.website)){
      setWebsiteError(false)
    }else{
      setWebsiteError(true)
      setFixErrors(true)
      errors=true
    }

    if(validator.isEmail(values.email)){
      setEmailError(false)
    }else{
      setEmailError(true)
      setFixErrors(true)
      errors=true
    }

    if(values.phone.match(phoneExpression)){
      setPhoneError(false)
    }else{
      setPhoneError(true)
      setFixErrors(true)
      errors=true
    }

    if(!(values.password===values.passwordtwo)){
      setValues({ ...values, passworderror:true})
    }
    let youtubevids=values.promovideos.split(",")
    let notallyoutub=false
    for (let vid of youtubevids){
      if (!vid.includes("youtube")){
        notallyoutub=true
        errors=true
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
  }

  async function updateUser(){
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

  if(values.email!==""){
    if(validator.isEmail(values.email)){
      setEmailError(false)
    }else{
      setEmailError(true)
      setFixErrors(true)
      errors=true
    }
  }

  if(values.phone!==""){
    if(values.phone.match(phoneExpression)){
      setPhoneError(false)
    }else{
      setPhoneError(true)
      setFixErrors(true)
      errors=true
    }
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
    if(notallyoutub){
      setValues({ ...values, passworderror:true})
    }
  }

    if (errors){
      setFixErrors(true)
    }else{
      setFixErrors(false)
    }

    if(!errors){
      if(!notallyoutub){
        setLoading(true)

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
                        password: values.password || undefined,
                        events:events,
                        leads:leads,
                        posts:posts,
                        polls:polls,
                        rules:rules,
                        purchases:purchases,
                        restriction:restriction,
                        restrictions:restrictions,
                        rulesapproved:rulesApproved,
                        restrictionsapproved:restrictionsApproved
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
                      }
                      setLoading(false)
                    }


                    const handleChange = name => event => {
                      console.log(values)
                      changer()
                      setValues({ ...values, [name]: event.target.value })
                    }

                    const clickSubmit = (e) => {
                      updateUser()
                    }
                    let youtubevideos=values.promovideos.split(",")
                    let notallyoutube=false
                    for (let vid of youtubevideos){
                      if (!vid.includes("youtube")){
                        notallyoutube=true
                      }
                    }
                    let d = new Date();
                    let n = d.getTime();

                    let restrictionsmapped=<></>
                    if(restrictions){
                      restrictionsmapped=restrictions.map(item=>{
                        let elapsed=n-item.timecreated
                        let dayselapsed=Math.round(elapsed/86400000)
                        let daysleft=item.duration-dayselapsed
                        return (<div className="leader" style={{textAlign:"center",margin:"0.5vw"}}><p style={{display:"inline"}}><strong>Restriction: </strong>{item.restriction} for {daysleft} days. <strong>Explanation: </strong> {item.explanation}. </p>
                        {(item.createdby===auth.isAuthenticated().user._id)&&<div style={{textAlign:"center",display:"inline"}}><p style={{display:'inline'}}>You created this restriction with your leader privileges </p></div>}</div>)})}

                    return (
                      <>
                      {user&&(
                        <div className="signupform" style={{height:"auto"}}>
                        <div className="innersignupform" style={{height:"auto"}}>
                        {user.name&&<h1 style={{textAlign:"center"}}>{user.name}</h1>}
                        {user.youtube&&<a href={user.youtube}><h3 style={{textAlign:"center",color:"blue"}}><strong>Youtube Channel</strong></h3></a>}
                        {user.expertise&&<h3 style={{textAlign:"center"}}><strong>Expertise:</strong> {user.expertise}</h3>}
                        {user.performancedescription&&<h3 style={{textAlign:"center"}}><strong>Performance Description:</strong> {user.performancedescription}</h3>}
                        {user.rates&&<h3 style={{textAlign:"center"}}><strong>Rates:</strong> {user.rates}</h3>}
                        {user.phone&&<h3 style={{textAlign:"center"}}><strong>Phone Number:</strong> {user.phone}</h3>}
                        {user.email&&<h3 style={{textAlign:"center"}}><strong>Email Address:</strong> {user.email}</h3>}
                        <br/>
                        {user.images&&<><h3 style={{textAlign:"center"}}><strong>Images</strong></h3>
                        <div style={{marginBottom:"40vw"}}>
                        <AwesomeSlider style={{marginLeft:"5vw",width:"50vw", zIndex: 1, position:"absolute"}}>
                        {user.images&&user.images.map(item=>{return (<div><Image style={{width:"100%"}} cloudName="julianbullmagic" publicId={item} /></div>)})}
                        </AwesomeSlider>
                        </div></>}
                        {user.promovideos&&<>
                        <h3 style={{textAlign:"center"}}><strong>Youtube Videos</strong></h3>
                        <div style={{marginLeft:"5vw",width:"50vw"}}>
                        {user.promovideos&&user.promovideos.map(item=>{
                            let splitvid=item.split("=")
                            let embedvid=`https://www.youtube.com/embed/${splitvid[splitvid.length-1]}`
                            if(item.includes("embed")){
                              embedvid=item
                            }
                          return (<iframe title={item} style={{width:"100%",height:"60vh"}} src={embedvid}/>)})}
                        </div></>}
                        {(user.restrictions&&user.restrictions.length>0)&&<div style={{textAlign:"center"}}><h3 style={{textAlign:"center"}}>Restrictions</h3>
                        {restrictionsmapped}</div>}
                        </div>
                        </div>)}


                        {(auth.isAuthenticated()&&auth.isAuthenticated().user._id===match.params.userId)&&(
                          <div className="signupform">
                          <div  style={{position: "static"}}  className="innersignupform">
                          <h1 style={{textAlign:"center"}}>
                          Edit Listing
                          </h1>
                          <div className="signininput">
                          <h5 style={{marginRight:"1vw"}} className="ruletext">Name </h5><input id="name" placeHolder={user.name} label="Name"value={values.name} onChange={handleChange('name')} margin="normal"/>
                          </div>

                          <div className="signininput">
                          <h5 style={{marginRight:"1vw",textAlign:"left"}} className="ruletext">Email </h5><input id="email" placeHolder={user.email} type="email" label="Email"  value={values.email} onChange={handleChange('email')} margin="normal"/>
                          {emailError&&<p style={{color:"red"}}>This is not a valid email address</p>}
                          </div>
                          <div className="signininput">
                          <h5 style={{marginRight:"1vw",textAlign:"left"}} className="ruletext">Phone </h5><input id="phone" placeHolder={user.phone} type="text" label="Phone"  value={values.phone} onChange={handleChange('phone')} margin="normal"/>
                          {phoneError&&<p style={{color:"red"}}>This is not a valid phone number</p>}
                          </div>

                          <div className="signininput">
                          <h5 style={{marginRight:"1vw",textAlign:"left"}} className="ruletext">Website </h5><input id="website" placeHolder={user.website} type="website" label="website" value={values.website} onChange={handleChange('website')} margin="normal"/>
                          {websiteError&&<p style={{color:"red"}}>This is not a valid website url</p>}
                          </div>

                          <div className="signininput">
                          <h5 style={{marginRight:"1vw",textAlign:"left"}} className="ruletext">Youtube Channel </h5><input id="youtube" placeHolder={user.youtube} type="youtube" label="youtube" value={values.youtube} onChange={handleChange('youtube')} margin="normal"/>
                          {youtubeChannelError&&<p style={{color:"red"}}>This is not a valid youtube channel</p>}
                          </div>

                          <div className="signininput">
                          <h5 style={{marginRight:"1vw",textAlign:"left"}} className="ruletext">Promotional Youtube Videos </h5><input id="promovideos" placeHolder={user.promovideos} type="promovideos" label="promotional videos, please add youtube url links separated by a comma" value={values.promovideos} onChange={handleChange('promovideos')} margin="normal"/>
                          {(notallyoutube&&!values.promovideos==="")&&<h5 style={{marginRight:"1vw",color:"red"}} className="ruletext">Includes links that are not for Youtube</h5>}
                          </div>

                          <div className="signininput">
                          <h5 className="ruletext" style={{marginRight:"1vw",textAlign:"left"}}>Expertise </h5><input id="expertise" placeHolder={user.expertise} type="expertise" label="expertise" value={values.expertise} onChange={handleChange('expertise')} margin="normal"/>
                          </div>


                          <div className="signininput">
                          <h5 style={{marginRight:"1vw",textAlign:"left"}} className="ruletext">Performance Description </h5><input id="performancedescription" placeHolder={user.performancedescription} type="performancedescription" label="Performance Description" value={values.performancedescription} onChange={handleChange('performancedescription')} margin="normal"/>
                          </div>

                          <div className="signininput">
                          <h5 style={{marginRight:"1vw",textAlign:"left"}} className="ruletext">Rates </h5><input id="rates" placeHolder={user.rates} type="rates" label="Rates" value={values.rates} onChange={handleChange('rates')} margin="normal"/>
                          </div>

                          <h4>Tick the boxes below to recieve email notifications about new suggestions. At least 10% of members must have voted for something before notifications will be sent in order to help prevent individuals from spamming everyone. </h4>
                          <div style={{display:"flex",flexWrap:"wrap"}}>
                          <div style={{display:"flex",alignItems:"center"}}>
                          <input
                          type="checkbox"
                          style={{overflow:"auto"}}
                          checked={events}
                          onChange={e => {
                            console.log(e.target.value)
                            setEvents(e.target.checked)}}
                            />
                            <h5 style={{marginRight:"1vw"}}  className="ruletext">Events </h5>
                            </div>
                            <div style={{display:"flex",alignItems:"center"}}>
                            <input
                            type="checkbox"
                            style={{overflow:"auto"}}
                            checked={leads}
                            onChange={e => {
                              console.log(e.target.value)
                              setLeads(e.target.checked)}}
                              />
                              <h5 style={{marginRight:"1vw",overflow:"auto"}}  className="ruletext">Leads </h5>
                              </div>
                              <div style={{display:"flex",alignItems:"center"}}>
                              <input
                              type="checkbox"
                              style={{overflow:"auto"}}
                              checked={posts}
                              onChange={e => {
                                console.log(e.target.value)
                                setPosts(e.target.checked)}}
                                />
                                <h5 style={{marginRight:"1vw",overflow:"auto"}} className="ruletext">Posts </h5>
                                </div>
                                <div style={{display:"flex",alignItems:"center"}}>
                                <input
                                type="checkbox"
                                style={{overflow:"auto"}}
                                checked={polls}
                                onChange={e => {
                                  console.log(e.target.value)
                                  setPolls(e.target.checked)}}
                                  />
                                  <h5 style={{marginRight:"1vw"}} className="ruletext">Polls </h5>
                                  </div>
                                  <div style={{display:"flex",alignItems:"center"}}>
                                  <input
                                  type="checkbox"
                                  style={{overflow:"auto"}}
                                  checked={rules}
                                  onChange={e => {
                                    console.log(e.target.value)
                                    setRules(e.target.checked)}}
                                    />
                                    <h5 style={{marginRight:"1vw"}} className="ruletext">Rules </h5>
                                    </div>
                                    <div style={{display:"flex",alignItems:"center"}}>
                                    <input
                                    type="checkbox"
                                    style={{overflow:"auto"}}
                                    checked={purchases}
                                    onChange={e => {
                                      console.log(e.target.value)
                                      setPurchases(e.target.checked)}}
                                      />
                                      <h5 style={{marginRight:"1vw"}} className="ruletext">Purchases </h5>
                                      </div>
                                      <div style={{display:"flex",alignItems:"center"}}>
                                      <input
                                      type="checkbox"
                                      style={{overflow:"auto"}}
                                      checked={restriction}
                                      onChange={e => {
                                        console.log(e.target.value)
                                        setRestriction(e.target.checked)}}
                                        />
                                        <h5 style={{marginRight:"1vw"}} className="ruletext">Restrictions </h5>
                                        </div>
                                        </div>
                                        <h4>Tick the boxes below to recieve email notifications when new rules or restrictions for particular uses recieve approval from above 75% of the members</h4>
                                        <div style={{display:"flex",flexWrap:"wrap"}}>
                                        <div style={{display:"flex",alignItems:"center"}}>
                                        <input
                                        type="checkbox"
                                        style={{overflow:"auto"}}
                                        checked={rulesApproved}
                                        onChange={e => {
                                          console.log(e.target.value)
                                          setRulesApproved(e.target.checked)}}
                                          />
                                          <h5 style={{marginRight:"1vw"}} className="ruletext">Rule Approval </h5>
                                          </div>
                                          <div style={{display:"flex",alignItems:"center"}}>
                                          <input
                                          type="checkbox"
                                          style={{overflow:"auto"}}
                                          checked={restrictionsApproved}
                                          onChange={e => {
                                            console.log(e.target.value)
                                            setRestrictionsApproved(e.target.checked)}}
                                            />
                                            <h5 style={{marginRight:"1vw"}} className="ruletext">Restriction Approval </h5>
                                            </div>
                                            </div>


                                            <div className="signininput" style={{display:((numImages.length>=1)?"block":"none")}}>
                                            <input style={{width:"100%"}} id="file" type="file" ref={selectedFile1}/>
                                            </div>

                                            <div className="signininput" style={{display:((numImages.length>=2)?"block":"none")}}>
                                            <input style={{width:"100%"}} id="file" type="file" ref={selectedFile2}/>
                                            </div>

                                            <div className="signininput" style={{display:((numImages.length>=3)?"block":"none")}}>
                                            <input style={{width:"100%"}} id="file2" type="file" ref={selectedFile3}/>
                                            </div>

                                            <div className="signininput" style={{display:((numImages.length>=4)?"block":"none")}}>
                                            <input style={{width:"100%"}} id="file3" type="file" ref={selectedFile4}/>
                                            </div>

                                            <div className="signininput" style={{display:((numImages.length>=5)?"block":"none")}}>
                                            <input style={{width:"100%"}} id="file4" type="file" ref={selectedFile5}/>
                                            <p>Max 5 images</p>
                                            </div>

                                            <button onClick={(e) => extraImage(e)}>Add Extra Image</button>
                                            <button onClick={(e) => lessImage(e)}>One Less Image</button>
                                            {loading&&<h3>Loading!!!</h3>}
                                            {!loading&&<button id="submit" onClick={clickSubmit}>Submit</button>}
                                            {fixErrors&&<p style={{color:"red"}}>Please fix all errors</p>}
                                            </div>
                                            </div>
                                          )}

                                          </>
                                        )
                                      }
