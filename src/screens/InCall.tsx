import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native'
import AgoraUIKit from 'agora-rn-uikit';
import messaging from '@react-native-firebase/messaging';

const inCall = ({ navigation }: { navigation: any }) => {
    useEffect(() => {
        messaging().onMessage(remoteMessage => {
            Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        })
    })
    const [videoCall, setVideoCall] = useState(true);
    const rtcProps = {
        appId: 'bd082fe6626440a6b16e6256814524f8',
        channel: 'meet',
    };
    const callbacks = {
        EndCall: () => {
            setVideoCall(false), navigation.navigate('FirstScreen')
        },
    };
    return (
        <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    )
};

export default inCall;
