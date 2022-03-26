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
      allleads:[],
      category:auth.isAuthenticated().user.jobtitle.toLowerCase(),
      users:props.users,
      socket:props.socket,
      page:1,
      pageNum:[],
      currentPageData:[],
      redirect: false,
      updating:false
    }
    this.updateLeads= this.updateLeads.bind(this)
    console.log("user",auth.isAuthenticated().user)

  }

  componentDidMount(){
    // let server = "http://localhost:5000";
    // if(process.env.NODE_ENV==="production"){
    //   this.socket=io();
    // }
    // if(process.env.NODE_ENV==="development"){
    //   this.socket=io(server);
    // }
    this.getLeads()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.socket !== this.props.socket) {
      this.setState({socket:nextProps.socket})
    }
    if (nextProps.users !== this.props.users) {
      this.setState({users:nextProps.users})
    }
    if (nextProps.group !== this.props.group) {
      this.setState({group:nextProps.group})
    }
  }


  decidePage(e,pagenum){
    if(this.state.category==="all"){
      let currentpage=this.state.leads.slice((pagenum*10-10),pagenum*10)
      this.setState({page:pagenum,currentPageData:currentpage})
    }else{
      let filteredleadsbycategory=this.state.leads.filter(lead=>lead.genres.includes(this.state.category))
      let currentpage=filteredleadsbycategory.slice((pagenum*10-10),pagenum*10)
      this.setState({page:pagenum,currentPageData:currentpage})
    }
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

      let filteredleadsbycategory=leads.filter(lead=>lead.genres.includes(this.state.category))

      this.setState({leads:leads})
      let currentpage=filteredleadsbycategory.slice(0,10)
      console.log("currentpage",currentpage)
      this.setState({currentPageData:currentpage})

      let pagenum=Math.ceil(filteredleadsbycategory.length/10)
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
    leadscopy=leadscopy.filter(lead=>lead.genres.includes(this.state.category))
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

    this.state.socket.emit("Input Chat Message", {
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

    changeLeadsCategory(e,item){
      if(item=="all"){
        let currentpage=this.state.leads.slice((this.state.page*10-10),this.state.page*10)
        let pagenum=Math.ceil(this.state.leads.length/10)
        console.log(this.state.leads.length,pagenum)
        let pagenums=[]
        while(pagenum>0){
          pagenums.push(pagenum)
          pagenum--
        }
        pagenums.reverse()
        console.log(pagenums)
        this.setState({category:item,currentPageData:currentpage,pageNum:pagenums})
      }else{
        let filteredleadsbycategory=this.state.leads.filter(lead=>lead.genres.includes(item))
        let pagenum=Math.ceil(filteredleadsbycategory.length/10)
        console.log(filteredleadsbycategory.length,pagenum)
        let pagenums=[]
        while(pagenum>0){
          pagenums.push(pagenum)
          pagenum--
        }
        pagenums.reverse()
        console.log(pagenums)
        let currentpage=filteredleadsbycategory.slice((this.state.page*10-10),this.state.page*10)
        this.setState({category:item,currentPageData:currentpage,pageNum:pagenums})
      }
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
          <h6 style={{margin:"0.5vw"}}>Customer Name: {item.customername}</h6>
          <h6 style={{margin:"0.5vw"}}>Description: {item.description}</h6>
          <h6 style={{margin:"0.5vw"}}>Where: {item.location}</h6>
          <h6 style={{margin:"0.5vw"}}>When: {item.time}</h6>
          <h6 style={{margin:"0.5vw"}}>How Long: {item.duration}</h6>
          {item.genres&&<h6 style={{margin:"0.5vw",display:"inline"}}>Types of Performance Needed:</h6>}
          {item.genres&&item.genres.map(item=><h6 style={{display:"inline"}}> {item}</h6>)}

          {item.views.length>=3&&<h5 style={{margin:"0.5vw"}}>Max 3 people have viewed contact details already</h5>}
          {(item.views.includes(auth.isAuthenticated().user._id)&&item.views.length<=3)&&<><h6 style={{margin:"0.5vw"}}>Phone: {item.phone}</h6>
          <h6 style={{margin:"0.5vw"}}>Email: {item.email}</h6></>}
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
      let genreoptions=[]
      if (this.state.users){
        for (let user of this.state.users){
          if (!genreoptions.includes(user.jobtitle.toLowerCase())){
            genreoptions.push(user.jobtitle.toLowerCase())
          }
        }
      }

      return (
        <>
        {this.state.users&&<CreateLeadForm sendNotif="true" updateLeads={this.updateLeads} users={this.state.users}/>}
        <h2><strong>Gig Leads </strong></h2>
        <h4 style={{display:"inline"}}>Choose Lead By Performance Type</h4>
        <button style={{display:"inline",
        opacity:("all"==this.state.category)?"0.5":"1"}} onClick={(e) => this.changeLeadsCategory(e,"all")}>all</button>
        {genreoptions&&genreoptions.map((item,index)=><><button style={{display:"inline",
        opacity:(item==this.state.category)?"0.5":"1"}} onClick={(e) => this.changeLeadsCategory(e,item)}>{item}</button></>)}
        <div>
        {(this.state.pageNum&&this.state.leads.length>10)&&  <h4 style={{display:"inline"}}>Choose Page</h4>}
        {(this.state.pageNum&&this.state.leads)&&this.state.pageNum.map((item,index)=>{
          return (<>
            <button style={{display:"inline",opacity:(index+1==this.state.page)?"0.5":"1"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
            </>)
          })}</div>
          {leadscomponent}
          {(this.state.pageNum&&this.state.leads.length>10)&&  <h4 style={{display:"inline"}}>Choose Page</h4>}
          {(this.state.pageNum&&this.state.leads)&&this.state.pageNum.map((item,index)=>{
            return (<>
              <button style={{display:"inline",opacity:(index+1==this.state.page)?"0.5":"1"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
              </>)
            })}
            <br/>
            <br/>
            </>
          );
        }
      }
