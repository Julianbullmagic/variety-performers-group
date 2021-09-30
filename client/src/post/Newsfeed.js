import React, {useState,useRef, useEffect} from 'react'
import auth from './../auth/auth-helper'
import Comment from './Comment'
import io from "socket.io-client";
const mongoose = require("mongoose");


export default function Newsfeed (props) {
  const postArea = React.useRef('')
  const [posts, setPosts] = useState([]);
  const [post, setPost] = useState("");
  const [page, setPage] = useState(1);
  const [pageNum, setPageNum] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [comment, setComment] = useState("");
  const [preview, setPreview] = useState("");
  let server = "http://localhost:5000";
  let socket = io(server);

  useEffect(() => {
console.log("props",props)
    fetch("/posts/getposts")
    .then(res => {
      return res.json();
    }).then(posts => {
      console.log("posts!!!!!!!!!!!!!",posts.data)
      let po=posts.data
      po.reverse()
  setPosts(po)

  console.log("decide page",0,10)
  let currentpage=po.slice(0,10)
  console.log("currentpage",currentpage)
  setCurrentPageData(currentpage)

  let pagenum=Math.ceil(posts.data.length/10)
  console.log("page num",pagenum)
  let pagenums=[]
  while(pagenum>0){
    pagenums.push(pagenum)
    pagenum--
  }
  pagenums.reverse()
  console.log(pagenums)
  setPageNum(pagenums)
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

    console.log("decide page",(pagenum*10-10),pagenum*10)
    let currentpage=posts.slice((pagenum*10-10),pagenum*10)
    console.log("currentpage",currentpage)
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
    console.log("preview",prev)
    setPreview(prev)
}


  function handleSubmit(e){
e.preventDefault()
      var d = new Date();
      var n = d.getTime();
      var postId=mongoose.Types.ObjectId()

      const newPost={
        _id:postId,
        post:post,
        preview:preview,
        timecreated:n,
        createdby:auth.isAuthenticated().user._id
      }

      let chatMessage=`created an new post`
      let userId=auth.isAuthenticated().user._id
      let userName=auth.isAuthenticated().user.name
      let nowTime=n
      let type="text"

      socket.emit("Input Chat Message", {
        chatMessage,
        userId,
        userName,
        nowTime,
        type});


console.log("newpost",newPost)
      var postscopy=JSON.parse(JSON.stringify(posts))

      postscopy.reverse()
      postscopy.push(newPost)
      postscopy.reverse()



      setPosts(postscopy)
console.log("page",page)
      let current=postscopy.slice((page*10-10),page*10)
      console.log(current)
      setCurrentPageData(current)

      const options={
          method: "POST",
          body: JSON.stringify(newPost),
          headers: {
              "Content-type": "application/json; charset=UTF-8"}}


        fetch("/posts/createpost/"+postId, options)
                .then(response => response.json()).then(json => console.log(json));

  }


    function deletePost(e,id) {
      e.preventDefault()
      var postscopy=JSON.parse(JSON.stringify(posts))
      var filteredarray = postscopy.filter(function( obj ) {
   return obj._id !== id;
   });
      setPosts(filteredarray);

console.log("page",page)
      let current=postscopy.slice((page*10-10),page*10)
      console.log(current)
      setCurrentPageData(current)


        console.log(filteredarray)
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

                socket.emit("Input Chat Message", {
                  chatMessage,
                  userId,
                  userName,
                  nowTime,
                  type});

           fetch("/posts/deletepost/"+id, options)
                  .then(response => response.json()).then(json => console.log(json));

    }


if(preview){
  if(preview.image){
    var previewmapped=<><h2>{preview.title}</h2><img src={preview.image}></img></>
  }

if(preview.url){
  var previewmapped=<><h2>{preview.title}</h2><iframe src={preview.url}></iframe></>
}
}
//
var postsmapped=currentPageData.map((item,i)=>{
if (item.preview){
  if(item.preview.title){
    if(item.preview.image){
      var prev=
      <>
      <h2>{item.preview.title}</h2>
      <img src={item.preview.image}></img>
      </>
    if(item.preview.url){
      prev=
      <>
      <h2>{item.preview.title}</h2>
      <iframe src={item.preview.url}></iframe>
      <img src={item.preview.image}></img>
      </>
    }
  }
}
}

  return (
  <>
  <div key={i} className="postbox">
  <div className="postboxform">
  <h4><strong>Post: </strong>{item.post}</h4>

  {prev&&prev}
  <div><h5 style={{display:"inline"}}><strong> Post by {item.createdby.name}</strong></h5><button style={{display:"inline"}} onClick={(e)=>deletePost(e,item._id)}>Delete Post?</button></div>
  </div>
  <Comment id={item._id}/>

  </div>
  </>
)})

    return (
  <>
  <div className="form">
  <form>
          <div>
        <label htmlFor='name'>Write Post</label>  <button onClick={(e) => handleSubmit(e)}>New Post?</button>
          </div>

      <textarea onChange={(e) => setPost(e.target.value)} ref={postArea} id="story" rows="5" cols="33" />


            {preview&&previewmapped}
        </form>

        </div>
        <h4 style={{display:"inline"}}>Choose Page</h4>
        {pageNum&&pageNum.map(item=>{
          return (<>
            <button style={{display:"inline"}} onClick={(e) => decidePage(e,item)}>{item}</button>
            </>)
        })}
        {postsmapped}
        <div style={{marginBottom:"5vw"}}>
        <h4 style={{display:"inline"}}>Choose Page</h4>
        {pageNum&&pageNum.map(item=>{
          return (<>
            <button style={{display:"inline"}} onClick={(e) => decidePage(e,item)}>{item}</button>
            </>)
        })}
        </div>
        </>
    )
}
