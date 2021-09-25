const expect = require('chai').expect;
let chai = require("chai");
let chaiHttp = require("chai-http");
const puppeteer = require('puppeteer');
let app = require("../server");
const request = require('supertest');
const mongoose = require("mongoose");
chai.use(chaiHttp);
chai.should();
chai.use(require('chai-things'));
var geodist = require('geodist')
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
const User = require("./../models/user.model");
const Group = require("./../models/group.model");
const SuperGroup = require("./../models/supergroup.model");



var groupsdata

const host = "http://localhost:3000";
let page;

// the test suite
describe('My test suite', async function () {

  // open a new browser tab and set the page variable to point at it
  before (async function () {
    global.expect = expect;
    global.browser = await puppeteer.launch( { headless: false } );
    page = await browser.newPage();
    page.setViewport({width: 1187, height: 1000});

  });

  // close the browser when the tests are finished
  after (async function () {
    await page.close();
    await browser.close();

  });






//
//   it("It should create supergroup", async () =>{
//
//     var originalnormalgroups=await chai.request(app)
//               .get("/groups/findgroups")
//
//     var users=await User.find({ })
//     .exec()
//           var userIds=users.map(user=>{return user._id})
//           console.log(userIds)
//           console.log("groupId",originalnormalgroups.body.data[0]['_id'])
//
//
//
//             var newSuperGroup=new SuperGroup({
//               _id:mongoose.Types.ObjectId(),
//               title:"biology",
//               description:"a group of biologists",
//               location:"Petersham",
//               centroid:[-33.8962, 151.1541],
//               allmembers:userIds
//             });
//
//
//
//           newSuperGroup.save((err,docs) => {
//                if(err){
//                  console.log(err);
//                }else{
//                  // console.log(docs);
//
//                }
//              })
//
//
// })

      //     it("It should add users to groups", async () =>{
      //
      //       var originalnormalgroups=await chai.request(app)
      //                 .get("/groups/findgroups")
      //
      //       var users=await User.find({ })
      //       .exec()
      //             var userIds=users.map(user=>{return user._id})
      //             console.log(userIds)
      //             console.log("groupId",originalnormalgroups.body.data[0]['_id'])
      //
      //             SuperGroup.findByIdAndUpdate(originalnormalgroups.body.data[0]['_id'], { members:userIds },
      //                                       function (err, docs) {
      //               if (err){
      //                   console.log(err)
      //               }
      //               else{
      //                   console.log("Updated group : ", docs);
      //               }
      //           })
      // })

      function makeid(length) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
      }
      return result;
      }

      function shuffle(array) {
        var currentIndex = array.length,  randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;

          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }

        return array;
      }


      it("It should create candidates in all groups at all levels", async () =>{

          var originalgroups=await chai.request(app)
                    .get("/groups/findgroups")



var count=0
for(var group of originalgroups.body.data){

async function addCandidatesToGroups(level,groupdata){
  var shuffledusers=shuffle(groupdata.members)

  var shuffledusersslice=shuffledusers.slice(0,7)

for(var user of shuffledusersslice){
  console.log("title",groupdata.title)
var randstring=makeid(5)
var d = new Date();
var n = d.getTime();
var memberids=groupdata.allmembers
var shuffled=shuffle(memberids)
var x=Math.random()*groupdata.allmembers.length
var votes=shuffled.slice(0,x)
var id=mongoose.Types.ObjectId()
const newCandidate= {
  _id:id,
  userId:user._id,
  groupId:groupdata._id,
  grouptitle:groupdata.title||"localgroup",
  level:level,
  name: user.name,
  expertise:user.name,
  timecreated:new Date().getTime(),
  votes:votes
}
console.log(newCandidate.level)
count+=1
const res=await chai.request(app)
        .post('/groups/nominatecandidate')
.send(newCandidate)

await chai.request(app)
      .put("/groups/addnomineetogroupobject/" + res.body.id + "/" +groupdata._id)
      .send({})

}
}

if(group.level==0){
await addCandidatesToGroups(0,group)
}
if(group.level==1){
await addCandidatesToGroups(1,group)
}
if(group.level==2){
await addCandidatesToGroups(2,group)
}
if(group.level==3){
await addCandidatesToGroups(3,group)
}
if(group.level==4){
await addCandidatesToGroups(4,group)
}


console.log("count",count)

}

})

