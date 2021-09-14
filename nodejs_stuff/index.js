const admin = require('firebase-admin')
const express =require('express')
const app = express()
var serviceAccount = require("./call-379e3-firebase-adminsdk-ynr07-0cc9b1c952.json");
app.use(express.json())
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
app.post('/send-noti',(req,res)=>{
    console.log(req.body)
    const data = {
        dataChannel : req.body.dataChannel
    };
    const message ={
        notification:{
            title:"You have phone call",
            body: req.body.message,    
        },
        token: req.body.tokens,
        data: {
            json: JSON.stringify(data)
        }
    }
    admin.messaging().send(message).then(res =>{
        console.log('Send call succes')
    }).catch(err =>{
        console.log(err)
    })
})
app.listen(process.env.PORT || 3000,()=>{
    console.log('server running')
})