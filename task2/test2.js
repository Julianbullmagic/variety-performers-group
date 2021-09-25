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

  // @todo tests go here!!!
  it('create rule in local group', async function () {

    var ruleId=mongoose.Types.ObjectId()
    var agent = chai.request.agent(app)

    const res1=await chai.request(app)
              .get("/localgroup/findgroups")

    agent.post('/rules/createrule/'+ruleId)
    .send({rule:"a test rule"}).then(function (res) {
expect(res).to.have.status(201);
return agent.put('/localgroup/addruletogroup/'+res1["body"]["data"][0]["_id"]+"/"+ruleId)
.then(function (res) {
expect(res).to.have.status(200);
return agent.put('/localgroup/removerulefromgroup/'+res1["body"]["data"][0]["_id"]+"/"+ruleId)
.then(function (res) {
expect(res).to.have.status(200);
agent.close()
})
})
})})

it('create rule in normal group', async function () {

  var ruleId=mongoose.Types.ObjectId()
  var agent = chai.request.agent(app)

  const res1=await chai.request(app)
            .get("/groups/findgroups")
  agent.post('/rules/createrule/'+ruleId)
  .send({rule:"a test rule"}).then(function (res) {
expect(res).to.have.status(201);
return agent.put('/groups/addruletogroup/'+res1["body"]["data"][0]["_id"]+"/"+ruleId)
.then(function (res) {
expect(res).to.have.status(200);
return agent.put('/groups/removerulefromgroup/'+res1["body"]["data"][0]["_id"]+"/"+ruleId)
.then(function (res) {
expect(res).to.have.status(200);
agent.close()
})
})
})
})



          it("It should create 10 users and split normal group", async () =>{

            var originalgroups=await chai.request(app)
                      .get("/groups/findgroups")
            var originalgroup=originalgroups.body.data[0]
            console.log("original group in split groups",originalgroup)
                 var addresses=[[-33.8962, 151.1541],[-33.8935, 151.1644],[-33.8949, 151.1444],[-33.8840, 151.1141],[-33.8977, 151.1885],[-33.8978, 151.1785],[-33.8798, 151.1870],[-33.8822, 151.1970],
                 [-33.8693, 151.1296],[-33.8628, 151.0796],[-32.9482, 151.6568],[-32.9465, 151.7599],[-32.8817, 151.7178],
                 [-34.8962, 151.1541],[-32.8935, 151.1644],[-33.8949, 152.1444],[-33.8840, 150.1141],[-33.8977, 161.1885],[-33.8978, 171.1785],[-33.8798, 181.1870],[-33.8822, 131.1970],
                 [-35.8693, 151.1296],[-31.8628, 151.0796],[-32.9482, 153.6568],[-32.9465, 149.7599],[-32.8817, 161.7178],
                 [-36.8962, 151.1541],[-30.8935, 151.1644],[-33.8949, 154.1444],[-33.8840, 148.1141],[-33.8977, 161.1885],[-33.8978, 171.1785],[-33.8798, 181.1870],[-33.8822, 131.1970],
                 [-37.8693, 151.1296],[-29.8628, 151.0796],[-32.9482, 155.6568],[-32.9465, 147.7599],[-32.8817, 161.7178],
                 [-38.8962, 151.1541],[-28.8935, 151.1644],[-33.8949, 156.1444],[-33.8840, 146.1141],[-33.8977, 161.1885],[-33.8978, 171.1785],[-33.8798, 181.1870],[-33.8822, 131.1970],
                 [-39.8693, 151.1296],[-27.8628, 151.0796],[-32.9482, 157.6568],[-32.9465, 145.7599],[-32.8817, 161.7178],
                 [-40.8962, 151.1541],[-26.8935, 151.1644],[-33.8949, 158.1444],[-33.8840, 144.1141],[-33.8977, 161.1885],[-33.8978, 171.1785],[-33.8798, 181.1870],[-33.8822, 131.1970],
                 [-41.8693, 151.1296],[-25.8628, 151.0796],[-32.9482, 159.6568],[-32.9465, 143.7599],[-32.8817, 161.7178],
                 [-42.8962, 151.1541],[-24.8935, 151.1644],[-33.8949, 160.1444],[-33.8840, 142.1141],[-33.8977, 161.1885],[-33.8978, 171.1785],[-33.8798, 181.1870],[-33.8822, 131.1970],
                 [-43.8693, 151.1296],[-23.8628, 151.0796],[-32.9482, 161.6568],[-32.9465, 141.7599],[-32.8817, 161.7178]]
                 var userIds=[]
                 for(var x=0;x<400;x++){
                   var agent = chai.request.agent(app)

                               var randnum=Math.floor(Math.random()*60)
                               var randcoords=addresses[randnum]
                               var randstring= Math.random().toString(36).substring(2, 9)
                               var userId=mongoose.Types.ObjectId()
                               userIds.push(userId.toString())
                              var values={
                                _id:userId.toString(),
                                 name: randstring,
                                 email: `${randstring}@gmail.com`,
                                 coordinates:randcoords,
                                 expertise: randstring,
                                 password: "mmmmmm",
                               }

                               console.log(values)


                               agent.post('/groups/createuser')
                               .send({user:values}).then(function (res) {
                                 console.log("add user to group",originalgroup._id,res.body.data._id)

                             expect(res).to.have.status(201);

                             return agent.put('/groups/addusertogroup/'+originalgroup._id+"/"+res.body.data._id)
                             .then(function (res) {
                             expect(res).to.have.status(200);
                             agent.close()
                             return agent.put('/groups/removeuserfromgroup/'+groupId+"/"+res.body.data._id)
                             .then(function (res) {
                             expect(res).to.have.status(200);

                             agent.close()
                             })

                             })
                           })}})
            //   }
            //
            //         await page.goto("http://localhost:3000/signin")
            //         await page.waitForSelector("#email", {visible: true, timeout: 3000 });
            //
            //         await page.type('#email', "Julianbullmagic@gmail.com", { delay: 100 });
            //         await page.type('#password', "mmmmmm", { delay: 100 });
            //         await page.click('#submit')
            //         await page.waitForNavigation()
            //         await page.goto("http://localhost:3000/groups")
            //         await page.waitForTimeout(4000)
            //         await page.waitForSelector("#viewgrouplist", {visible: true, timeout: 3000 });
            //         await page.click('#viewgrouplist')
            //         await page.waitForSelector("#viewallgroups", {visible: true, timeout: 3000 });
            //          await page.click('#viewallgroups')
            //          await page.waitForSelector(".gotogroup", {visible: true, timeout: 3000 });
            //          const grouplink = await page.$eval('.gotogroup', el => el.href)
            //          await page.goto(grouplink)
            //
            //          var groupid=grouplink.split("/")
            //
            //
            //
            //          var ruleId=mongoose.Types.ObjectId()
            //
            //
            //
            //
            //
            //            await page.waitForTimeout(100000)
            //
            //






