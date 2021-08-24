import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
    container:{
        width:'100%',
        height:'100%',
        alignItems:'center',
    },
    containersub:{
        height:300,
        width:'100%',
        alignItems:'center',
        backgroundColor:'#00CC33',
        borderBottomEndRadius:100,
    },
    Img:{
        width:150,
        height:150,
        alignSelf:'flex-start',
        marginTop:20,
        marginLeft:10
    },
    Title:{
        color:'white',
        fontWeight:'bold',
        justifyContent:'flex-end',
        fontSize:30,
        marginTop:50
    },
    containerIp:{
        marginBottom:50
    },
    TextIP:{
        borderBottomWidth:1,
        borderBottomColor:'#00CC33',
        height:40,
        width:300,
        marginTop:10
    },
    Signup:{
        backgroundColor:'#00CC33',
        width:200,
        height:40,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:10,
    },
    txtLogin:{
        color:'white',
        fontSize:17,
    },
    textOr:{
        fontSize:17,
        color:'#B5B5B5'
    },
    
})
export default styles
