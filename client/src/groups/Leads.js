import React, { Component } from 'react';
import CreateLeadForm from './CreateLeadForm'
import { MapContainer, TileLayer,Circle} from 'react-leaflet'
import auth from './../auth/auth-helper'
import io from "socket.io-client";
const mongoose = require("mongoose");


export default class Leads extends Component {

  constructor(props) {
    super(props);
    this.state = {
      leads:[],
      users:props.users,
      page:1,
      pageNum:[],
      currentPageData:[],
      redirect: false,
      updating:false
    }
    this.updateLeads= this.updateLeads.bind(this)
  }


  componentDidMount(){
    let server = "http://localhost:5000";
    this.socket = io(server);
    this.getLeads()
  }

  decidePage(e,pagenum){
    let currentpage=this.state.leads.slice((pagenum*10-10),pagenum*10)
    this.setState({page:pagenum,currentPageData:currentpage})
  }

  async getLeads(){
    await fetch(`/leads`)
    .then(response => response.json())
    .then(data=>{
      for (let lead of data){
        lead.viewcontact=false
      }
      let leads=data
      leads.reverse()
      this.setState({leads:leads})

      let currentpage=leads.slice(0,10)
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


  updateLeads(newlead){
    var leadscopy=JSON.parse(JSON.stringify(this.state.leads))
    leadscopy.reverse()
    leadscopy.push(newlead)
    leadscopy.reverse()
    this.setState({ leads:leadscopy})

    let current=leadscopy.slice((this.state.page*10-10),this.state.page*10)
    console.log(current)
    this.setState({currentPageData:current})
  }


  async deleteLead(event,item){
    console.log(item)
    var leadscopy=JSON.parse(JSON.stringify(this.state.leads))
    function checkLead(lead) {
      return lead._id!=item
    }

    var filteredleads=leadscopy.filter(checkLead)

    this.setState({leads:filteredleads})
    let current=filteredleads.slice((this.state.page*10-10),this.state.page*10)
    console.log(current)
    this.setState({currentPageData:current})
    var d = new Date();
    var n = d.getTime();


    let chatMessage=`deleted a gig lead called ${item.title}`
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

      const options = {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json'
        },
        body: ''
      }

      await fetch("/leads/"+item, options)
    }

    viewContactDetails(e,id){
      let leadscopy=JSON.parse(JSON.stringify(this.state.leads))
      for (let lead of leadscopy){
        if (lead._id==id){
          lead.views.push(auth.isAuthenticated().user._id)
        }
      }
      console.log(leadscopy)
      let current=leadscopy.slice((this.state.page*10-10),this.state.page*10)
      console.log(current)
      this.setState({leads:leadscopy,currentPageData:current})

      const options = {
        method: 'put',
        headers: {
          'Content-Type': 'application/json'
        },
        body: ''
      }

      console.log("adding view",id,auth.isAuthenticated().user._id)
      fetch("/leads/addview/"+id+"/"+auth.isAuthenticated().user._id, options)
      .then(response => response.json()).then(json => console.log(json));

    }


    render() {
      var d = new Date();
      var n = d.getTime();

      var leadscomponent=<h3>no leads at the moment</h3>
      if (this.state.leads){

        leadscomponent=this.state.currentPageData.map(item=>{return(
          <>
          <div key={item._id} className="leadbox">
          <div className="leadcol1">
          <h3 style={{margin:"0.5vw"}}>{item.title}</h3>
          <h4 style={{margin:"0.5vw"}}>Customer Name: {item.customername}</h4>
          <h4 style={{margin:"0.5vw"}}>Description: {item.description}</h4>
          <h4 style={{margin:"0.5vw"}}>Where: {item.location}</h4>
          <h4 style={{margin:"0.5vw"}}>When: {item.time}</h4>
          <h4 vstyle={{margin:"0.5vw"}}>How Long: {item.duration}</h4>
          {item.views.length>=3&&<h4 style={{margin:"0.5vw"}}>Max 3 people have viewed contact details already</h4>}
          {(item.views.includes(auth.isAuthenticated().user._id)&&item.views.length<=3)&&<><h4 style={{margin:"0.5vw"}}>Phone: {item.phone}</h4>
          <h4 style={{margin:"0.5vw"}}>Email: {item.email}</h4></>}
          {(!item.views.includes(auth.isAuthenticated().user._id)&&item.views.length<3)&&<button onClick={(e)=>this.viewContactDetails(e,item._id)}>View Contact Details?</button>}
          <button onClick={(e)=>this.deleteLead(e,item._id)}>Delete this lead?</button>

          </div>
          <div className="leadcol2">
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
        {this.state.users&&<CreateLeadForm sendNotif="true" updateLeads={this.updateLeads} users={this.state.users}/>}
        <h2><strong>Gig Leads </strong></h2>
        {(this.state.pageNum&&this.state.leads.length>10)&&  <h4 style={{display:"inline"}}>Choose Page</h4>}
        {(this.state.pageNum&&this.state.leads)&&this.state.pageNum.map((item,index)=>{
          return (<>
            <button style={{display:"inline",opacity:(index+1==this.state.page)?"0.5":"1"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
            </>)
          })}
          {leadscomponent}
          {(this.state.pageNum&&this.state.leads.length>10)&&  <h4 style={{display:"inline"}}>Choose Page</h4>}
          {(this.state.pageNum&&this.state.leads)&&this.state.pageNum.map((item,index)=>{
            return (<>
              <button style={{display:"inline",opacity:(index+1==this.state.page)?"0.5":"1"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
              </>)
            })}
            <br/>
            </>
          );
        }
      }