//
//           // it("It should create 10 users and split local group", async () =>{
//           //
//           //        var addresses=["Petersham","Stanmore","Lewisham","Croydon","Macdonaldtown","Newtown","Glebe","Ultimo","Five Dock","Homebush"]
//           //        var userIds=[]
//           //
//           //        const res=await chai.request(app)
//           //             .get("/localgroup/findgroups")
//           //
//           //                 res.body.data.should.all.have.property('centroid')
//           //                 res.body.data.should.all.have.property('rules')
//           //                 res.body.data.should.all.have.property('members')
//           //
//           //                 for(var x=0;x<5;x++){
//           //                   var randnum=Math.floor(Math.random()*10)
//           //                   var randaddress=addresses[randnum]
//           //                   var randstring= Math.random().toString(36).substring(2, 9)
//           //                   var userId=mongoose.Types.ObjectId()
//           //                   userIds.push(userId.toString())
//           //                  var values={
//           //                    userId:userId.toString(),
//           //                     name: randstring,
//           //                     email: `${randstring}@gmail.com`,
//           //                     address:`${randaddress} Sydney`,
//           //                     expertise: randstring,
//           //                     password: "mmmmmm",
//           //                     groupCoordinates:res.body.data
//           //                   }
//           //                   createUser(values)
//           //               }
//           //
//           //
//           //           console.log("res",res["body"]["data"][0])
//           //           console.log("userIds",userIds)
//           //           await page.goto("http://localhost:3000/signin")
//           //           await page.waitForSelector("#email", {visible: true, timeout: 3000 });
//           //
//           //           await page.type('#email', "Julianbullmagic@gmail.com", { delay: 100 });
//           //           await page.type('#password', "mmmmmm", { delay: 100 });
//           //           await page.click('#submit')
//           //           await page.waitForNavigation()
//           //           await page.goto("http://localhost:3000/groups")
//           //           await page.waitForTimeout(4000)
//           //           await page.waitForSelector("#viewgrouplist", {visible: true, timeout: 3000 });
//           //           await page.click('#viewgrouplist')
//           //           await page.waitForSelector("#viewlocalgroup", {visible: true, timeout: 3000 });
//           //            await page.click('#viewlocalgroup')
//           //            await page.waitForSelector("#localgrouplink", {visible: true, timeout: 3000 });
//           //            await page.click('#localgrouplink')
//           //            await page.waitForTimeout(100000)
//           //
//           //            const res2=await chai.request(app)
//           //                 .get("/localgroup/findgroups")
//           //                 res2.body.data.should.all.have.property('centroid')
//           //                 res2.body.data.should.all.have.property('rules')
//           //                 res2.body.data.should.all.have.property('members')
//           //                 console.log("res2",res2.body.data)
//           //           })
//
//
//
//             //
//             // it("It should get all local groups and see if have id", function () {
//             //     chai.request(app)
//             //         .get("/localgroup/findgroups")
//             //         .end((err, response) => {
//             //           if(err){
//             //             console.log("error",err)
//             //           }else{
//             //             response.body.data.should.all.have.property('_id')
//             //
//             //
//             //         }})})
//             //
//             //         it("It should get all local groups and see if have centroid",  function () {
//             //            chai.request(app)
//             //                 .get("/localgroup/findgroups")
//             //                 .end((err, response) => {
//             //                   if(err){
//             //                     console.log("error",err)
//             //                   }else{
//             //                     response.body.data.should.all.have.property('centroid')
//             //                     groupsdata=JSON.parse(JSON.stringify(response.body.data))
//             //
//             //                 }})})
//
//   //
//   //                            await it("It should create then delete a local group", async function () {
//   //                             var groupId=mongoose.Types.ObjectId()
//   //                             var agent = chai.request.agent(app)
//   //
//   //                             await agent.post("/localgroup/createlocalgroup")
//   //                                   .send({_id:groupId,
//   //                                     location:"Petersham Sydney",
//   //                                   centroid: [151.1644,-33.8942]})
//   //                                   .then(function (res) {
//   //    expect(res).to.have.status(201);
//   //    return agent.delete("/localgroup/deletelowergroup/"+global.groupId)
//   // .then(function (res) {
//   //    expect(res).to.have.status(200);
//   //    agent.close()
//   // })
//   // })
//   //
//   //                                 })
//
//
//                                   await it("It should create then delete a normal group", async function () {
//                                    var groupId=mongoose.Types.ObjectId()
//                                    var agent = chai.request.agent(app)
//
//                                    await agent.post("/groups/creategroup")
//                                          .send({_id:groupId,
//                                            location:"Petersham Sydney",
//                                          centroid: [151.1644,-33.8942]})
//                                          .then(function (res) {
//           expect(res).to.have.status(201);
//           return agent.delete("/groups/deletelowergroup/"+groupId)
//        .then(function (res) {
//           expect(res).to.have.status(200);
//           agent.close()
//        })
//        })
//
//                                        })


})





