import './App.css'
import PayMpesa from './component/PayMpesa'
import {Toaster} from 'react-hot-toast'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;

function App() {

  return (
   <>
    <Toaster position='top-right' toastOptions={{duration: 5000}}/>
    <PayMpesa />
   </>
  )
}

export default App
