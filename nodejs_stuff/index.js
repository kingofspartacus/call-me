const admin = require('firebase-admin')
const express =require('express')
const app = express()

var serviceAccount = require("./callme-302c8-firebase-adminsdk-akbzt-34678f6016.json");
app.use(express.json())
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  
});

app.post('/send-noti',(req,res)=>{
    
    console.log(req.body)
        const message ={
            notification:{
            title:"Mess",
            body:"????",
        },
    
        token: req.body.tokens,
        
    }
   
    admin.messaging().send(message).then(res =>{
        console.log('send succes')
    }).catch(err =>{
        console.log(err)
    })
})

app.listen(3000,()=>{
    console.log('server running')
})
