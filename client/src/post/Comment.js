import React, {useRef,useState,useEffect} from 'react'
import auth from '../auth/auth-helper'
const mongoose = require("mongoose");


export default function Comment(props) {
  const commentValue = React.useRef('')
  const [comments, setComments] = useState();

  useEffect(() => {

    fetch("/posts/getcomments/"+props.id)
    .then(res => {
      return res.json();
    }).then(comments => {

      setComments(comments.data)})
      .catch(err => {
        console.error(err);
      })
    },[props])



    function deleteComment(e,id) {
      e.preventDefault()

      var commentscopy=JSON.parse(JSON.stringify(comments))
      var filteredarray = commentscopy.filter(function( obj ) {
        return obj._id !== id;
      });
      setComments(filteredarray);


      const options={
        method: "Delete",
        body: '',
        headers: {
          "Content-type": "application/json; charset=UTF-8"}}


          fetch("/posts/deletecomment/"+id, options)
          .then(response => response.json())
          .then(json =>console.log(json))
            .catch(err => {
              console.error(err);
            })

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

            var commentscopy=JSON.parse(JSON.stringify(comments))
            commentscopy.push(newComment)
            setComments(commentscopy);


            const options={
              method: "POST",
              body: JSON.stringify(newComment),
              headers: {
                "Content-type": "application/json; charset=UTF-8"}}


                await fetch("/posts/createcomment/"+commentId, options)
                .then(response => response.json())
                .then(json =>console.log(json))
                  .catch(err => {
                    console.error(err);
                  })

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
                      <p className="commp" style={{margin:'0.5vw',fontSize:"small"}}>{item.comment}</p>
                      <div classname="comm">
                      <p style={{display:"inline",margin:'2vw',fontSize:"small"}}><strong>Comment by {item.createdby.name}</strong></p>
                      <button style={{display:"inline"}} onClick={(e)=>deleteComment(e,item._id)}>Delete comment?</button>
                      </div>
                      </div>
                      </>
                    )})}




                    return (
                      <div className='comments'>
                      <div className='commentform'>
                      <div className="commentstuff">
                      <p style={{display:"inline",fontSize:"small"}} htmlFor='name'><strong>Comment</strong></p>
                      <button style={{display:"inline"}} onClick={(e) => handleSubmit(e)}>Submit Comment</button>
                      </div>
                      <input className='commentinput'
                      type='text'
                      style={{overflowY:"auto"}}
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
