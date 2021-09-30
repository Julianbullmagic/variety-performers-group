import React, {useRef,useState,useEffect} from 'react'
import auth from '../auth/auth-helper'
const mongoose = require("mongoose");


export default function CreateRuleForm(props) {
const commentValue = React.useRef('')
const [comments, setComments] = useState();

useEffect(() => {
console.log("props",props)
  fetch("/posts/getcomments/"+props.id)
  .then(res => {
    return res.json();
  }).then(comments => {
    console.log("comments",comments)
setComments(comments.data)})
},[props])



function deleteComment(e,id) {
  e.preventDefault()
  console.log(id)
  var commentscopy=JSON.parse(JSON.stringify(comments))
  var filteredarray = commentscopy.filter(function( obj ) {
return obj._id !== id;
});
  setComments(filteredarray);

    console.log(filteredarray)
    const options={
        method: "Delete",
        body: '',
        headers: {
            "Content-type": "application/json; charset=UTF-8"}}


       fetch("/posts/deletecomment/"+id, options)
              .then(response => response.json()).then(json => console.log(json));

}

async function handleSubmit(e) {
e.preventDefault()
    var d = new Date();
    var n = d.getTime();
    var commentId=mongoose.Types.ObjectId()
    commentId=commentId.toString()

    const newComment={
      _id:commentId,
      postid:props.id,
      createdby:auth.isAuthenticated().user._id,
      comment: commentValue.current.value,
      timecreated:n,
    }
    console.log("props post id in create comment",props.id)
var commentscopy=JSON.parse(JSON.stringify(comments))
commentscopy.push(newComment)
    setComments(commentscopy);

    console.log(newComment)
    const options={
        method: "POST",
        body: JSON.stringify(newComment),
        headers: {
            "Content-type": "application/json; charset=UTF-8"}}


      await fetch("/posts/createcomment/"+commentId, options)
              .then(response => response.json()).then(json => console.log(json));

              const optionstwo = {
                method: 'put',
                headers: {
                  'Content-Type': 'application/json'
                },
                   body: ''
              }

}


if(comments){
  var commentsmapped=comments.map((item,i)=>{

  return (
  <>
  <div key={i} className="comment">
  <p style={{fontSize:"small"}}>{item.comment}</p>

  <div>
  <p style={{display:"inline",fontSize:"small"}}><strong>Comment by {item.createdby.name}</strong></p>
  <button style={{display:"inline"}} onClick={(e)=>deleteComment(e,item._id)}>Delete comment?</button>
  </div>
  </div>
  </>
)})}




  return (
    <div className='comments'>
    <div className='commentform'>
    <div>
    <p style={{display:"inline",fontSize:"small"}} htmlFor='name'><strong>Comment</strong></p>
    <button style={{display:"inline",fontSize:"small"}} onClick={(e) => handleSubmit(e)}>Submit Comment</button>
    </div>
    <input className='commentinput'
      type='text'
      style={{overflow:"auto",width:"50vw"}}
      name='commentValue'
      id='commentValue'
      ref={commentValue}
    />

    </div>
        <div className="commentsdisplay">
{commentsmapped&&commentsmapped}
</div>

    </div>

  )}
