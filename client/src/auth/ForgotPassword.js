import React, {useState,useEffect} from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import auth from './../auth/auth-helper'
import {Redirect} from 'react-router-dom'
import {signin} from './api-auth.js'
import {changePassword} from '../user/api-user.js'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import {Link} from 'react-router-dom'

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
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
}))

export default function ForgotPassword(props) {
  const classes = useStyles()
  const [loading, setLoading] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [values, setValues] = useState({
    password: '',
    passwordtwo:'',
    email:'',
    tokenerror:'',
    error: '',
    open:false,
    redirectToReferrer: false
  })

  async function clickSubmit(){
    let options={
      method: "POST",
      body: '',
      headers: {
        "Content-type": "application/json; charset=UTF-8"}}

        let response=await fetch("/groups/verifychangepasswordjwt/"+props.match.params.token+"/"+values.email,options)
        .then(res => {
          return res.json();
        }).catch(err=>console.error(err))
        console.log("response",response)
        if(response.message){
          setValues({...values,tokenerror:response.message})
          setTimeout(() => {
            setValues({...values,tokenerror:''})
          }, 5000)
        }

        if(response=="can log in"){
          if(!(values.password==values.passwordtwo)){
            setValues({ ...values, passworderror:true,tokenerror:true})
          }

          if(values.password==values.passwordtwo){

            setValues({ ...values, passworderror:false,tokenerror:true})
            setLoading(true)


            const newuser = {
              email:values.email,
              password:values.password
            }


            changePassword(newuser).then((data) => {
              if (data.error) {
                setValues({ ...values, error: data.error})
              } else {
                setValues({ ...values, error: '', open: true})
              }
            })

                setLoading(false)
                setLoadingComplete(true)
                setTimeout(() => {
                  setLoadingComplete(false)
                }, 5000)
              }
        }
      }


    const handleChange = name => event => {
      setValues({ ...values, [name]: event.target.value })
    }


    return (
      <div className="signinform">
      <div className="innersigninform" style={{height:"auto"}}>
      <h4 style={{textAlign:"center"}}>Reset Password</h4>
      <div className="signininput">
      <h5>Email </h5><input style={{display:"inline"}} id="password" type="text" label="Email" className={classes.textField} value={values.email} onChange={handleChange('email')} margin="normal"/>
      </div>
      <div className="signininput">
      <h5>Password </h5><input style={{display:"inline"}} id="password" type="password" label="Password" className={classes.textField} value={values.password} onChange={handleChange('password')} margin="normal"/>
      </div>
      <div className="signininput">
      <h5>Confirm Password </h5><input style={{display:"inline"}} id="password" type="password" label="Password" className={classes.textField} value={values.passwordtwo} onChange={handleChange('passwordtwo')} margin="normal"/>
      </div>
      {values.tokenerror&&<h5 style={{marginRight:"1vw",color:"red"}} className="ruletext">{values.tokenerror}</h5>}
      {(!(values.password==values.passwordtwo)&&!(values.passwordtwo==""))&&<h5 style={{marginRight:"1vw",color:"red"}} className="ruletext">Passwords Do Not Match</h5>}
      {((values.password==values.passwordtwo)&&!(values.passwordtwo=="")&&!loading)&&<button style={{marginLeft:"45%"}} id="submit" onClick={clickSubmit} >Submit</button>}
      {loading&&<h3>...Uploading Changes</h3>}
      {loadingComplete&&<h2>Upload Complete, Password Updated</h2>}
      </div>
      <Dialog open={values.open} disableBackdropClick={true}>
      <DialogTitle>New Account</DialogTitle>
      <DialogContent>
      <DialogContentText>
      Password successfully changed.
      </DialogContentText>
      </DialogContent>
      <DialogActions>
      <Link to="/signin">
      <button>
      Sign In
      </button>
      </Link>
      </DialogActions>
      </Dialog>
      </div>
    )
  }
