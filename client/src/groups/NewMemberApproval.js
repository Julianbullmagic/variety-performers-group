import React, { Component } from 'react';
import {Image} from 'cloudinary-react'
import auth from './../auth/auth-helper'
import io from "socket.io-client";
import AwesomeSlider from 'react-awesome-slider';
const mongoose = require("mongoose");


export default class NewMemberApproval extends Component {

    constructor(props) {
           super(props);
           this.state = {
             users:props.users,
             allusers:props.users,
             potentialmembers:[],
             rules: [],
             page:1,
             pageNum:[],
             currentPageData:[],
             redirect: false,
             updating:false,
             participate:props.participate
           }
           this.approveofnewmember=this.approveofnewmember.bind(this)
           this.withdrawapprovalofnewmember=this.withdrawapprovalofnewmember.bind(this)
           this.toggleDetails=this.toggleDetails.bind(this)
           this.sendMemberApprovedNotification=this.sendMemberApprovedNotification.bind(this)
           this.sendMemberApprovalNotification=this.sendMemberApprovalNotification.bind(this)

}



           componentDidMount(props){
             let server = "https://variety-performers-group.herokuapp.com";
             this.socket = io(server);
             console.log(this.state.users)
             let allusers=JSON.parse(JSON.stringify(this.state.users))
             let potentialmembers=this.state.users.filter(item=>!item.approvedmember)
             let actualmembers=this.state.users.filter(item=>item.approvedmember)

             console.log("potential members",potentialmembers)
             console.log("actualmembers",actualmembers)

              for (var member of potentialmembers){
                  member.viewdetails=false
           }
             this.setState({potentialmembers:potentialmembers,users:actualmembers,allusers:allusers})
             }


toggleDetails(e,id){
  console.log("toggling details")
  var potentialmemberscopy=JSON.parse(JSON.stringify(this.state.potentialmembers))
   for (var member of potentialmemberscopy){
     if (member._id==id){
       member.viewdetails=!member.viewdetails
       console.log(member,member.viewdetails)
}
}
this.setState({potentialmembers:potentialmemberscopy})
}

                    approveofnewmember(e,id){
            var potentialmemberscopy=JSON.parse(JSON.stringify(this.state.potentialmembers))

             for (var member of potentialmemberscopy){
               if (member._id==id){

              if(!member.approval.includes(auth.isAuthenticated().user._id)){
                member.approval.push(auth.isAuthenticated().user._id)


                let approval=(member.approval.length/this.state.users.length)*100

                if (approval>10){
                   this.sendMemberApprovalNotification(member)
                }
                if (approval>75){
                  this.sendMemberApprovedNotification(member)
                  const opt = {
                    method: 'put',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                       body: ''
                  }

                  fetch("/groups/newmemberapproved/" + id, opt
         ).then(res => {
             console.log(res);
           }).catch(err => {
             console.log(err);
           })
              }
              }

               }
             }

             this.setState({potentialmembers:potentialmemberscopy})

                      const options = {
                        method: 'put',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                           body: ''
                      }

                      fetch("/groups/approveofnewmember/" + id +"/"+ auth.isAuthenticated().user._id, options
             ).then(res => {
                 console.log(res);
               }).catch(err => {
                 console.log(err);
               })

             }


                    withdrawapprovalofnewmember(e,id){
                      var potentialmemberscopy=JSON.parse(JSON.stringify(this.state.potentialmembers))
                      function checkMember(userid) {
                        return userid!=auth.isAuthenticated().user._id
                      }
                      for (var member of potentialmemberscopy){
                        if (member._id==id){


                          var filteredapproval=member.approval.filter(checkMember)
                          member.approval=filteredapproval
                        }
                      }
                      this.setState({potentialmembers:potentialmemberscopy})


                      const options = {
                        method: 'put',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                           body: ''
                      }

                      fetch("/groups/withdrawapprovalofnewmember/" + id +"/"+ auth.isAuthenticated().user._id, options
             ) .then(res => {
                 console.log(res);
               }).catch(err => {
                 console.log(err);
               })
                    }

