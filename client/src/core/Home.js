import React, {useState, useEffect} from 'react'
import {Image} from 'cloudinary-react'
import {Link} from "react-router-dom";
import CreateLeadForm from '../groups/CreateLeadForm'




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
          let approvedusers=data.filter(user=>user.approvedmember)
          setUsers(approvedusers)
          let vids=[]
          for (let user of approvedusers){
            if (user.promovideos){
              vids.push(...user.promovideos)
            }
          }
          vids = vids.sort(() => Math.random() - 0.5)
          setVideos(vids)
        })



  }
    return (
      <>
      <div className="homepage" style={{marginTop:"0vh",paddingTop:"0vh"}}>
      <div className="homepageexplanation">
      <h5>We are a team of entertainers from Sydney. We perform at many different kinds of events, weddings, festivals, parties, functions. Our highly skilled and experienced entertainers
      will keep you amazed and amused. We are an agency run by performers, allowing direct communication and better value for money. No middle men.</h5>
      </div>
      <div style={{opacity:"0.9"}}>
      <CreateLeadForm homepage="true" users={users}/>
      </div>

      <div className="users">
      {users&&users.map(user=>{return(<div key={user._id}>
        <Link to={"/singleuser/" + user._id}>
        <div className="usercard">
        <div className="userdeets">
        <h2><strong>{user.name}</strong></h2>
        <h4>{user.jobtitle}</h4>
        </div>
        <Image style={{objectFit:"cover",width:"100%",height:"100%",overflow:"hidden",position:"relative"}}
        cloudName="julianbullmagic" publicId={user.images[0]} /></div>
        }</Link>
        </div>)})}
        <div className="vids">
      <iframe style={{marginRight:"1vw",width:"44vw",height:"44vh",display:"inline",borderRadius:"10px"}} src={videos[0]} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
      <iframe style={{marginLeft:"1vw",width:"44vw",height:"44vh",display:"inline",borderRadius:"10px"}} src={videos[1]} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
      </div>
        </div>
      </div>
      </>
    )
}
