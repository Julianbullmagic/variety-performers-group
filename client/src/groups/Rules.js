import React, { Component } from 'react';
import {Image} from 'cloudinary-react'
import CreateRuleForm from './CreateRuleForm'
import auth from './../auth/auth-helper'
import io from "socket.io-client";

const mongoose = require("mongoose");


export default class Rules extends Component {

    constructor(props) {
           super(props);
           this.state = {
             users:props.users,
             rules: [],
             page:1,
             pageNum:[],
             currentPageData:[],
             redirect: false,
             updating:false,
             participate:props.participate
           }
           this.updateRules= this.updateRules.bind(this)

}



           componentDidMount(props){
             let server = process.env.PORT||"http://localhost:5000";
             this.socket = io(server);
             this.getRules()
             }

            decidePage(e,pagenum){
               console.log("decide page",(pagenum*10-10),pagenum*10)
               let currentpage=this.state.rules.slice((pagenum*10-10),pagenum*10)
               console.log("currentpage",currentpage)
               this.setState({page:pagenum,currentPageData:currentpage})
             }

           async getRules(){
             await fetch(`/rules`)
                 .then(response => response.json())
                 .then(data=>{
                   console.log("rules",data)
                   let rules=data
                   rules.reverse()
                this.setState({rules:rules})

               console.log("decide rules",0,10)
               let currentpage=rules.slice(0,10)
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

           updateRules(newrule){
           var rulescopy=JSON.parse(JSON.stringify(this.state.rules))

           rulescopy.reverse()
           rulescopy.push(newrule)
           rulescopy.reverse()

     console.log("page",this.state.page)
           let current=rulescopy.slice((this.state.page*10-10),this.state.page*10)
           console.log(current)

           this.setState({ rules:rulescopy,currentPageData:current})
         }




async deleteRule(event,item){

  var rulescopy=JSON.parse(JSON.stringify(this.state.rules))
  function checkRule(rule) {
    return rule._id!=item
  }
  console.log("ruleid",item)

      var filteredapproval=rulescopy.filter(checkRule)
console.log(rulescopy.length)
console.log(filteredapproval.length)
let current=filteredapproval.slice((this.state.page*10-10),this.state.page*10)
console.log(current)

this.setState({ rules:filteredapproval,currentPageData:current})


  var d = new Date();
  var n = d.getTime();


  let chatMessage=`deleted an rule; ${item.rule}`
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

  await fetch("/rules/"+item, options)


const optionstwo = {
method: 'put',
headers: {
'Content-Type': 'application/json'
},
body: ''
}

await fetch("/groups/removerulefromgroup/"+this.state.id+"/"+item, optionstwo)

}


       approveofrule(e,id){
var rulescopy=JSON.parse(JSON.stringify(this.state.rules))
function checkRule() {
  return id!==auth.isAuthenticated().user._id
}
for (var rule of rulescopy){
  if (rule._id==id){

 if(!rule.approval.includes(auth.isAuthenticated().user._id)){
   rule.approval.push(auth.isAuthenticated().user._id)
 }

this.setState({rules:rulescopy})
  }
}

this.setState({rules:rulescopy})
         const options = {
           method: 'put',
           headers: {
             'Content-Type': 'application/json'
           },
              body: ''
         }

         fetch("/rules/approveofrule/" + id +"/"+ auth.isAuthenticated().user._id, options
).then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })

}


       withdrawapprovalofrule(e,id){
         var rulescopy=JSON.parse(JSON.stringify(this.state.rules))
         function checkRule(userid) {
           return userid!=auth.isAuthenticated().user._id
         }
         for (var rule of rulescopy){
           if (rule._id==id){


             var filteredapproval=rule.approval.filter(checkRule)
             rule.approval=filteredapproval
           }
         }
         this.setState({rules:rulescopy})

         const options = {
           method: 'put',
           headers: {
             'Content-Type': 'application/json'
           },
              body: ''
         }

         fetch("/rules/withdrawapprovalofrule/" + id +"/"+ auth.isAuthenticated().user._id, options
) .then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })

       }





  render(props) {
    console.log("users in RULES",this.state.users)
    var d = new Date();
    var n = d.getTime();

var rulescomponent=<h3>no rules</h3>
if (this.state.rules){


    rulescomponent=this.state.currentPageData.map(item => {
    let approval=<></>
    if(this.state.users){
      approval=Math.round((item.approval.length/this.state.users.length)*100)
    }
    if (approval<75&&(n-item.timecreated)>604800000){
      this.deleteRule(item)
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
  <div className="rule">
  <h3 className="ruletext">{item.rule}  </h3>
  {(!item.approval.includes(auth.isAuthenticated().user._id))&&<button className="ruletext" onClick={(e)=>this.approveofrule(e,item._id)}>Approve this rule?</button>}
  {(item.approval.includes(auth.isAuthenticated().user._id))&&<button className="ruletext" onClick={(e)=>this.withdrawapprovalofrule(e,item._id)}>Withdraw Approval?</button>}
  <h4 className="ruletext">  {item.explanation}  </h4>

  {this.state.users&&<h4 className="ruletext">{approval}% of members approve this rule, {item.approval.length}/{this.state.users.length}. Approvees=</h4>}
  {approveenames&&approveenames.map((item,index)=>{return(<><h4 className="ruletext">{item}{(index<(approveenames.length-2))?", ":(index<(approveenames.length-1))?" and ":"."}</h4></>)})}
  <div className="percentagecontainer"><div style={{width:width}} className="percentage"></div></div>
  </div>
</>
)})
}



    return (
      <>
      <br />
      <h2>Propose a Rule</h2>
      <CreateRuleForm updateRules={this.updateRules}/>
      <h2>Group Rules</h2>
      <p>Rules that have less than 75% approval and are more than a week old will be deleted</p>
      <h4 style={{display:"inline"}}>Choose Page</h4>
{this.state.pageNum&&this.state.pageNum.map(item=>{
        return (<>
          <button style={{display:"inline"}} onClick={(e) => this.decidePage(e,item)}>{item}</button>
          </>)
      })}
      {rulescomponent}
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
