import React, { Component } from 'react';
import CreateEventForm from './CreateEventForm'
import {Image} from 'cloudinary-react'
import io from "socket.io-client";
import auth from './../auth/auth-helper'
import AwesomeSlider from 'react-awesome-slider';
import 'leaflet/dist/leaflet.css';
import 'react-awesome-slider/dist/styles.css';
import { MapContainer, TileLayer,Circle} from 'react-leaflet'
const mongoose = require("mongoose");
const MILLISECONDS_IN_A_DAY=86400000
const MILLISECONDS_IN_A_WEEK=604800000

export default class Events extends Component {

  constructor(props) {
    super(props);
    this.state = {
      location:"",
      title:"",
      users:props.users,
      group:props.group,
      level:0,
      events:[],
      page:1,
      pageNum:[],
      currentPageData:[],
      redirect: false,
      updating:false
    }
    let socket
    this.updateEvents= this.updateEvents.bind(this)
    this.eventApprovedNotification=this.eventApprovedNotification.bind(this)
    this.areYouSure=this.areYouSure.bind(this)
    this.areYouNotSure=this.areYouNotSure.bind(this)
    this.sendEventNotification=this.sendEventNotification.bind(this)
    this.approveofevent=this.approveofevent.bind(this)
    this.deleteEvent=this.deleteEvent.bind(this)
    this.withdrawapproveofevent=this.withdrawapprovalofevent.bind(this)
  }


  componentDidMount(){
    let server = "http://localhost:5000";
    if(process.env.NODE_ENV=="production"){
      this.socket=io();
    }
    if(process.env.NODE_ENV=="development"){
      this.socket=io(server);
    }
    this.getEvents()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.users !== this.props.users) {
      this.setState({users:nextProps.users})
    }
    if (nextProps.group !== this.props.group) {
      this.setState({group:nextProps.group,level:nextProps.group.level,groupsbelow:nextProps.group.groupsbelow})
    }
  }

  decidePage(e,pagenum){
    let currentpage=this.state.events.slice((pagenum*10-10),pagenum*10)
    this.setState({page:pagenum,currentPageData:currentpage})
  }

  async getEvents(){
    await fetch(`/events/getevents/`+this.props.groupId)
    .then(response => response.json())
    .then(data=>{
      console.log(data)
      let events=data
      events.reverse()
      this.setState({events:events})

      let currentpage=events.slice(0,10)

      this.setState({currentPageData:currentpage})
      let pagenum=Math.ceil(data.length/10)

      let pagenums=[]
      while(pagenum>0){
        pagenums.push(pagenum)
        pagenum--
      }
      pagenums.reverse()

      this.setState({pageNum:pagenums})
    }).catch(err => {
      console.error(err);
    })
  }


  updateEvents(newevent){
    let eventscopy=JSON.parse(JSON.stringify(this.state.events))
    eventscopy.reverse()
    eventscopy.push(newevent)
    eventscopy.reverse()
    this.setState({ events:eventscopy})
    let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)
    this.setState({currentPageData:current})
  }

  async sendEventDown(ev){
    let optionsone = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: ''
    }

    fetch("/events/marksentdown/" + ev._id, optionsone
  ).then(res => {
    console.log(res)
  }).catch(err => {
    console.error(err);
  })


  let lowergroupids=[]
  for (let group of this.state.group.groupsbelow){

    if(group.groupsbelow){
      lowergroupids.push(...group.groupsbelow)
    }
    lowergroupids.push(group._id)
  }

  for (let gr of lowergroupids){

    fetch("/events/sendeventdown/"+ev._id+"/"+gr,  optionsone)
    .catch(err => {
      console.error(err);
    })
  }
}


 deleteEvent(e,item){
  let eventscopy=JSON.parse(JSON.stringify(this.state.events))
  function checkEvent(event) {
    return event._id!=item._id
  }
  var d = new Date();
  var n = d.getTime();

  let chatMessage=`An event called ${item.title} has been deleted from this group`
  let userId=auth.isAuthenticated().user._id
  let userName=auth.isAuthenticated().user.name
  let nowTime=n
  let type="text"
  let groupId=this.state.group._id
  let groupTitle=this.state.group.title

  this.socket.emit("Input Chat Message", {
    chatMessage,
    userId,
    userName,
    nowTime,
    type,
    groupId,
    groupTitle});

    var filteredapproval=eventscopy.filter(checkEvent)

    this.setState({events:filteredapproval})
    let current=filteredapproval.slice((this.state.page*10-10),this.state.page*10)

    this.setState({currentPageData:current})

    let userscopy=JSON.parse(JSON.stringify(this.state.users))
    userscopy=userscopy.filter(item=>item.events)
    let emails=userscopy.map(item=>{return item.email})


    let notification={
      emails:emails,
      subject:"Event Deleted",
      message:`The event called ${item.title} has been deleted in the group called
      ${this.state.group.title} at level ${this.state.group.level}.`
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

  const options = {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  }

   fetch("/events/"+item._id, options)
 .then(res => {
   console.log(res)
 })
  .catch(err => {
    console.error(err);
  })
}



approveofevent(e,id){
  let d = new Date();
  let n = d.getTime();
  let eventscopy=JSON.parse(JSON.stringify(this.state.events))
  function checkEvent() {
    return id!==auth.isAuthenticated().user._id
  }
  for (var ev of eventscopy){
    if (ev._id==id){

      if(!ev.approval.includes(auth.isAuthenticated().user._id)){
        ev.approval.push(auth.isAuthenticated().user._id)
      }
    }
    let approval=Math.round((ev.approval.length/this.state.users.length)*100)

    if ((approval>75)&&(this.state.group.level>0)&&(ev.sentdown==false)){

      ev.sentdown=true
      this.sendEventDown(ev)
    }

    if (approval>75&&!ev.approvalnotificationsent){
      this.eventApprovedNotification(ev)
    }

    if (approval<75&&(n-ev.timecreated)>MILLISECONDS_IN_A_WEEK){
      this.deleteEvent(null,ev)
    }
    if(approval>=10&&!ev.notificationsent){
      this.sendEventNotification(ev)
    }
  }

  this.setState({events:eventscopy})
  let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)

  this.setState({currentPageData:current})
  const options = {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: ''
  }


  fetch("/events/approveofevent/" + id +"/"+ auth.isAuthenticated().user._id, options
).then(res => {
  console.log(res)
}).catch(err => {
  console.error(err);
})

}


