import { StyleSheet, View, Text } from 'react-native'
import ScreenView from '../components/ScreenView'
import SecondaryButton from '../components/SecondaryButton'
import { useNavigation } from '@react-navigation/native'
import { FONTS, SCREENS, THEME } from '../constants'
import { useEffect, useState } from 'react'
import PageView from '../components/PageView'
import Button from '../components/Button'
import { Audio } from 'expo-av'
import PrimaryButton from '../components/PrimaryButton'

interface Course {
  id: any
  scenario: string
  sentences: Sentence[]
}

interface Sentence {
  id: any
  translation?: string
  original?: string
}

const course: Course = {
  id: 1,
  scenario: 'You are at a bar...',
  sentences: [
    {
      id: 1,
      translation: 'Pourriez-vous recommander une bière locale ?',
      original: 'Could you recommend a local brew?',
    },
    {
      id: 2,
      translation: 'Pourriez-vous recommander une bière locale ?',
      original: 'Could you recommend a local brew?',
    },
    {
      id: 3,
      translation: 'Pourriez-vous recommander une bière locale ?',
      original: 'Could you recommend a local brew?',
    },
  ],
}

export default () => {
  const navigation = useNavigation()
  const [pageView, setPageView] = useState<PageView | null>()
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [hasStarted, setHasStarted] = useState(false)

  async function playSound() {
    const file = require('../../assets/audio/question1.m4a')
    const { sound } = await Audio.Sound.createAsync(file)
    await sound.playAsync()
    // await sound.unloadAsync()
  }

  return (
    <ScreenView>
      <View style={styles.container}>
        <View style={styles.header}>
          <SecondaryButton
            containerStyle={{ transform: [{ scale: 1.4 }] }}
            icon='close'
            onClick={() => navigation.navigate(SCREENS.DASHBOARD)}
          />
          <SecondaryButton
            labelFirst
            noticeMe
            label='Refine Scenario'
            icon='edit'
            onClick={() => navigation.navigate(SCREENS.COURSE.REFINE_SCENARIO)}
          />
        </View>

        <Text style={styles.title}>{course.scenario}</Text>

        <View style={styles.cards}>
          <PageView ref={setPageView} onPageChange={setPageNumber}>
            {course.sentences.map(sentence => (
              <View key={sentence.id} style={styles.card}>
                <View key={sentence.id} style={styles.cardContent}>
                  <Text style={styles.translation}>{sentence.translation}</Text>
                  <Text style={styles.original}>{sentence.original}</Text>
                </View>
              </View>
            ))}
          </PageView>

          <View style={styles.cardControls}>
            <SecondaryButton
              hide={pageNumber <= 1}
              label='Back'
              labelStyle={{ opacity: 0.7 }}
              onClick={pageView?.turnPrevious}
            />
            <Text style={styles.cardControlPagination}>
              {pageNumber}/{course.sentences.length}
            </Text>
            <SecondaryButton
              hide={pageNumber >= course.sentences.length}
              label='Next'
              labelStyle={{ opacity: 0.7 }}
              onClick={pageView?.turnNext}
            />
          </View>
        </View>

        {!hasStarted ? (
          <PrimaryButton
            containerStyle={styles.courseControls}
            label='Start!'
            onClick={() => setHasStarted(true)}
          />
        ) : (
          <View style={{ ...styles.courseControls, paddingHorizontal: 70 }}>
            <Button
              labelStyle={{ ...styles.courseControlButtonIcon, color: 'white' }}
              containerStyle={{ ...styles.courseControlButton, backgroundColor: THEME.CTA }}
              icon='audiotrack'
              onClick={playSound}
            />
            <Button
              labelStyle={styles.courseControlButtonIcon}
              containerStyle={styles.courseControlButton}
              icon='mic'
            />
            <Button
              labelStyle={styles.courseControlButtonIcon}
              containerStyle={styles.courseControlButton}
              icon='star'
            />
          </View>
        )}
      </View>
    </ScreenView>
  )
}

const styles = StyleSheet.create({
  courseControls: {
    width: '100%',
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    bottom: 70,
    justifyContent: 'space-around',
  },
  courseControlButton: {
    aspectRatio: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1.7 }],
  },
  activeCourseControlButton: {
    backgroundColor: THEME.CTA,
  },
  courseControlButtonIcon: {
    color: 'grey',
  },
  container: {
    flex: 1,
    alignContent: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    margin: 30,
    marginTop: 50,
  },
  title: {
    color: THEME.COLOR,
    fontFamily: FONTS.POPPINS.BOLD,
    fontSize: 27,
    textAlign: 'center',
    paddingHorizontal: 30,
    marginVertical: 40,
  },
  cards: {
    elevation: 5,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  card: {
    padding: 16,
  },
  cardContent: {
    borderRadius: 20,
    width: '100%',
    backgroundColor: 'white',
    overflow: 'hidden',
    paddingVertical: 70,
    paddingHorizontal: 32,
  },
  translation: {
    textAlign: 'center',
    fontFamily: FONTS.POPPINS.BOLD,
    fontSize: 20,
    marginBottom: 24,
  },
  original: {
    textAlign: 'center',
    fontFamily: FONTS.POPPINS.REGULAR,
    fontSize: 16,
    opacity: 0.5,
  },
  cardControls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    marginTop: 20,
    paddingHorizontal: 30,
  },
  cardControlPagination: {
    fontSize: 12,
    color: THEME.COLOR,
    alignSelf: 'center',
    textAlign: 'center',
  },
})
