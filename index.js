const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res)=>{
    res.send("Tourist guide is running");
})

app.listen(port, ()=>{
    console.log(`Tourist guide in running on port ${port}`)
})