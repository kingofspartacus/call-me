import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

const Haha = ({ navigation }: { navigation: any }) => {
    return (
        <View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text>nam</Text>
        </TouchableOpacity>
        </View>
    )
}

export default Haha


