import { useState } from "react"
import Axios from 'axios'
import toast from "react-hot-toast"

const PayMpesa = () => {

  const [values, setValues] = useState({
    phone : '',
    amount: ''
  })

  const handleChange = (e) => {
       setValues({...values, [e.target.name] : [e.target.value]})
  }

  const handleSubmit = (e) => {
        e.preventDefault();
        Axios.post('/stkpush', {values})
             .then((result) => {
                 toast.success(result.data.ResponseMessage)
                 console.log(result.data)
             })
             .catch((err) => {
              if (err.response) {
                // The server responded with a status code outside the 2xx range
                toast.error('err response:', err.response);
                console.log(err.response)
              } else if (err.request) {
                // The request was made but no response was received
                toast.error('err request:', err.request);
               // console.log(err.request)
              } else {
                // Something happened in setting up the request that triggered an err
                toast.error('err message:', err.message);
              }
              
             })
  }

  return (
    <div className="container-fluid">
     <form onSubmit={handleSubmit}>
       <div className="row">
         <h2>Support Us</h2>
        
          <input type="tel" placeholder="Enter Phone Number" name="phone" style={{padding: '20px', borderRadius: '5px', marginTop: '10px'}} onChange={handleChange}/>
          <input type="number" placeholder="Enter Amount" name="amount" style={{padding: '20px', borderRadius: '5px', marginTop: '10px'}} onChange={handleChange}/>
          <button type="submit" style={{border : '1px solid #000', background: '#000', color : '#fff', marginTop: '10px'}}>PAY</button>
          
       </div>
     </form>
    </div>
  )
}

export default PayMpesa
