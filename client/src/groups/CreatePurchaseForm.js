import React, {useRef,useState} from 'react'
import auth from '../auth/auth-helper'
import Axios from 'axios'
import io from "socket.io-client";

const mongoose = require("mongoose");


export default function CreatePurchseForm(props) {
const titleValue = React.useRef('')
const descriptionValue = React.useRef('')
const locationValue = React.useRef('')
const priceValue = React.useRef('')
const quantityValue = React.useRef('')
const selectedFile1 = React.useRef(null)
const selectedFile2 = React.useRef(null)
const selectedFile3 = React.useRef(null)
const selectedFile4 = React.useRef(null)
const selectedFile5 = React.useRef(null)
const [toggle, setToggle] = useState(false);
const [numberOfImages, setNumberOfImages]=useState(1)
let server = process.env.PORT||"http://localhost:5000";
let socket = io(server);



function addImages(){
  var numberplusone=numberOfImages+1

  setNumberOfImages(numberplusone)
}

function lessImages(){
  var numberminusone=numberOfImages-1


  setNumberOfImages(numberminusone);

}


async function handleSubmit(e) {

e.preventDefault()
    var d = new Date();
    var n = d.getTime();
    var purchaseId=mongoose.Types.ObjectId()
    purchaseId=purchaseId.toString()



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
      images:imageids,
      price:priceValue.current.value,
      quantity:quantityValue.current.value,
      timecreated:n,
      approval:[auth.isAuthenticated().user._id]
        }



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

    props.updatePurchases(newPurchase)
    console.log(newPurchase)
    const options={
        method: "POST",
        body: JSON.stringify(newPurchase),
        headers: {
            "Content-type": "application/json; charset=UTF-8"}}


      await fetch("/purchases/createpurchase/"+purchaseId, options)
              .then(response => response.json()).then(json => console.log(json));
  }




  return (
    <div className='form'>

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

        <div className="eventformbox">
        <input id="file" type="file" ref={selectedFile1}/>
        </div>

        <div className="eventformbox">
        <input id="file2" type="file" ref={selectedFile2}/>
        </div>

        <div className="eventformbox">
        <input id="file3" type="file" ref={selectedFile3}/>
        </div>

        <div className="eventformbox">
        <input id="file4" type="file" ref={selectedFile4}/>
        </div>

        <div className="eventformbox">
        <input id="file5" type="file" ref={selectedFile5}/>
        </div>
                <button onClick={addImages}>Add another image</button>
                <button onClick={lessImages}>Add one less image</button>

        <button onClick={(e) => handleSubmit(e)}>Submit Purchase Suggestion?</button>

      </form>
    </div>
  )}
