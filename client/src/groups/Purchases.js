import React, { Component } from 'react';
import CreatePurchaseForm from './CreatePurchaseForm'
import {Image} from 'cloudinary-react'
import auth from './../auth/auth-helper'
import io from "socket.io-client";
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
const mongoose = require("mongoose");
const MILLISECONDS_IN_A_DAY=86400000
const MILLISECONDS_IN_A_WEEK=604800000

export default class Purchases extends Component {

    constructor(props) {
           super(props);
           this.state = {
             location:"",
             title:"",
             users:props.users,
             purchases:[],
             page:1,
             pageNum:[],
             currentPageData:[],
             redirect: false,
             updating:false
           }
           let socket
           this.updatePurchases= this.updatePurchases.bind(this)
           this.sendPurchaseNotification=this.sendPurchaseNotification.bind(this)
              }


           componentDidMount(){
             let server = "http://localhost:5000";

             if(process.env.NODE_ENV=="production"){
               this.socket=io();
             }
             if(process.env.NODE_ENV=="development"){
               this.socket=io(server);
             }
             this.getPurchases()
             }

             componentWillReceiveProps(nextProps) {
               if (nextProps.users !== this.props.users) {
                 this.setState({users:nextProps.users})
               }
               if (nextProps.group !== this.props.group) {
                 this.setState({group:nextProps.group})
               }
             }

             decidePage(e,pagenum){
                console.log("decide page",(pagenum*10-10),pagenum*10)
                let currentpage=this.state.purchases.slice((pagenum*10-10),pagenum*10)
                console.log("currentpage",currentpage)
                this.setState({page:pagenum,currentPageData:currentpage})
              }

async getPurchases(){
  await fetch(`/purchases`)
      .then(response => response.json())
      .then(data=>{
        let purchases=data
        purchases.reverse()
     this.setState({purchases:purchases})

    let currentpage=purchases.slice(0,10)
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


 updatePurchases(newpurchase){
 var purchasescopy=JSON.parse(JSON.stringify(this.state.purchases))
 purchasescopy.reverse()
 purchasescopy.push(newpurchase)
 purchasescopy.reverse()
 this.setState({ purchases:purchasescopy})

        let current=purchasescopy.slice((this.state.page*10-10),this.state.page*10)
        console.log(current)
        this.setState({currentPageData:current})
}






         async deletePurchase(event,item){
              console.log(item)

           var purchasescopy=JSON.parse(JSON.stringify(this.state.purchases))
           function checkPurchase(purchase) {
             return purchase._id!=item._id
           }

               var filteredapproval=purchasescopy.filter(checkPurchase)
         console.log(filteredapproval)

         let current=filteredapproval.slice((this.state.page*10-10),this.state.page*10)
         console.log(current)
         this.setState({currentPageData:current})

           this.setState({purchases:filteredapproval})
           var d = new Date();
           var n = d.getTime();


           let chatMessage=`deleted a purchase suggestion called ${item.title}`
           let userId=auth.isAuthenticated().user._id
           let userName=auth.isAuthenticated().user.name
           let nowTime=n
           let type="text"
           let groupId="Performers"
           let groupTitle="Performers"

           this.socket.emit("Input Chat Message", {
             chatMessage,
             userId,
             userName,
             nowTime,
             type,
             groupId,
             groupTitle});

           const options = {
             method: 'delete',
             headers: {
               'Content-Type': 'application/json'
             },
                body: ''
           }

           await fetch("/purchases/"+item._id, options)

               let userscopy=JSON.parse(JSON.stringify(this.state.users))
               userscopy=userscopy.filter(item=>item.events)
               let emails=userscopy.map(item=>{return item.email})


               let notification={
                 emails:emails,
                 subject:"Purchase Suggestion Deleted",
                 message:`The purchase suggestion called ${item.title} has been deleted.`
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
         }


       approveofpurchase(e,id){
var purchasescopy=JSON.parse(JSON.stringify(this.state.purchases))
function checkPurchase() {
  return id!==auth.isAuthenticated().user._id
}
for (var p of purchasescopy){

  let votesfrommembers=[]
  let memberids=this.state.users.map(item=>item._id)

  for (let vote of p.approval){
    if (memberids.includes(vote)){
      votesfrommembers.push(vote)
    }
  }
  p.approval=votesfrommembers

  if (p._id==id){
 if(!p.approval.includes(auth.isAuthenticated().user._id)){
   p.approval.push(auth.isAuthenticated().user._id)

                   if(p.approval>=10&&!p.notificationsent){
                     this.sendPurchaseNotification(p)
                   }
 }
  }
}

this.setState({purchases:purchasescopy})
let current=purchasescopy.slice((this.state.page*10-10),this.state.page*10)
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

         fetch("/purchases/approveofpurchase/" + id +"/"+ auth.isAuthenticated().user._id, options
).then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })

}


       withdrawapprovalofpurchase(e,id){
         var purchasescopy=JSON.parse(JSON.stringify(this.state.purchases))
         function checkpurchase(userid) {
           return userid!=auth.isAuthenticated().user._id
         }
         for (var p of purchasescopy){
           let votesfrommembers=[]
           let memberids=this.state.users.map(item=>item._id)

           for (let vote of p.approval){
             if (memberids.includes(vote)){
               votesfrommembers.push(vote)
             }
           }
           p.approval=votesfrommembers
           if (p._id==id){

             var filteredapproval=p.approval.filter(checkpurchase)
             p.approval=filteredapproval
             let approval=(p.approval.length/this.state.users.length)*100
             if(approval>=10&&!p.notificationsent){
               this.sendPurchaseNotification(p)
             }
           }
         }


         this.setState({purchases:purchasescopy})
         let current=purchasescopy.slice((this.state.page*10-10),this.state.page*10)
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

         fetch("/purchases/withdrawapprovalofpurchase/" + id +"/"+ auth.isAuthenticated().user._id, options
).then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })

       }


