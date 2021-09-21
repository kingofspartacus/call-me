import { StyleSheet } from 'react-native'
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#00CC33'
    },
    back: {
        alignSelf: 'center',
        width: '95%',
        height: '22%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    logo: {
        fontSize: 25,
        fontWeight: 'bold',
        color: 'white'
    },
    Profile: {
        width: 65,
        height: 65,
        borderRadius: 100,
    },
    ListContainer: {
        backgroundColor: 'white',
        height: '78%',
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
    },
    list: {
        marginTop: 40,
        backgroundColor: 'white',
        height: '100%'
    },
    ItemBack: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        backgroundColor: '#00CC33'
    },
    ItemBackRJ: {
        width: '100%',
        height: 100,
        justifyContent: 'center',
        backgroundColor: 'orange'
    },
    Itemfather: {
        width: '100%',
        height: 85,
        backgroundColor: 'white',
        flexDirection: 'row',
    },
    Item: {
        width: '105%',
        height: 100,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
    },
    callBT: {
        width: 35,
        height: 35,
        alignSelf: 'flex-end',
        tintColor: 'white',
        marginRight: 25
    },
    callBTR: {
        width: 30,
        height: 30,
        alignSelf: 'flex-end',
        tintColor: 'white',
        marginRight: 25
    },
    containerAva: {
        flexDirection: 'row',
        width: 85,
        height: 85,
        justifyContent: 'flex-end',
        marginLeft: 10,
    },
    Avatar: {
        width: 85,
        height: 85,
        borderRadius: 100,
        position: 'absolute',
    },
    online: {
        width: 25,
        height: 25,
        backgroundColor: '#00CC33',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'white',
        alignSelf: 'flex-end',
    },
    offline: {
        width: 25,
        height: 25,
        backgroundColor: 'orange',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'white',
        alignSelf: 'flex-end',
    },
    TxtItem: {
        alignSelf: 'center',
        marginLeft: 20
    },
    name: {
        fontSize: 17,
    },
    mail: {
        fontSize: 15,
        color: 'grey'
    },
    modalcontainer: {
        width: '70%',
        height: '50%',
        backgroundColor: 'orange',
        alignSelf: 'center',
        marginTop: 50,
        alignItems: 'center',
        borderRadius: 20
    },
    InfMDCon: {
        width: '100%',
        height: '80%',
        alignItems: 'center'
    },
    ProfileMD: {
        width: 80,
        height: 80,
        borderRadius: 100,
        marginTop: '30%',
    },
    Mdtxt: {
        marginTop: 10,
        color: 'white',
        fontSize: 20
    },
    BtMdCon: {
        width: '100%',
        height: '20%',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    btgb: {
        width: 80,
        height: 30,
        backgroundColor: '#00CC33',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    btlo: {
        width: 80,
        height: 30,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    callstatus: {
        width: 100,
        height: 20,
        backgroundColor: 'orange',
        borderRadius: 5,
        marginTop: 5
    },
    statusCallText: {
        color: 'black',
        textAlign: 'center',
        fontWeight: '400',
    },
})
export default styles