withdrawapprovalofevent(e,id){
  let d = new Date();
  let n = d.getTime();
  let eventscopy=JSON.parse(JSON.stringify(this.state.events))
  function checkEvent(userid) {
    return userid!=auth.isAuthenticated().user._id
  }
  for (var ev of eventscopy){
    let approval=Math.round((ev.approval.length/this.state.users.length)*100)

    if (ev._id==id){
      var filteredapproval=ev.approval.filter(checkEvent)
      ev.approval=filteredapproval
    }


    if (approval<75&&(n-ev.timecreated)>MILLISECONDS_IN_A_WEEK){
      this.deleteEvent(null,ev)
    }

  }
  this.setState({events:eventscopy})
  let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)

  this.setState({currentPageData:current})
  const options = {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    },
    body: ''
  }


  fetch("/events/withdrawapprovalofevent/" + id +"/"+ auth.isAuthenticated().user._id, options
).then(res => {
  console.log(res)
}).catch(err => {
  console.error(err);
})

}



 eventApprovedNotification(item){
  console.log(item)
  if(item.approvalnotificationsent==false){
    let eventscopy=JSON.parse(JSON.stringify(this.state.events))
    for (let ev of eventscopy){
      console.log(ev._id,item._id)
      if (ev._id==item._id){
        ev.approvalnotificationsent=true
      }}
console.log(eventscopy)
      this.setState({events:eventscopy})
      let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)
      this.setState({currentPageData:current})

      let d = new Date();
      let n = d.getTime();
      let chatMessage=`An event called ${item.title} has been approved for this group, with 75% attendance`
      let userId=auth.isAuthenticated().user._id
      let userName=auth.isAuthenticated().user.name
      let nowTime=n
      let type="text"
      let groupId=this.state.group._id
      let groupTitle=this.state.group.title

      this.socket.emit("Input Chat Message", {
        chatMessage,
        userId,
        userName,
        nowTime,
        type,
        groupId,
        groupTitle
      });


      let userscopy=JSON.parse(JSON.stringify(this.state.users))
      userscopy=userscopy.filter(user=>user.eventsapproved)
      let emails=userscopy.map(item=>{return item.email})
      let notification={
        emails:emails,
        subject:"New Event Approved",
        message:`An event called ${item.title} has reached 75% attendance in the group called ${this.state.group.title} at level ${this.state.group.level}`
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
      console.log(res)
    }).catch(err => {
      console.error(err);
    })

    const optionstwo = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: ''
    }

  fetch("/events/approvalnotificationsent/"+item._id, optionstwo
  ) .then(res => {
    console.log(res)
  }).catch(err => {
    console.error(err);
  })
}
}