//
//           it("It should create rules in all groups at all levels", async () =>{
//
//
//               var originalgroups=await chai.request(app)
//                         .get("/groups/findgroups")
//
// function makeid(length) {
//   var result           = '';
//   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   var charactersLength = characters.length;
//   for ( var i = 0; i < length; i++ ) {
//     result += characters.charAt(Math.floor(Math.random() *
// charactersLength));
//  }
//  return result;
// }
//
//
// for(var group of originalgroups.body.data){
//
// async function addRulesToGroups(level,groupdata){
//   for(var x=0;x<5;x++){
//
//   var ruleId=mongoose.Types.ObjectId()
//   var randstring=makeid(5)
//   var d = new Date();
//   var n = d.getTime();
//   const res1=await chai.request(app)
//             .post('/rules/createrule/'+ruleId)
//   .send({rule:`a test rule ${randstring}`,grouptitle:groupdata.title||"localgroup",group:groupdata._id,timecreated:n,level:level,approval:[...groupdata.members.slice(0,25)]})
// console.log(groupdata.members.slice(0,25))
//   const res2=await chai.request(app)
//           .put('/groups/addruletogroup/'+groupdata._id+"/"+ruleId)
//
// }
// }
//
//
//   console.log(group)
//   if(group.level==0){
//   await addRulesToGroups(0,group)
//   }
//   if(group.level==1){
//   await addRulesToGroups(1,group)
//   }
//   if(group.level==2){
//     await addRulesToGroups(2,group)
//   }
//   if(group.level==3){
//   await addRulesToGroups(3,group)
//   }
//   if(group.level==4){
// await addRulesToGroups(4,group)
//   }
//
//
//
//
// }
//
//
// })
//
//
// it("It should create events in all groups at all levels", async () =>{
//
//   var originalgroups=await chai.request(app)
//             .get("/groups/findgroups")
// console.log("originalgroups.body.data",originalgroups.body.data)
// function makeid(length) {
// var result           = '';
// var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// var charactersLength = characters.length;
// for ( var i = 0; i < length; i++ ) {
// result += characters.charAt(Math.floor(Math.random() *
// charactersLength));
// }
// return result;
// }
//
//
// async function addEventsToGroups(level,groupdata){
// for(var x=0;x<5;x++){
//
// var eventId=mongoose.Types.ObjectId()
// var randstring=makeid(5)
// var d = new Date();
// var n = d.getTime();
// const res1=await chai.request(app)
//   .post('/events/createevent/'+eventId)
// .send({title:`a test event ${randstring}`,grouptitle:groupdata.title||"localgroup",description:"a fun event",location:"Petersham",images:["xuafvwhugqpxevav7fjb"],group:groupdata._id,timecreated:n,level:level,approval:[...groupdata.members.slice(0,25)]})
// console.log("ids",groupdata._id,eventId)
//   const res2=await chai.request(app)
//   .put('/groups/addeventtogroup/'+groupdata._id+"/"+eventId)
//
// }
// }
//
// for(var group of originalgroups.body.data){
// console.log("group",group)
// if(group.level==0){
// await addEventsToGroups(0,group)
// }
//
// if(group.level==1){
// await addEventsToGroups(1,group)
// }
// if(group.level==2){
// await addEventsToGroups(2,group)
// }
// if(group.level==3){
// await addEventsToGroups(3,group)
// }
// if(group.level==4){
// await addEventsToGroups(4,group)
// }
//
//
//
//
// }
//
//
// })


})
