import React, {useState,useRef, useEffect} from 'react'
import auth from './../auth/auth-helper'
import Comment from './Comment'
import io from "socket.io-client";
const mongoose = require("mongoose");


export default function Newsfeed (props) {
  const [viewForm, setViewForm] = useState(false);
  const postArea = useRef('')
  const [posts, setPosts] = useState([]);
  const [group, setGroup] = useState(props.group);
  const [post, setPost] = useState("");
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageNum, setPageNum] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [preview, setPreview] = useState("");
  const [socket,setSocket] = useState(props.socket)
  // let server = "http://localhost:5000";
  // let socket
  //
  // if(process.env.NODE_ENV==="production"){
  //   socket=io();
  // }
  // if(process.env.NODE_ENV==="development"){
  //   socket=io(server);
  // }

  useEffect(() => {
    setSocket(props.socket)
    setGroup(props.group)
    fetch("/posts/getposts/"+props.groupId)
    .then(res => {
      return res.json();
    }).then(posts => {

      let po=posts.data
      po.reverse()
      setPosts(po)
      let currentpage=po.slice(0,10)
      setCurrentPageData(currentpage)
      let pagenum=Math.ceil(posts.data.length/10)

      let pagenums=[]
      while(pagenum>0){
        pagenums.push(pagenum)
        pagenum--
      }
      pagenums.reverse()

      setPageNum(pagenums)
    }).catch(err => {
      console.error(err);
    })
  },[props])

  useEffect(() => {

    var urlRegex = /(https?:\/\/[^ ]*)/;
    if (post.match(urlRegex)){
      var url = post.match(urlRegex)[0]
      getPreview(url)
    }


  },[post])

function getId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11)
  ? match[2]
  : null;
}

function decidePage(e,pagenum){
  let currentpage=posts.slice((pagenum*10-10),pagenum*10)
  setPage(pagenum)
  setCurrentPageData(currentpage)
}

async function getPreview(url){
  var data = {key: '567204aab52f43be1f7bbd3573ff4875', q: url}

  if (url.includes("youtube")){
    const videoId = getId(url);
    const iframesrc = `http//www.youtube.com/embed/${videoId}`
    data = {key: '567204aab52f43be1f7bbd3573ff4875', q: iframesrc}

  }


  var prev=await fetch('https://api.linkpreview.net', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(data),
  })
  .then(res => res.json())
  .then(response => {return response})
  .catch(err => {
    console.error(err);
  })

  setPreview(prev)
}


