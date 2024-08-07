const express = require('express')
const app = express()
const api_routers = require('./routers/Routes')
const cors = require('cors')

app.use(cors({
    origin : 'http://localhost:5173',
    credentials: true
    }))

app.use('/', api_routers)

app.listen(3000, () => {
    console.log('Listening to Port 3000')
})