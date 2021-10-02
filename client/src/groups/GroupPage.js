import React, { Component } from 'react';
import {Link} from "react-router-dom";
import auth from './../auth/auth-helper'
import Newsfeed from './../post/Newsfeed'
import Events from './Events'
import Leaders from './Leaders'
import Rules from './Rules'
import Leads from './Leads'
import Jury from './Jury'
import Polls from './Polls'
import Purchases from './Purchases'
import ChatPage from "./../ChatPage/ChatPage"
import Kmeans from 'node-kmeans';
import {Image} from 'cloudinary-react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
var geodist = require('geodist')
const mongoose = require("mongoose");







class GroupPage extends Component {

    constructor(props) {
           super(props);
           this.state = {
             location:"",
             title:"",
             members:[],
             events:[],
             associatedlocalgroups:[],
             rules: [],
             redirect: false,
             updating:false,
             cannotpost:false,
             cannotusechat:false,
             cannotseeevents:false,
             cannotparticipateingrouppurchases:false,
             removefromgroup:false,
             cannotcreatepolls:false,
             cannotsuggestrulesorvoteforrules:false,
             cannotseegigleads:false,
             cannotvoteinjury:false
           }
              }

           componentDidMount(){
             this.getGroupData()
             }

           async getGroupData(){
             await fetch(`/groups/getusers`)
                 .then(response => response.json())
                 .then(data=>{
                   console.log("users",data)
                   for (let user of data){
                     if(user._id==auth.isAuthenticated().user._id){
                       for (let restriction of user.restrictions){
                         if(restriction.restriction=="cannot post"){
                           this.setState({cannotpost:true})
                         }
                         if(restriction.restriction=="cannot use chat"){
                           this.setState({cannotusechat:true})
                         }
                         if(restriction.restriction=="cannot see events"){
                           this.setState({cannotseeevents:true})
                         }
                         if(restriction.restriction=="cannot participate in group purchases"){
                           this.setState({cannotparticipateingrouppurchases:true})
                         }
                         if(restriction.restriction=="remove from group"){
                           this.setState({removefromgroup:true})
                         }
                         if(restriction.restriction=="cannot create polls"){
                           this.setState({cannotcreatepolls:true})
                         }
                         if(restriction.restriction=="cannot suggest rules"){
                           this.setState({cannotsuggestrules:true})
                         }
                         if(restriction.restriction=="cannot see gig leads"){
                           this.setState({cannotseegigleads:true})
                         }
                         if(restriction.restriction=="cannot vote in jury"){
                           this.setState({cannotvoteinjury:true})
                         }
                       }
                     }
                   }

                   this.setState({users:data})
                 })



           }

  render() {

    return (
      <>

      <Tabs className="tabs">
      <br/>
      <div className="activememberscontainer">
      <h3 className="activemembers">Active Members</h3>
      {this.state.users&&this.state.users.map(item=>{return(
        <><button style={{display:"inline"}}><Link to={"/singleuser/" + item._id}>{item.name}</Link></button></>
      )})}</div>
      {this.state.users&&<>
         <TabList >
           {!this.state.cannotpost&&<Tab>News</Tab>}
           {!this.state.cannotcreatepolls&&<Tab>Polls</Tab>}
           {!this.state.cannotseegigleads&&<Tab>Gig Leads</Tab>}
           {!this.state.cannotsuggestrulesorvoteforrules&&<Tab>Rules</Tab>}
           {!this.state.cannotseeevents&&<Tab>Events</Tab>}
           {!this.state.cannotparticipateingrouppurchases&&<Tab>Suggested Purchases</Tab>}
           {!this.state.cannotvoteinjury&&<Tab>Jury</Tab>}
           </TabList>




        <TabPanel>
         {!this.state.cannotpost&&<Newsfeed users={this.state.users}/>}
         </TabPanel>
         <TabPanel>
         {!this.state.cannotcreatepolls&&<Polls users={this.state.users}/>}
         </TabPanel>
         <TabPanel>
         {!this.state.cannotseegigleads&&<Leads users={this.state.users}/>}
         </TabPanel>
         <TabPanel>
         {!this.state.cannotsuggestrulesorvoteforrules&&<Rules users={this.state.users} />}
         </TabPanel>
         <TabPanel>
         {!this.state.cannotseeevents&&<Events users={this.state.users}/>}
         </TabPanel>
         <TabPanel>
         {!this.state.cannotparticipateingrouppurchases&&<Purchases users={this.state.users}/>}
         </TabPanel>
         <TabPanel>
         {!this.state.cannotvoteinjury&&<Jury users={this.state.users}/>}
         </TabPanel>
         </>
       }
       </Tabs>

       {(this.state.users&&!this.state.cannotusechat)&&<ChatPage users={this.state.users}/>}
      </>
    );
  }
}



export default GroupPage;
