import React, {useState, useEffect} from 'react'
import {Image} from 'cloudinary-react'
import {Link} from "react-router-dom";
import CreateLeadForm from '../groups/CreateLeadForm'
import background from "./homepagedesign.png";
import reviews from "./reviews.png";

export default function Home({history}){
  const [users, setUsers] = useState([])
  const [videos, setVideos] = useState([])

  useEffect(()=> {
getGroupData()
  }, [])

  async function getGroupData(){
    await fetch(`/groups/getusers`)
        .then(response => response.json())
        .then(data=>{
          let approvedusers=data.filter(user=>user.approvedmember)
          approvedusers=approvedusers.sort(() => Math.random() - 0.5);
          approvedusers=approvedusers.sort(() => Math.random() - 0.5);

          setUsers(approvedusers)
          let vids=[]
          for (let user of approvedusers){
            if (user.promovideos){
              vids.push(...user.promovideos)
            }
          }
          let embedvids=[]
          for (let vid of vids){
            console.log("vid",vid)
            let splitvid=vid.split("=")
            console.log(splitvid[splitvid.length-1])
            let embedvid=`https://www.youtube.com/embed/${splitvid[splitvid.length-1]}`
            if(vid.includes("embed")){
              embedvids.push(vid)
            }else{
              embedvids.push(embedvid)
            }
          }
          console.log("embedvids",embedvids)
          embedvids = embedvids.sort(() => Math.random() - 0.5)
          setVideos(embedvids)
        })
  }

    return (
      <>
      <div className="homepage" style={{marginTop:"0vh",paddingTop:"0vh",textAlign:"center"}}>
      <img src={background} style={{height:"85vh"}}/>
      <h3 style={{margin:"2vw"}}>We are a team of entertainers from Sydney. We perform at many different kinds of events, weddings,
      festivals, parties, functions. Our highly skilled and experienced entertainers will keep you amazed and
      amused. We offer roving entertainment, street style performances and stage shows.</h3>
      <div style={{opacity:"0.9"}}>
      <CreateLeadForm homepage="true" users={users}/>
      </div>
      <div className="users">
      {users&&users.map(user=>{return(<div key={user._id}>
        <Link to={"/singleuser/" + user._id}>
        <div className="usercard">
        <div className="userdeets">
        <h2 style={{margin:"0.75vh"}}><strong>{user.name}</strong></h2>
        <h4 style={{margin:"0.75vh"}}>{user.jobtitle}</h4>
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
        <img src={reviews} style={{height:"120vh",marginTop:"1vw"}}/>
      </div>
      </>
    )
}