function handleSubmit(e){
  e.preventDefault()
  setUploading(true)
  setTimeout(() => {
    setUploading(false)
  }, 3000)
  var d = new Date();
  var n = d.getTime();
  var postId=mongoose.Types.ObjectId()

  const newPost={
    _id:postId,
    post:post,
    level:group.level,
    politicalmarketing:[],
    groupIds:[props.groupId],
    preview:preview,
    timecreated:n,
    createdby:auth.isAuthenticated().user._id
  }
 let newPostToRender=JSON.parse(JSON.stringify(newPost))
 newPostToRender.createdby=auth.isAuthenticated().user
  let chatMessage=`created a new post`
  let userId=auth.isAuthenticated().user._id
  let userName=auth.isAuthenticated().user.name
  let nowTime=n
  let type="text"
  let groupId=group._id
  let groupTitle=group.title
  console.log(groupTitle)
  socket.emit("Input Chat Message", {
    chatMessage,
    userId,
    userName,
    nowTime,
    type,
    groupId,
    groupTitle});

    let postscopy=JSON.parse(JSON.stringify(posts))
    console.log(postscopy)
    postscopy.reverse()
    postscopy.push(newPostToRender)
    postscopy.reverse()
    console.log(postscopy)

    setPosts(postscopy)
    let current=postscopy.slice((page*10-10),page*10)
    setCurrentPageData(current)

    sendPostNotification(newPost)


    const options={
      method: "POST",
      body: JSON.stringify(newPost),
      headers: {
        "Content-type": "application/json; charset=UTF-8"}}

        fetch("/posts/createpost/"+postId, options)
        .then(response => response.json())
        .then(json =>console.log(json))
          .catch(err => {
            console.error(err);
          })
        }


        function deletePost(e,id){
          let post
          let postscopy=JSON.parse(JSON.stringify(posts))
          for (let po of postscopy){
            if(po._id===id){
              post=po.post
            }
          }
          let filteredarray = postscopy.filter(item=>!(item._id === id));
          setPosts(filteredarray);
          let current=filteredarray.slice((page*10-10),page*10)

          setCurrentPageData(current)

          const options={
            method: "Delete",
            body: '',
            headers: {
              "Content-type": "application/json; charset=UTF-8"}}

              var d = new Date();
              var n = d.getTime();

              let chatMessage=`deleted a post`
              let userId=auth.isAuthenticated().user._id
              let userName=auth.isAuthenticated().user.name
              let nowTime=n
              let type="text"
              let groupId=group._id
              let groupTitle=group.title

              socket.emit("Input Chat Message", {
                chatMessage,
                userId,
                userName,
                nowTime,
                type,
                groupId,
                groupTitle});

                fetch("/posts/deletepost/"+id, options)
                .then(response => response.json())
                .then(json =>console.log(json))
                  .catch(err => {
                    console.error(err);
                  })

                  let us=JSON.parse(JSON.stringify(props.users))
                  us=us.filter(item=>item.posts)
                  let emails=us.map(item=>{return item.email})

                  let notification={
                    emails:emails,
                    subject:"Post Deleted",
                    message:`${auth.isAuthenticated().user.name} deleted the post called ${post} in the group ${group.title} at level ${group.level}`
                  }

                  const opt = {
                    method: 'post',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(notification)
                  }

                  fetch("/groups/sendemailnotification",opt
                ).then(res => {
                  console.log(res)
                }).catch(err => {
                  console.error(err);
                })
              }


              function sendPostNotification(item){
                      let us=JSON.parse(JSON.stringify(props.users))
                      us=us.filter(item=>item.posts)
                      let emails=us.map(item=>{return item.email})

                      let notification={
                        emails:emails,
                        subject:"New Post",
                        message:`${auth.isAuthenticated().user.name} wrote a post called ${item.post}  in the group ${group.title} at level ${group.level}`
                      }

                      const options = {
                        method: 'post',
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(notification)
                      }

                      fetch("/groups/sendemailnotification",options
                    ).then(res => {
                      console.log(res)
                    }).catch(err => {
                      console.error(err);
                    })

                    const optionstwo = {
                      method: 'put',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: ''
                    }

                    fetch("/posts/notificationsent/"+item._id,optionstwo
                  ).then(res => {
                    console.log(res)
                  }).catch(err => {
                    console.error(err);
                  })
                  setPost("")
              }



              function areYouSure(e,item){
                console.log(item)
                let postscopy=JSON.parse(JSON.stringify(posts))
                  for (let post of postscopy){
                    if (post._id===item._id){
                      post.areyousure=true
                    }}
                    let current=postscopy.slice((page*10-10),page*10)
                    setPosts(postscopy)
                    setCurrentPageData(current)
                  }

                  function areYouNotSure(e,item){
                    console.log(item)
                      let postscopy=JSON.parse(JSON.stringify(posts))
                      for (let post of postscopy){
                        if (post._id===item._id){
                          post.areyousure=false
                        }}
                        let current=postscopy.slice((page*10-10),page*10)
                        setPosts(postscopy)
                        setCurrentPageData(current)
                      }

                      if(preview){
                        console.log("preview",preview)
                        if(preview.url){
                          var previewmapped=<img alt="preview" src={preview.url} style={{marginLeft:"10vw",textAlign:"center",maxHeight:"70vh",maxWidth:"70vw",objectFit:"contain"}}></img>
                        }
                      }

              var postsmapped=currentPageData.map((item,i)=>{
                let prev
                if (item.preview){
                      if(item.preview.url){
                         prev=<img alt="preview" key={item._id} style={{position:"relative",margin:"1vw",display:"block",Zindex:"-1",Position:"fixed",marginLeft:"10vw",textAlign:"center",maxHeight:"70vh",maxWidth:"70vw",objectFit:"contain"}} src={item.preview.url}></img>
                      }
                }

                return (
                  <>
                  <div key={item._id} className="postbox">
                  <div>
                  <div className="postboxform">
                  <div style={{display:"block",margin:"1vw",textAlign:"right"}}>
                  {item.createdby&&<><h5 style={{margin:"1vw",display:"inline",textAlign:"center"}}><strong> Post by {item.createdby.name}</strong></h5>
                  {((item.createdby._id===auth.isAuthenticated().user._id)&&!item.areyousure)&&
                    <button className="ruletext deletebutton" onClick={(e)=>areYouSure(e,item)}>Delete Post?</button>}</>}
                    {item.areyousure&&<button className="ruletext deletebutton" onClick={(e)=>areYouNotSure(e,item)}>Not sure</button>}
                    {item.areyousure&&<button className="ruletext deletebutton" onClick={(e)=>deletePost(e,item._id)}>Are you sure?</button>}
                    </div>
                    <h4 style={{display:"block",margin:"1vw"}}><strong>Post: </strong>{item.post}</h4>
                    {prev&&prev}
                    </div>
                    </div>
                      <Comment id={item._id}/>
                      </div>
                      </>
                    )})
                    let inthisgroup
                    if(group.members){
                      inthisgroup=group.members.map(item=>item._id)
                      inthisgroup=inthisgroup.includes(auth.isAuthenticated().user._id)
                    }

                    return (
                      <>
                      {inthisgroup&&<>
                        <button style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Write Post Form?</button>
                        <div className="form" style={{maxHeight:!viewForm?"0":"1000vw",overflow:"hidden",transition:"max-height 2s"}}>
                        <form style={{display:!viewForm?"none":"block"}}>
                        <div>
                        <label htmlFor='name'>Write Post</label>
                        {!uploading&&<><button className="formsubmitbutton" onClick={(e) => handleSubmit(e)}>New Post?</button></>}
                        {uploading&&<h4>Uploading Post...</h4>}
                        </div>
                        <textarea className="posttextarea" onChange={(e) => setPost(e.target.value)} ref={postArea} id="story" rows="5" cols="33" />

                        {preview&&previewmapped}

                        </form>

                        </div>
                        </>}

                        {pageNum.length>1&&<h4 style={{display:"inline"}}>Choose Page</h4>}
                        {(pageNum.length>1&&pageNum&&posts)&&pageNum.map((item,index)=>{
                          return (<>
                            <button style={{display:"inline",opacity:(index+1===page)?"0.5":"1"}} onClick={(e) => decidePage(e,item)}>{item}</button>
                            </>)
                          })}
                          {postsmapped}
                          <br/>

                          <div style={{marginBottom:"5vw"}}>
                          {pageNum.length>1&&<h4 style={{display:"inline"}}>Choose Page</h4>}
                          {(pageNum.length>1&&pageNum&&posts)&&pageNum.map((item,index)=>{
                            return (<>
                              <button style={{display:"inline",opacity:(index+1===page)?"0.5":"1"}} onClick={(e) => decidePage(e,item)}>{item}</button>
                              </>)
                            })}
                            </div>
                            </>
                          )
                        }
