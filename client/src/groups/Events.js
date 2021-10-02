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
             page:1,
             pageNum:[],
             currentPageData:[],
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

             decidePage(e,pagenum){
                console.log("decide page",(pagenum*10-10),pagenum*10)
                let currentpage=this.state.events.slice((pagenum*10-10),pagenum*10)
                console.log("currentpage",currentpage)
                this.setState({page:pagenum,currentPageData:currentpage})
              }

async getEvents(){
  await fetch(`/events`)
      .then(response => response.json())
      .then(data=>{
        console.log("events",data)
        let events=data
        events.reverse()
     this.setState({events:events})

    console.log("decide events",0,10)
    let currentpage=events.slice(0,10)
    console.log("currentpage",currentpage)
    this.setState({currentPageData:currentpage})

    let pagenum=Math.ceil(data.length/10)
    console.log("page num",pagenum)
    let pagenums=[]
    while(pagenum>0){
      pagenums.push(pagenum)
      pagenum--
    }
    pagenums.reverse()
    console.log(pagenums)
    this.setState({pageNum:pagenums})

      })
}


 updateEvents(newevent){
 var eventscopy=JSON.parse(JSON.stringify(this.state.events))
 eventscopy.reverse()
 eventscopy.push(newevent)
 eventscopy.reverse()
 this.setState({ events:eventscopy})
       let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)
       console.log(current)
       this.setState({currentPageData:current})
}






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

           let current=filteredapproval.slice((this.state.page*10-10),this.state.page*10)
           console.log(current)
           this.setState({currentPageData:current})

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

  }
}

this.setState({events:eventscopy})
      let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)
      console.log(current)
      this.setState({currentPageData:current})
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
               let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)
               console.log(current)
               this.setState({currentPageData:current})
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



       sendEventNotification(item){
         if(!item.notificationsent){
           var eventscopy=JSON.parse(JSON.stringify(this.state.events))
           for (let ev of eventscopy){
             if (ev._id==item._id){
               ev.notificationsent=true
       }}
       this.setState({events:eventscopy})
       let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)
       console.log(current)
       this.setState({currentPageData:current})
           console.log("sending event notification",this.state.users)
           let emails=this.state.users.map(item=>{return item.email})


           console.log(emails)
             let notification={
               emails:emails,
               subject:"New Event Suggestion",
               message:`${item.createdby.name} suggested the event: ${item.title}`
             }

             const options = {
               method: 'post',
               headers: {
                 'Content-Type': 'application/json'
               },
                  body: JSON.stringify(notification)
             }

             fetch("/groups/sendemailnotification", options
           ) .then(res => {
           console.log(res);
           }).catch(err => {
           console.log(err);
           })

           const optionstwo = {
             method: 'put',
             headers: {
               'Content-Type': 'application/json'
             },
                body: ''
           }

           fetch("/events/notificationsent/"+item._id, optionstwo
           ) .then(res => {
           console.log(res);
           }).catch(err => {
           console.log(err);
           })
         }
       }




  render() {
    console.log("USERS IN EVENTS",this.props.users)
    var d = new Date();
    var n = d.getTime();

            var eventscomponent=<h3>no events</h3>
            if (this.state.users&&this.state.events){
              console.log("THIS.PROPS.Users",this.props.users)
              eventscomponent=this.state.currentPageData.map(item => {

                let approval=<></>
                  approval=Math.round((item.approval.length/this.state.users.length)*100)


                if(approval>=10&&!item.notificationsent){
                  this.sendEventNotification(item)
                }

                let attendeenames=[]
                for (let user of this.state.users){
                  for (let attendee of item.approval){
                    if (attendee==user._id){
                      attendeenames.push(user.name)
                    }
                  }
                }

console.log("EVENT!",item,this.props.users)

                return(
<>
<div className="eventbox" style={{marginBottom:"1vw"}}>
<div className="eventcol1">
<h3>{item.title}</h3>
<h4>{item.description}</h4>
{this.state.users&&<h4 className="ruletext">{approval}% of members are attending this event, {item.approval.length}/{this.state.users.length}. </h4>}
{(item.approval.length>0)&&<h4 className="ruletext">Attendees=</h4>}

{attendeenames&&attendeenames.map((item,index)=>{return(<h4 className="ruletext">{item}{(index<(attendeenames.length-2))?", ":(index<(attendeenames.length-1))?" and ":"."}</h4>)})}
{!item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext" onClick={(e)=>this.approveofevent(e,item._id)}>Attend this event?</button>}
{item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext" onClick={(e)=>this.withdrawapprovalofevent(e,item._id)}>Don't want to attend anymore?</button>}
<button className="ruletext" onClick={(e)=>this.deleteEvent(e,item)}>Delete?</button>
</div>
<div className="eventimagemapcontainer">
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
      <h4 style={{display:"inline"}}>Choose Page</h4>
{(this.state.pageNum&&this.state.events)&&this.state.pageNum.map(item=>{
        return (<>
          <button style={{display:"inline"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
          </>)
      })}
      {eventscomponent}
      <h4 style={{display:"inline"}}>Choose Page</h4>
{(this.state.pageNum&&this.state.events)&&this.state.pageNum.map(item=>{
        return (<>
          <button style={{display:"inline"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
          </>)
      })}
      </>
    );
  }
}
