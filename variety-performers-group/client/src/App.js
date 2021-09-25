import React from 'react'
import MainRouter from './MainRouter'
import {BrowserRouter} from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import { hot } from 'react-hot-loader'
import './App.css'

const App = () => {

  return (
  <BrowserRouter >
        <MainRouter/>
  </BrowserRouter>
)}

export default hot(module)(App)
