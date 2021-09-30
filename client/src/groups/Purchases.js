import React, { Component } from 'react';
import CreatePurchaseForm from './CreatePurchaseForm'
import {Image} from 'cloudinary-react'
import auth from './../auth/auth-helper'
import io from "socket.io-client";
import AwesomeSlider from 'react-awesome-slider';
import 'react-awesome-slider/dist/styles.css';
const mongoose = require("mongoose");


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
           this.updatePurchases= this.updatePurchases.bind(this)
              }


           componentDidMount(){
             let server = "http://localhost:5000";
             this.socket = io(server);
             this.getPurchases()
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

           await fetch("/purchases/"+item._id, options)

         }


       approveofpurchase(e,id){
var purchasescopy=JSON.parse(JSON.stringify(this.state.purchases))
function checkPurchase() {
  return id!==auth.isAuthenticated().user._id
}
for (var p of purchasescopy){
  if (p._id==id){

 if(!p.approval.includes(auth.isAuthenticated().user._id)){
   p.approval.push(auth.isAuthenticated().user._id)
 }

this.setState({purchases:purchasescopy})
  }
}

this.setState({purchases:purchasescopy})
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
           if (p._id==id){


             var filteredapproval=p.approval.filter(checkpurchase)
             p.approval=filteredapproval
           }
         }
         this.setState({purchases:purchasescopy})

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








  render() {
    console.log("USERS IN EVENTS",this.props.users)
    var d = new Date();
    var n = d.getTime();

            var purchasescomponent=<h3>no suggested purchases</h3>
            if (this.state.users&&this.state.purchases){
              purchasescomponent=this.state.currentPageData.map(item => {

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
<div className="leadbox">
<div className="leadcol1">
<h3>{item.title}</h3>
<h4>{item.description}</h4>
<h4>{item.price}</h4>
<h4>{item.quantity}</h4>
{this.state.users&&<h4>{approval}% of members want to share in this purchase, {item.approval.length}/{this.state.users.length}</h4>}
{approveenames&&approveenames.map((item,index)=>{return(<><h4 className="ruletext">{item}{(index<(approveenames.length-2))?", ":(index<(approveenames.length-1))?" and ":"."}</h4></>)})}
{!item.approval.includes(auth.isAuthenticated().user._id)&&<button onClick={(e)=>this.approveofpurchase(e,item._id)}>Contribute to this purchase?</button>}
{item.approval.includes(auth.isAuthenticated().user._id)&&<button onClick={(e)=>this.withdrawapprovalofpurchase(e,item._id)}>Don't contribute to this purchase?</button>}
<button onClick={(e)=>this.deletePurchase(e,item)}>Delete?</button>
</div>
<div className="leadcol2">
<AwesomeSlider style={{width:"25vw",position: "absolute",  zIndex: +1}}>
{item.images.map(item=>{return <div><Image cloudName="julianbullmagic" publicId={item} /></div>})}
</AwesomeSlider>
</div>
</div>
</>

)})
              }







    return (
      <>
      <br/>
      <h2>Suggest a group purchase</h2>
      <CreatePurchaseForm updatePurchases={this.updatePurchases}/>
      <h2><strong>Possible Purchases </strong></h2>
      <h4 style={{display:"inline"}}>Choose Page</h4>
{this.state.pageNum&&this.state.pageNum.map(item=>{
        return (<>
          <button style={{display:"inline"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
          </>)
      })}
      {purchasescomponent}
      <h4 style={{display:"inline"}}>Choose Page</h4>
{this.state.pageNum&&this.state.pageNum.map(item=>{
        return (<>
          <button style={{display:"inline"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
          </>)
      })}
      </>
    );
  }
}
