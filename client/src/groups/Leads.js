import React, { Component } from 'react';
import CreateLeadForm from './CreateLeadForm'
import { MapContainer, TileLayer,Circle} from 'react-leaflet'
import auth from './../auth/auth-helper'
import io from "socket.io-client";

const mongoose = require("mongoose");


export default class Events extends Component {

    constructor(props) {
           super(props);
           this.state = {
             leads:[],
             redirect: false,
             updating:false
           }
           this.updateLeads= this.updateLeads.bind(this)
              }


           componentDidMount(){
             this.socket = io();
             this.getLeads()
             }

async getLeads(){
  await fetch(`/leads`)
      .then(response => response.json())
      .then(data=>{
        console.log("leads",data)
        this.setState({leads:data})
      })
}


 updateLeads(newlead){
 var leadscopy=JSON.parse(JSON.stringify(this.state.leads))
 leadscopy.push(newlead)
 this.setState({ leads:leadscopy})}


         async deleteLead(event,item){

console.log(item)
           var leadscopy=JSON.parse(JSON.stringify(this.state.leads))
           function checkLead(lead) {
             return lead._id!=item
           }

               var filteredleads=leadscopy.filter(checkLead)

           this.setState({leads:filteredleads})
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




  render() {
    var d = new Date();
    var n = d.getTime();

            var leadscomponent=<h3>no leads at the moment</h3>
            if (this.state.leads){

        leadscomponent=this.state.leads.map(item=>{return(
<>
<div className="leadbox">
<div className="leadcol1">
<h3>{item.title}</h3>
<h4>Description: {item.description}</h4>
<h4>Where: {item.location}</h4>
<h4>When: {item.time}</h4>
<h4>How Long: {item.duration}</h4>
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
      <br/>
      <CreateLeadForm updateLeads={this.updateLeads}/>
      <h2><strong>Gig Leads </strong></h2>
      {leadscomponent}
      </>
    );
  }
}
