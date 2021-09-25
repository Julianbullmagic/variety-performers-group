import React, {useState, useEffect} from 'react'
import ChatPage from "./../ChatPage/ChatPage"
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import unicornbikeImg from './../assets/images/unicornbike.jpg'
import Grid from '@material-ui/core/Grid'
import auth from './../auth/auth-helper'
import background from "./2170171.jpg";

const KmeansLib = require('kmeans-same-size');



export default function Home({history}){
  const [defaultPage, setDefaultPage] = useState(false)


  useEffect(()=> {
    setDefaultPage(auth.isAuthenticated())
    const unlisten = history.listen (() => {
      setDefaultPage(auth.isAuthenticated())
    })
    return () => {
      unlisten()
    }
  }, [])

    return (
      <>

        { !defaultPage &&
          <Grid container spacing={8}>

            <Grid item xs={12}>
              <Card className="card">





              </Card>
            </Grid>
          </Grid>
        }
        {defaultPage &&
          <>

          <ChatPage/>
          </>
        }
      </>
    )
}
