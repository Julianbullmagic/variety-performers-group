import React, {useRef,useState,useEffect} from 'react'
import auth from '../auth/auth-helper'
import Axios from 'axios'
import io from "socket.io-client";

const mongoose = require("mongoose");


export default function CreatePurchseForm(props) {
const [viewForm, setViewForm] = useState(false);
const [uploading, setUploading] = useState(false);
const titleValue = React.useRef('')
const descriptionValue = React.useRef('')
const locationValue = React.useRef('')
const priceValue = React.useRef('')
const quantityValue = React.useRef('')
const [numImages, setNumImages] = useState([0]);
const selectedFile1 = React.useRef(null)
const selectedFile2 = React.useRef(null)
const selectedFile3 = React.useRef(null)
const selectedFile4 = React.useRef(null)
const selectedFile5 = React.useRef(null)
const [toggle, setToggle] = useState(false);
let server = "http://localhost:5000";

let socket = io(server);

useEffect(()=>{
  console.log("use EFFECT",numImages)
},[numImages,setNumImages])

function extraImage(e){
  e.preventDefault()
  let imagenum=numImages
  console.log(imagenum)
  if(imagenum.length<5){
  imagenum.push(0)
  }
  console.log("after push",imagenum)
  setNumImages([...imagenum])
}

function lessImage(e){
  e.preventDefault()
  console.log(imagenum)
  let imagenum=numImages
  if(imagenum.length>0){
  imagenum.pop()
  }
  console.log(imagenum)
  setNumImages([...imagenum])
}


async function handleSubmit(e) {

e.preventDefault()
    var d = new Date();
    var n = d.getTime();
    var purchaseId=mongoose.Types.ObjectId()
    purchaseId=purchaseId.toString()
setUploading(true)


                        let imageids=[]
                        console.log(selectedFile1.current.files[0],selectedFile2.current.files[0],
                          selectedFile3.current.files[0],selectedFile4.current.files[0],selectedFile5.current.files[0])
                      if(selectedFile1.current.files[0]){
                        const formData = new FormData();
                      formData.append('file', selectedFile1.current.files[0]);
                      formData.append("upload_preset", "jvm6p9qv");
                      await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
                      .then(response => {
                        console.log("cloudinary response",response)
                        imageids.push(response.data.public_id)
                      })}

                      if(selectedFile2.current.files[0]){const formData = new FormData();
                      formData.append('file', selectedFile2.current.files[0]);
                      formData.append("upload_preset", "jvm6p9qv");
                      await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
                      .then(response => {
                        console.log("cloudinary response",response)
                        imageids.push(response.data.public_id)
                      })}

                      if(selectedFile3.current.files[0]){const formData = new FormData();
                      formData.append('file', selectedFile3.current.files[0]);
                      formData.append("upload_preset", "jvm6p9qv");
                      await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
                      .then(response => {
                        console.log("cloudinary response",response)
                        imageids.push(response.data.public_id)
                      })}

                      if(selectedFile4.current.files[0]){const formData = new FormData();
                      formData.append('file', selectedFile4.current.files[0]);
                      formData.append("upload_preset", "jvm6p9qv");
                      await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
                      .then(response => {
                        console.log("cloudinary response",response)
                        imageids.push(response.data.public_id)
                      })}

                      if(selectedFile5.current.files[0]){const formData = new FormData();
                      formData.append('file', selectedFile5.current.files[0]);
                      formData.append("upload_preset", "jvm6p9qv");
                      await Axios.post("https://api.cloudinary.com/v1_1/julianbullmagic/image/upload",formData)
                      .then(response => {
                        console.log("cloudinary response",response)
                        imageids.push(response.data.public_id)
                      })}

                      console.log("imageids",imageids)



    const newPurchase={
      _id:purchaseId,
      title: titleValue.current.value,
      description:descriptionValue.current.value,
      createdby:auth.isAuthenticated().user._id,
      images:imageids,
      price:priceValue.current.value,
      quantity:quantityValue.current.value,
      timecreated:n,
      approval:[auth.isAuthenticated().user._id]
        }

        var newPurchaseToRender=JSON.parse(JSON.stringify(newPurchase))

        newPurchaseToRender.createdby=auth.isAuthenticated().user



        let chatMessage=`created a purchase suggestion called ${titleValue.current.value}`
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


    console.log("newPurchase",newPurchase)

    props.updatePurchases(newPurchaseToRender)
    console.log(newPurchase)
    const options={
        method: "POST",
        body: JSON.stringify(newPurchase),
        headers: {
            "Content-type": "application/json; charset=UTF-8"}}

      await fetch("/purchases/createpurchase/"+purchaseId, options)
              .then(response => response.json()).then(json => {
                setUploading(false)
                console.log(json)});
  }



  return (
    <>
    {uploading&&<h4>uploading!!!!!</h4>}

    <button style={{display:"block"}} onClick={(e) => setViewForm(!viewForm)}>View Suggest Purchase Form?</button>
    <div className='form' style={{maxHeight:!viewForm?"0":"100vw",overflow:"hidden",transition:"max-height 2s"}}>
      <form>
      <div className="eventformbox">

        <label htmlFor='name'>Title</label>
        <input
          type='text'
          name='titleValue'
          id='titleValue'
          ref={titleValue}

        />
        </div>

        <div className="eventformbox">
        <label htmlFor='name'>Description</label>
        <input
          type='text'
          name='descriptionValue'
          id='descriptionValue'
          ref={descriptionValue}
        />
        </div>

        <div className="eventformbox">
        <label htmlFor='name'>Price</label>
        <input
          type='text'
          name='priceValue'
          id='priceValue'
          ref={priceValue}
        />
        </div>

        <div className="eventformbox">
        <label htmlFor='name'>Quantity</label>
        <input
          type='text'
          name='quantityValue'
          id='quantityValue'
          ref={quantityValue}
        />
        </div>

        <div style={{display:((numImages.length>=1)?"block":"none")}}  className="eventformbox">
        <input id="file" type="file" ref={selectedFile1}/>
        </div>

        <div style={{display:((numImages.length>=2)?"block":"none")}} className="eventformbox">
        <input id="file" type="file" ref={selectedFile2}/>
        </div>

        <div style={{display:((numImages.length>=3)?"block":"none")}}  className="eventformbox">
        <input id="file" type="file" ref={selectedFile3}/>
        </div>

        <div style={{display:((numImages.length>=4)?"block":"none")}}  className="eventformbox">
        <input id="file" type="file" ref={selectedFile4}/>
        </div>

        <div style={{display:((numImages.length>=5)?"block":"none")}}  className="eventformbox">
        <input id="file" type="file" ref={selectedFile5}/>
        <p>Max 5 images</p>
        </div>
        <button onClick={(e) => extraImage(e)}>Add Extra Image</button>
        <button onClick={(e) => lessImage(e)}>One Less Image</button>
        {!uploading&&<button onClick={(e) => handleSubmit(e)}>Submit Purchase Suggestion?</button>}
        {uploading&&<h3>uploading!!!!!</h3>}


      </form>
    </div>
    </>
  )}
