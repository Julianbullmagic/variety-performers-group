import React, {useState} from 'react'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import auth from './../auth/auth-helper'
import {Redirect} from 'react-router-dom'
import io from "socket.io-client";
import {signin} from './api-auth.js'

export default function Signin(props) {
  let server = "http://localhost:5000";
  let socket
  if(process.env.NODE_ENV==="production"){
    socket=io();
  }
  if(process.env.NODE_ENV==="development"){
    socket=io(server);
  }
  const [loggingIn, setLoggingIn] = useState(false)
  const [values, setValues] = useState({
      email: '',
      password: '',
      mustenteremail:'',
      checkyouremail:'',
      error: '',
      redirectToReferrer: false
  })

  const clickSubmit = () => {
    setLoggingIn(true)
    const user = {
      email: values.email || undefined,
      password: values.password || undefined
    }
    console.log(user)

    signin(user).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error})
        console.error(data.error)
        setLoggingIn(false)
      } else {
        console.log(data)
        auth.authenticate(data, () => {
          setValues({ ...values, error: '',redirectToReferrer: true})
        })
        socket.emit("new user", data.user.name);
        setLoggingIn(false)
      }
    })
  }

  async function forgotPassword(){
    if (!values.email){
      setValues({...values,mustenteremail:'You must enter your email address so we can send you a password reset link'})
      setTimeout(() => {
        setValues({...values,mustenteremail:''})
      }, 5000)
    }

    console.log(values.email)

    if (values.email){
      const options = {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body:''
      }

      let passwordresettoken=await fetch("/groups/getpasswordresettoken/"+values.email, options
      ).then(res=>res.json())
      .then(res => {
      console.log("password reset token result",res.token)
      return res.token
      }).catch(err => {
      console.error(err);
      })
      console.log("password reset token",passwordresettoken)

      let url = "http://localhost:3000"
      if(process.env.NODE_ENV==="production"){
        url="http://democratic-social-network.herokuapp.com"
      }

          let notification={
            emails:[values.email],
            subject:"Change Password for Democratic Social Network",
            message:`To reset your password visit this link ${url}/forgotpassword/${passwordresettoken}`
          }

          const opt = {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(notification)
          }

          fetch("/groups/sendemailnotification", opt
        ) .then(res => {
          console.log(res)
        }).catch(err => {
          console.error(err);
        })

        setValues({...values,checkyouremail:'We have sent you an email with a password reset link'})
        setTimeout(() => {
          setValues({...values,checkyouremail:''})
        }, 5000)
    }}

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value })
  }

  const {from} = props.location.state || {
      from: {
        pathname: '/'
      }
  }
  const {redirectToReferrer} = values
    if (redirectToReferrer) {
      return (<Redirect to={from}/>)
  }

  return (
      <div className="signinform">
        <div className="innersigninform">
          <h4 style={{margin:"1vw",textAlign:"center"}}>
            Sign In
          </h4>
          <div className="signininput">
          <h5 className="ruletext" style={{marginRight:"1vw"}}>Email </h5><input id="email" type="email" label="Email" value={values.email} onChange={handleChange('email')} margin="normal"/>
          </div>
          <div className="signininput">
          <h5 className="ruletext" style={{marginRight:"1vw"}}>Password </h5><input id="password" type="password" label="Password" value={values.password} onChange={handleChange('password')} margin="normal"/>
          </div>
           {
            values.error && (<Typography component="p" color="error">
              <Icon color="error">error </Icon>
              {values.error}
            </Typography>)
          }
          {!loggingIn&&<button style={{display:"inline"}} id="submit" onClick={clickSubmit}>Submit</button>}
          {loggingIn&&<h3>Logging in...</h3>}
          <button style={{display:"inline"}} id="submit" onClick={forgotPassword}>Forgot Password</button>
          {values.mustenteremail&&<p style={{color:"red",display:"block"}}>{values.mustenteremail}</p>}
          {values.checkyouremail&&<p style={{color:"green",display:"block"}}>{values.checkyouremail}</p>}

        </div>
      </div>
    )
}