             sendMemberApprovedNotification(item){
               if(!item.notificationsent){
                 var memberscopy=JSON.parse(JSON.stringify(this.state.allusers))
                 for (let member of memberscopy){
                   if (member._id==item._id){
                     member.notificationsent=true
             }}
             this.setState({allusers:memberscopy})


                 console.log("sending new member notification",this.state.users)
                 let userscopy=JSON.parse(JSON.stringify(this.state.users))

                 console.log(userscopy.length)



                 let emails=userscopy.map(item=>{return item.email})
                 console.log(emails)
                 console.log(emails.length)

                 console.log(emails)
                   let notification={
                     emails:emails,
                     subject:"New Member Approved",
                     message:`New Member Approved: ${item.name}`
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

                 fetch("/groups/notificationsent/"+item._id, optionstwo
                 ) .then(res => {
                 console.log(res);
                 }).catch(err => {
                 console.log(err);
                 })
               }
             }


                          sendMemberApprovalNotification(item){
                            if(!item.notificationsent){
                              var memberscopy=JSON.parse(JSON.stringify(this.state.allusers))
                              for (let member of memberscopy){
                                if (member._id==item._id){
                                  member.notificationsent=true
                          }}
                          this.setState({allusers:memberscopy})


                              console.log("sending new member notification",this.state.users)
                              let userscopy=JSON.parse(JSON.stringify(this.state.users))

                              console.log(userscopy.length)



                              let emails=userscopy.map(item=>{return item.email})
                              console.log(emails)
                              console.log(emails.length)

                              console.log(emails)
                                let notification={
                                  emails:emails,
                                  subject:"New Member Approved",
                                  message:`New Member Approved: ${item.name}`
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

                              fetch("/groups/notificationsent/"+item._id, optionstwo
                              ) .then(res => {
                              console.log(res);
                              }).catch(err => {
                              console.log(err);
                              })
                            }
                          }


               render(props) {
                 console.log("users in new members page",this.state.users)
                 var d = new Date();
                 var n = d.getTime();

             var newmemberscomponent=<h3>no potential members</h3>
             if (this.state.potentialmembers){


                 newmemberscomponent=this.state.potentialmembers.map(item => {
                 let approval=<></>

                 if(this.state.users){
                   approval=Math.round((item.approval.length/this.state.users.length)*100)
                 }

                 if(approval>=10&&!item.notificationsent){
                   this.sendMemberApprovalNotification(item)
                 }

                 if(approval>=10&&!item.notificationsent){
                   this.sendMemberApprovalNotification(item)
                 }
                 let approveenames=[]
                 for (let user of this.state.users){
                   for (let approvee of item.approval){
                     if (approvee==user._id){
                       approveenames.push(user.name)
                     }
                   }
                 }

                 let width=`${(item.approval.length/this.state.users.length)*100}%`
                 return(
             <>
               <div className="rule"  style={{transition:"height 2s"}}>
               {!item.viewdetails&&<button className="ruletext" onClick={(e)=>this.toggleDetails(e,item._id)}>View More Details</button>}
               {item.viewdetails&&<button className="ruletext" onClick={(e)=>this.toggleDetails(e,item._id)}>View less Details</button>}
               {(!item.approval.includes(auth.isAuthenticated().user._id))&&<button className="ruletext" onClick={(e)=>this.approveofnewmember(e,item._id)}>Approve?</button>}
               {(item.approval.includes(auth.isAuthenticated().user._id))&&<button className="ruletext" onClick={(e)=>this.withdrawapprovalofnewmember(e,item._id)}>Withdraw Approval?</button>}
               {this.state.users&&<h4 className="ruletext">{approval}% of members approve this potential member, {item.approval.length}/{this.state.users.length}. {item.approval.length>0&&<span>Approvees=</span>}</h4>}
               {approveenames&&approveenames.map((item,index)=>{return(<><h4 className="ruletext">{item}{(index<(approveenames.length-2))?", ":(index<(approveenames.length-1))?" and ":"."}</h4></>)})}
               <div className="percentagecontainer"><div style={{width:width}} className="percentage"></div></div>
                {!item.viewdetails&&<><h3 className="ruletext">  {item.name}  </h3><h4 className="ruletext">{item.performancedescription}  </h4></>}
               {item.viewdetails&&<>
                 {item.viewdetails&&<><h3 style={{textAlign:"center"}}>  {item.name}  </h3><h4 style={{textAlign:"center"}}>{item.performancedescription}  </h4></>}

               <a href={item.website}><h3 style={{textAlign:"center",color:"blue"}}>Website</h3></a>
               <a href={item.youtube}><h3 style={{textAlign:"center",color:"blue"}}>Youtube Channel</h3></a>
               <h3 style={{textAlign:"center"}}>{item.expertise}</h3>

                 <h3 style={{textAlign:"center"}}>{item.performancedescription}</h3>
                 <h3 style={{textAlign:"center"}}><strong>Rates:</strong> {item.rates}</h3>
                 <h3 style={{textAlign:"center"}}>Images</h3>
                 <div style={{marginBottom:"40vw"}}>
                 <AwesomeSlider style={{marginLeft:"20vw",width:"50vw", zIndex: 1, position:"absolute"}}>
                 {item.images&&item.images.map(item=>{return (<div><Image style={{width:"100%"}} cloudName="julianbullmagic" publicId={item} /></div>)})}
                 </AwesomeSlider>
                 </div>
                 <h3 style={{textAlign:"center"}}><strong>Youtube Videos</strong></h3>
                 <div style={{marginBottom:"40vw"}}>
                 <AwesomeSlider style={{marginLeft:"20vw",width:"50vw", zIndex: 1, position:"absolute"}}>
                 {item.promovideos&&item.promovideos.map(item=>{return (<div style={{width:"100%"}}><iframe style={{width:"100%"}} src={item}/></div>)})}
                 </AwesomeSlider>
                 </div>

                 </>}

               </div>
             </>
             )})
             }



                 return (
                   <>
                   <br />
                   <h2>Approve New Members</h2>
                   <p>New Member suggestions that have less than 75% approval and are more than a week old
                   will be deleted. As soon as they reach 75%, they will become a member with voting rights</p>

                   {newmemberscomponent}
<br/>
<br/>
                   </>
                 );
               }
             }