areYouSure(e,item){
  console.log(item)
    let eventscopy=JSON.parse(JSON.stringify(this.state.events))
    console.log(eventscopy)
    for (let ev of eventscopy){
      if (ev._id==item._id){
        ev.areyousure=true
      }}
      console.log(eventscopy)

      let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)
      this.setState({events:eventscopy,currentPageData:current})
    }

    areYouNotSure(e,item){
      console.log(item)
        let eventscopy=JSON.parse(JSON.stringify(this.state.events))
        console.log(eventscopy)
        for (let ev of eventscopy){
          if (ev._id==item._id){
            ev.areyousure=false
          }}
          console.log(eventscopy)
          let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)
          this.setState({events:eventscopy,currentPageData:current})
        }

sendEventNotification(item){
  console.log(item)
  if(item.notificationsent==false){
    let eventscopy=JSON.parse(JSON.stringify(this.state.events))
    console.log(eventscopy)
    for (let ev of eventscopy){
      if (ev._id==item._id){
        ev.notificationsent=true
        console.log("updated event",ev)
      }}
      console.log(eventscopy)

      let current=eventscopy.slice((this.state.page*10-10),this.state.page*10)
      this.setState({events:eventscopy,currentPageData:current})

      let d = new Date();
      let n = d.getTime();
      let chatMessage=`An event called ${item.title} has been suggested for this group`
      let userId=auth.isAuthenticated().user._id
      let userName=auth.isAuthenticated().user.name
      let nowTime=n
      let type="text"
      let groupId=this.state.group._id
      let groupTitle=this.state.group.title

      this.socket.emit("Input Chat Message", {
        chatMessage,
        userId,
        userName,
        nowTime,
        type,
        groupId,
        groupTitle});

      let userscopy=JSON.parse(JSON.stringify(this.state.users))
      userscopy=userscopy.filter(user=>user.events)
      let emails=userscopy.map(item=>{return item.email})
      let notification={
        emails:emails,
        subject:"New Event Suggestion",
        message:`In the group called ${this.state.group.title} at level ${this.state.group.level}, ${item.createdby.name} suggested the event: ${item.title}`
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
      console.log(res)
    }).catch(err => {
      console.error(err);
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
    console.log(res)
  }).catch(err => {
    console.error(err);
  })
}
}


