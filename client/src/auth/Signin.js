import React, {useState} from 'react'
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

export default function Signin(props) {
  const classes = useStyles()
  const [values, setValues] = useState({
      email: '',
      password: '',
      error: '',
      redirectToReferrer: false
  })

  const clickSubmit = () => {
    const user = {
      email: values.email || undefined,
      password: values.password || undefined
    }
    console.log(user)

    signin(user).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error})
        console.log(data.error)
      } else {
        console.log(data)
        auth.authenticate(data, () => {
          setValues({ ...values, error: '',redirectToReferrer: true})
        })
      }
    })
  }

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
          <h4 style={{textAlign:"center"}}>
            Sign In
          </h4>
          <div className="signininput">
          <h5 className="ruletext">Email </h5><input id="email" type="email" label="Email" className={classes.textField} value={values.email} onChange={handleChange('email')} margin="normal"/>
          </div>
          <div className="signininput">
          <h5 className="ruletext">Password </h5><input id="password" type="password" label="Password" className={classes.textField} value={values.password} onChange={handleChange('password')} margin="normal"/>
          </div>
           {
            values.error && (<Typography component="p" color="error">
              <Icon color="error" className={classes.error}>error</Icon>
              {values.error}
            </Typography>)
          }
          <button style={{marginLeft:"45%"}} id="submit" onClick={clickSubmit} >Submit</button>
        </div>
      </div>
    )
}
