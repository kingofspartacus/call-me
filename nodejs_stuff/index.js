const admin = require('firebase-admin')
const express =require('express')
const app = express()

var serviceAccount = require("./callme-302c8-firebase-adminsdk-akbzt-34678f6016.json");
app.use(express.json())
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.post('/send-noti',(req,res)=>{
    console.log(req.body)
        const message ={
        notification:{
            title:"new ad",
            body:"new ad posted click to open"
        },
        tokens: req.body.tokens
    }

    admin.messaging().sendMulticast(message).then(res =>{
        console.log('send succes')
    }).catch(err =>{
        console.log(err)
    })
})

app.listen(3000,()=>{
    console.log('server running')
})
