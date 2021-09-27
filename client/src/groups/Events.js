import React, { Component } from 'react';
import CreateEventForm from './CreateEventForm'
import {Image} from 'cloudinary-react'
import io from "socket.io-client";
import auth from './../auth/auth-helper'
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
import { MapContainer, TileLayer,Circle} from 'react-leaflet'
const mongoose = require("mongoose");


export default class Events extends Component {

    constructor(props) {
           super(props);
           this.state = {
             location:"",
             title:"",
             users:props.users,
             events:[],
             redirect: false,
             updating:false
           }
           this.updateEvents= this.updateEvents.bind(this)
              }


           componentDidMount(){
             let server = "http://localhost:5000";
             this.socket = io(server);
             this.getEvents()
             }

async getEvents(){
  await fetch(`/events`)
      .then(response => response.json())
      .then(data=>{
        console.log("events",data)
        this.setState({events:data})
      })
}


 updateEvents(newevent){
 var eventscopy=JSON.parse(JSON.stringify(this.state.events))
 eventscopy.push(newevent)
 this.setState({ events:eventscopy})}






         async deleteEvent(e,item){


           var eventscopy=JSON.parse(JSON.stringify(this.state.events))
           function checkEvent(event) {
             return event._id!=item._id
           }
           var d = new Date();
           var n = d.getTime();


           let chatMessage=`deleted an event called ${item.title}`
           let userId=auth.isAuthenticated().user._id
           let userName=auth.isAuthenticated().user.name
           let nowTime=n
           let type="text"

           this.socket.emit("Input Chat Message", {
             chatMessage,
             userId,
             userName,
             nowTime,
             type});

               var filteredapproval=eventscopy.filter(checkEvent)
         console.log(filteredapproval)

           this.setState({events:filteredapproval})


           const options = {
             method: 'delete',
             headers: {
               'Content-Type': 'application/json'
             },
                body: ''
           }

           await fetch("/events/"+item._id, options)


         const optionstwo = {
         method: 'put',
         headers: {
         'Content-Type': 'application/json'
         },
         body: ''
         }

         await fetch("/groups/removeeventfromgroup/"+this.state.id+"/"+item._id, optionstwo)

         }







       approveofevent(e,id){
var eventscopy=JSON.parse(JSON.stringify(this.state.events))
function checkEvent() {
  return id!==auth.isAuthenticated().user._id
}
for (var ev of eventscopy){
  if (ev._id==id){

 if(!ev.approval.includes(auth.isAuthenticated().user._id)){
   ev.approval.push(auth.isAuthenticated().user._id)
 }

this.setState({events:eventscopy})
  }
}

this.setState({events:eventscopy})
         const options = {
           method: 'put',
           headers: {
             'Content-Type': 'application/json'
           },
              body: ''
         }
         console.log(id,auth.isAuthenticated().user._id)

         fetch("/events/approveofevent/" + id +"/"+ auth.isAuthenticated().user._id, options
).then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })

}


       withdrawapprovalofevent(e,id){
         var eventscopy=JSON.parse(JSON.stringify(this.state.events))
         function checkEvent(userid) {
           return userid!=auth.isAuthenticated().user._id
         }
         for (var ev of eventscopy){
           if (ev._id==id){


             var filteredapproval=ev.approval.filter(checkEvent)
             ev.approval=filteredapproval
           }
         }
         this.setState({events:eventscopy})

         const options = {
           method: 'put',
           headers: {
             'Content-Type': 'application/json'
           },
              body: ''
         }
         console.log(id,auth.isAuthenticated().user._id)

         fetch("/events/withdrawapprovalofevent/" + id +"/"+ auth.isAuthenticated().user._id, options
).then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })

       }







  render() {
    console.log("USERS IN EVENTS",this.props.users)
    var d = new Date();
    var n = d.getTime();

            var eventscomponent=<h3>no events</h3>
            if (this.state.users&&this.state.events){
              eventscomponent=this.state.events.map(item => {

                let approval=<></>
                if(this.state.users){
                  approval=Math.round((item.approval.length/this.state.users.length)*100)
                }
                let attendeenames=[]
                for (let user of this.state.users){
                  for (let attendee of item.approval){
                    if (attendee==user._id){
                      attendeenames.push(user.name)
                    }
                  }
                }

console.log("EVENT!",item)

                return(
<>
<div className="eventbox">
<div className="eventcol1">
<h3>{item.title}</h3>
<h4>{item.description}</h4>
{this.state.users&&<h4>{approval}% of members are attending this event, {item.approval.length}/{this.state.users.length}. Atendees=</h4>}
{attendeenames&&attendeenames.map((item,index)=>{return(<><h4 className="ruletext">{item}{(index<(attendeenames.length-2))?", ":(index<(attendeenames.length-1))?" and ":"."}</h4></>)})}
{!item.approval.includes(auth.isAuthenticated().user._id)&&<button onClick={(e)=>this.approveofevent(e,item._id)}>Attend this event?</button>}
{item.approval.includes(auth.isAuthenticated().user._id)&&<button onClick={(e)=>this.withdrawapprovalofevent(e,item._id)}>Don't want to attend anymore?</button>}
<button style={{display:"block"}} onClick={(e)=>this.deleteEvent(e,item)}>Delete?</button>
</div>
<div className="eventcol2">
{item.images&&<Image style={{width:"100%",overflow:"hidden"}} cloudName="julianbullmagic" publicId={item.images[0]} />}
</div>
<div className="eventcol3">
{item.coordinates&&<><MapContainer center={[item.coordinates[0],item.coordinates[1]]} zoom={13} scrollWheelZoom={false}>
  <TileLayer
    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
   <Circle center={[item.coordinates[0],item.coordinates[1]]} radius={100} />
</MapContainer></>}
</div>
</div>
</>

)})
              }







    return (
      <>
      <br/>
      <h2>Propose an Event</h2>
      <CreateEventForm updateEvents={this.updateEvents}/>
      <h2><strong>Group Events </strong></h2>
      {eventscomponent}
      </>
    );
  }
}
