import React, { useEffect, useState } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import AppScreen from './AppScreen'
import { UserData } from '../types/User'
import useAppStorage from '../hooks/use-app-storage'
import { DATA } from '../constants'
import PageTitle from '../components/PageTitle'

export default () => {
  const { get } = useAppStorage()
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    get<UserData>(DATA.USER_DATA).then(setUserData)
  }, [])

  return (
    <AppScreen>
      <View style={styles.container}>
        <PageTitle label='DittoAI'>
          <Text>ICON</Text>
        </PageTitle>

        {userData && (
          <Text>
            User Data:
            {'\n'}
            Language: {userData.language}
            {'\n'}
            Proficiency: {userData.profeciency}
            {'\n'}
            Context: {userData.context}
          </Text>
        )}
      </View>
    </AppScreen>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
})