render() {

  var d = new Date();
  var n = d.getTime();

  var eventscomponent=<h3>no events</h3>
  if (this.state.users&&this.state.events){
    if(this.state.events.length>0){
    eventscomponent=this.state.currentPageData.map(item => {

      let approval=<></>
      approval=Math.round((item.approval.length/this.state.users.length)*100)

      let attendeenames=[]
      for (let user of this.state.users){
        for (let attendee of item.approval){
          if (attendee==user._id){
            attendeenames.push(user.name)
          }
        }
      }
      let width=`${(item.approval.length/this.state.users.length)*100}%`
      if (approval<75&&(n-item.timecreated)>MILLISECONDS_IN_A_WEEK){
        this.deleteEvent(null,item)
      }
      let starttime=item.starttime.split('T')
      starttime=`Date: ${starttime[0]}, Time: ${starttime[1]}`
      let endtime=item.endtime.split('T')
      endtime=`Date: ${endtime[0]}, Time: ${endtime[1]}`
      return(
        <>
        <div key={item._id} className="eventbox" style={{marginBottom:"1vw"}}>
        <div className="eventcol1">
        {item.title&&<h3>Title: {item.title}</h3>}
        {item.description&&<h4>Description: {item.description}</h4>}
        {item.starttime&&<h4>Start: {starttime}, End: {endtime}</h4>}
        {this.state.users&&<h4 className="ruletext">{item.approval.length} people are attending this event. {item.approval.length>0&&<>Attendees=</>}</h4>}
        {attendeenames&&attendeenames.map((item,index)=>{return(<><h4 className="ruletext">{item}{(index<(attendeenames.length-2))?", ":(index<(attendeenames.length-1))?" and ":"."}</h4></>)})}
        <div className="percentagecontainer"><div style={{width:width}} className="percentage"></div></div>
        {!item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext approvalbutton" id={item.title} onClick={(e)=>this.approveofevent(e,item._id)}>Attend this event?</button>}
        {item.approval.includes(auth.isAuthenticated().user._id)&&<button className="ruletext approvalbutton" id={item.title} onClick={(e)=>this.withdrawapprovalofevent(e,item._id)}>Don't want to attend anymore?</button>}
        {this.state.group.groupabove&&<>
        {item.createdby&&<>
        {((item.createdby._id==auth.isAuthenticated().user._id||this.state.group.groupabove.members.includes(auth.isAuthenticated().user._id))&&approval<75&&!item.areyousure)&&
          <button className="ruletext deletebutton" id={item.title} onClick={(e)=>this.areYouSure(e,item)}>Delete?</button>}</>}
          </>}
          {item.areyousure&&<button className="ruletext deletebutton" id={item.title} onClick={(e)=>this.areYouNotSure(e,item)}>Not sure</button>}
          {item.areyousure&&<button className="ruletext deletebutton" id={item.title} onClick={(e)=>this.deleteEvent(e,item)}>Are you sure?</button>}
          </div>
          {(item.images||item.coordinates)&&<div className="eventimagemapcontainer">
          {item.images&&<div className="eventcol2">
          <Image style={{width:"100%",overflow:"hidden"}} cloudName="julianbullmagic" publicId={item.images[0]} />
          </div>}
          <div className="eventcol3">
          <div className="eventcol3inner">
          {item.coordinates&&<MapContainer center={[item.coordinates[0],item.coordinates[1]]} zoom={13} scrollWheelZoom={false}>
          <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle center={[item.coordinates[0],item.coordinates[1]]} radius={100} />
          </MapContainer>}
          </div>
          </div>
          </div>}
          </div>
          </>

        )})
      }
      }

      let inthisgroup=this.state.group.members.map(item=>item._id)
      inthisgroup=inthisgroup.includes(auth.isAuthenticated().user._id)

      return (
        <>
        <div style={{marginBottom:"20vw"}}>
        {inthisgroup&&<CreateEventForm updateEvents={this.updateEvents} groupId={this.props.groupId} level={this.state.group.level}/>}
        <h2><strong>Group Events </strong></h2>
        {this.state.pageNum.length>1&&<h4 style={{display:"inline"}}>Choose Page</h4>}
        {(this.state.pageNum.length>1&&this.state.pageNum&&this.state.events)&&this.state.pageNum.map((item,index)=>{
          return (<>
            <button style={{display:"inline",opacity:(index+1==this.state.page)?"0.5":"1"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
            </>)
          })}
          {this.state.currentPageData&&eventscomponent}
          {this.state.pageNum.length>1&&<h4 style={{display:"inline"}}>Choose Page</h4>}
          {(this.state.pageNum.length>1&&this.state.pageNum.length>1&&this.state.pageNum&&this.state.events)&&this.state.pageNum.map((item,index)=>{
            return (<>
              <button style={{display:"inline",opacity:(index+1==this.state.page)?"0.5":"1"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
              </>)
            })}
            </div>
            </>
          );
        }
      }
