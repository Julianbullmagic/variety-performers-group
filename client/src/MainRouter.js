import React from 'react'
import {Route, Switch} from 'react-router-dom'
import Home from './core/Home'
import Signup from './user/Signup'
import Signin from './auth/Signin'
import GroupPage from './groups/GroupPage'
import SingleUser from './groups/SingleUser'
import Menu from './core/Menu'

const MainRouter = () => {
    return (<div>
      <Menu/>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route exact path="/signup" component={Signup}/>
        <Route exact path="/signin" component={Signin}/>
        <Route exact path="/group"    component={GroupPage}/>
        <Route exact path="/singleuser/:userId"    component={SingleUser}/>
      </Switch>

    </div>)
}



export default MainRouter