       sendPurchaseNotification(item){
         if(!item.notificationsent){
           var purchasescopy=JSON.parse(JSON.stringify(this.state.purchases))
           for (var purch of purchasescopy){
             if (purch._id==item._id){
               purch.notificationsent=true
       }}
       this.setState({purchases:purchasescopy})
       let current=purchasescopy.slice((this.state.page*10-10),this.state.page*10)
       console.log(current)
       this.setState({currentPageData:current})

           console.log("sending rule notification",this.state.users)
           let userscopy=JSON.parse(JSON.stringify(this.state.users))
           console.log(userscopy.length)
           let emails=userscopy.map(item=>{return item.email})
           console.log(emails)
           console.log(emails.length)

           console.log(emails)
             let notification={
               emails:emails,
               subject:"New Purchase Suggestion",
               message:`${item.createdby.name} suggested the purchase: ${item.title}`
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

           fetch("/purchases/notificationsent/"+item._id, optionstwo
           ) .then(res => {
           console.log(res);
           }).catch(err => {
           console.log(err);
           })
         }
       }


       areYouSure(e,item){
         console.log(item)
           let rulescopy=JSON.parse(JSON.stringify(this.state.purchases))
           console.log(rulescopy)
           for (let rule of rulescopy){
             if (rule._id==item._id){
               rule.areyousure=true
             }}
             console.log(rulescopy)

             let current=rulescopy.slice((this.state.page*10-10),this.state.page*10)
             this.setState({purchases:rulescopy,currentPageData:current})
           }

           areYouNotSure(e,item){
             console.log(item)
               let rulescopy=JSON.parse(JSON.stringify(this.state.purchases))
               console.log(rulescopy)
               for (let rule of rulescopy){
                 if (rule._id==item._id){
                   rule.areyousure=false
                 }}
                 console.log(rulescopy)
                 let current=rulescopy.slice((this.state.page*10-10),this.state.page*10)
                 this.setState({purchases:rulescopy,currentPageData:current})
               }

  render() {
    console.log("USERS IN EVENTS",this.props.users)
    var d = new Date();
    var n = d.getTime();

            var purchasescomponent=<h3>no suggested purchases</h3>
            if (this.state.users&&this.state.purchases){
              purchasescomponent=this.state.currentPageData.map(item => {
                let votesfrommembers=[]
                let memberids=this.state.users.map(item=>item._id)

                for (let vote of item.approval){
                  if (memberids.includes(vote)){
                    votesfrommembers.push(vote)
                  }
                }
                item.approval=votesfrommembers
                let approval=<></>
                if(this.state.users){
                  approval=Math.round((item.approval.length/this.state.users.length)*100)
                }


                let approveenames=[]
                for (let user of this.state.users){
                  for (let approvee of item.approval){
                    if (approvee==user._id){
                      approveenames.push(user.name)
                    }
                  }
                }

                if ((n-item.timecreated)>604800000){
                  this.deletePurchase(item)
                }

                return(
<>
<div key={item._id} className="leadbox">
<div className="leadcol1">
{item.title&&<h3>Title: {item.title}</h3>}
{item.description&&<h4>Description: {item.description}</h4>}
{item.price&&<h4>Price: {item.price}</h4>}
{item.quantity&&<h4>Quantity: {item.quantity}</h4>}
{this.state.users&&<h4>{approval}% of members want to share in this purchase, {item.approval.length}/{this.state.users.length}</h4>}
{approveenames&&approveenames.map((item,index)=>{return(<><h4 className="ruletext">{item}{(index<(approveenames.length-2))?", ":(index<(approveenames.length-1))?" and ":"."}</h4></>)})}
{!item.approval.includes(auth.isAuthenticated().user._id)&&<button onClick={(e)=>this.approveofpurchase(e,item._id)}>Contribute to this purchase?</button>}
{item.approval.includes(auth.isAuthenticated().user._id)&&<button onClick={(e)=>this.withdrawapprovalofpurchase(e,item._id)}>Don't contribute to this purchase?</button>}
{((item.createdby==auth.isAuthenticated().user._id)&&!item.areyousure)&&
  <button className="ruletext deletebutton" id={item.title} onClick={(e)=>this.areYouSure(e,item)}>Delete Purchase?</button>}
  {item.areyousure&&<button className="ruletext deletebutton" id={item.title} onClick={(e)=>this.areYouNotSure(e,item)}>Not sure</button>}
  {item.areyousure&&<button className="ruletext deletebutton" id={item.title} onClick={(e)=>this.deletePurchase(e,item)}>Are you sure?</button>}
</div>
<div className="leadcol2">
{item.images&&<>
<AwesomeSlider style={{width:"40vw",position: "absolute",  zIndex: +1}}>
{item.images.map(item=>{return <div><Image cloudName="julianbullmagic" publicId={item} /></div>})}
</AwesomeSlider></>}
</div>
</div>
</>

)})
              }







    return (
      <>
      <CreatePurchaseForm updatePurchases={this.updatePurchases}/>
      <h2><strong>Possible Purchases </strong></h2>
      {(this.state.pageNum&&this.state.purchases.length>10)&&<h4 style={{display:"inline"}}>Choose Page</h4>}
{(this.state.pageNum&&this.state.purchases)&&this.state.pageNum.map((item,index)=>{
        return (<>
          <button style={{display:"inline",opacity:(index+1==this.state.page)?"0.5":"1"}}  onClick={(e) => this.decidePage(e,item)}>{item}</button>
          </>)
      })}
      {purchasescomponent}
    {(this.state.pageNum&&this.state.purchases.length>10)&&  <h4 style={{display:"inline"}}>Choose Page</h4>}
{(this.state.pageNum&&this.state.purchases)&&this.state.pageNum.map((item,index)=>{
        return (<>
          <button style={{display:"inline",opacity:(index+1==this.state.page)?"0.5":"1"}}  onClick={(e) => this.decidePage(e,item)}>{item}</button>
          </>)
      })}
      </>
    );
  }
}
