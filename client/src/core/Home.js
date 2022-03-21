import React, {useState, useEffect} from 'react'
import ChatPage from "./../ChatPage/ChatPage"
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import unicornbikeImg from './../assets/images/unicornbike.jpg'
import Grid from '@material-ui/core/Grid'
import auth from './../auth/auth-helper'
import background from "./2170171.jpg";
import {Image} from 'cloudinary-react'
import {Link} from "react-router-dom";
import CreateLeadForm from '../groups/CreateLeadForm'

const KmeansLib = require('kmeans-same-size');



export default function Home({history}){
  const [users, setUsers] = useState(false)
  const [videos, setVideos] = useState(false)


  useEffect(()=> {
getGroupData()
  }, [])




  async function getGroupData(){
    await fetch(`/groups/getusers`)
        .then(response => response.json())
        .then(data=>{
          console.log("users",data)
          let approvedusers=data.filter(user=>user.approvedmember)
          console.log("APPROVED USERS",approvedusers)
          setUsers(approvedusers)
          let vids=[]
          for (let user of approvedusers){
            if (user.promovideos){
              console.log("user.promovideos",user.promovideos)
              vids.push(...user.promovideos)
            }
          }
          vids = vids.sort(() => Math.random() - 0.5)
          console.log("vids",vids)
          setVideos(vids)
        })



  }
    return (
      <>
      <div className="homepage" style={{marginTop:"0vh",paddingTop:"0vh"}}>
      <div className="homepageexplanation">
      <h3>We are a team of entertainers from Sydney. We perform at many different kinds of events, weddings, festivals, parties, functions. Our highly skilled and experienced entertainers
      will keep you amazed and amused. We are an agency run by performers, allowing direct communication and better value for money. No middle men.</h3>
      </div>
      <div style={{opacity:"0.9"}}>
      <CreateLeadForm homepage="true" users={users}/>
      </div>

      <div className="users">
      {users&&users.map(user=>{return(<>
        <Link to={"/singleuser/" + user._id}>
        <div className="usercard">
        <div className="userdeets">
        <h2><strong>{user.name}</strong></h2>
        <h4>{user.jobtitle}</h4>
        </div>
        <Image style={{objectFit:"cover",width:"100%",height:"100%",overflow:"hidden",position:"relative"}}
        cloudName="julianbullmagic" publicId={user.images[0]} /></div>
        }</Link>
        </>)})}
        <div className="vids">
      <iframe style={{margin:"0.5vw",width:"44vw",height:"44vh",display:"inline"}} src={videos[0]} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <iframe style={{margin:"0.5vw",width:"44vw",height:"44vh",display:"inline"}} src={videos[1]} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
        </div>
      </div>
      </>
    )
}