function joinLocalGroup(usercoords,groupscoords,userid){



const distances=groupscoords.map(item=>{
let dist=calculatedist(item['centroid'],usercoords)

return {
id:item['_id'],
distance:dist,
}}
)
distances.sort((a, b) => (a.distance > b.distance) ? 1 : -1)

console.log("distances",distances[0]['id'],userid)
chai.request(app).put("/groups/joinlocalgroup/"+distances[0]['id']+"/"+ userid)
  .send({})
  .then(function (res) {
    expect(res).to.have.status(200);
 })
 .catch(function (err) {
   console.log("error",err)
    throw err;
 })





return distances[0]['id']
}

function calculatedist(groupcoords,usercoords){
  return geodist({lat: usercoords[0], lon: usercoords[1]}, {lat: groupcoords[0], lon: groupcoords[1]})
}


function createUser(values){

  chai.request(`https://api.mapbox.com/geocoding/v5/mapbox.places/${values.address}.json?access_token=pk.eyJ1IjoianVsaWFuYnVsbCIsImEiOiJja25zbXJibW0wNHgwMnZsaHJoaDV6MTg4In0.qPBGW4XMJcsZSUCrQej8Zw`)
       .get('')
       .end((err, response) => {
         if(err){
           console.log("error!!!!",err)
         }else{

     var localgroup=joinLocalGroup(response["body"]["features"][0]["center"],values.groupCoordinates,values.userId)
     const user = {
       _id:values.userId,
       name: values.name,
       email: values.email,
       expertise: values.expertise,
       localgroup:localgroup,
       coordinates: response["body"]["features"][0]["center"],
       password: values.password
     }

     chai.request(app)
          .post('/api/users/')
          .send(user)
          .end((err, response) => {
            if(err){
              console.log("error",err)
            }else{

   }})}})}
