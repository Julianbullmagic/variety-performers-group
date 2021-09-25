import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import auth from './../auth/auth-helper'
import {Link, withRouter} from 'react-router-dom'

const isActive = (history, path) => {
  if (history.location.pathname === path)
    return {color: 'white'}
  else
    return {color: 'white'}
}
const Menu = withRouter(({history}) => (
  <AppBar>
    <Toolbar>
      <Typography variant="h6" color="inherit"style={{marginLeft:"1vw"}}>
        Variety Performers Group
      </Typography>
      <Link to="/">
        <button style={isActive(history, "/")}>Home</button>
      </Link>
      <Link to="/explanation">
        <button id="explanation">About
        </button>
      </Link>
      {
        !auth.isAuthenticated() && (<span>
          <Link style={{marginLeft:"10px",
          marginRight:"5px"}} to="/signup">
            <button id="signup">Sign up
            </button>
          </Link>
          <Link to="/signin">
            <button >Sign In
            </button>
          </Link>
        </span>)
      }
      {
        auth.isAuthenticated() && (
          <span>
          <Link to={"/singleuser/" + auth.isAuthenticated().user._id}>
            <button style={{marginLeft:"10px",
            marginRight:"5px"}}>My Profile</button>
          </Link>
            <Link to={"/group"}>
              <button>Group</button>
            </Link>
          <button color="inherit" onClick={() => {
              auth.clearJWT(() => history.push('/'))
            }}>Sign out</button>

        </span>)
      }
    </Toolbar>
  </AppBar>
))

export default Menu
