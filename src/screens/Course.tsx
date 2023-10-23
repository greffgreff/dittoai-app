import { FONTS, THEME } from '../constants'
import { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, Text, Animated } from 'react-native'
import { useNavigation, useParams } from '.'
import useRecognition from '../hooks/useRecognition'
import useAudio from '../hooks/useAudio'
import Button from '../components/Button'
import PrimaryButton from '../components/PrimaryButton'
import SecondaryButton from '../components/SecondaryButton'
import ScreenView from '../components/ScreenView'
import PageView from '../components/PageView'
import ConfettiCannon from '../components/ConfettiCannon'

const audios = [
  require('../../assets/audio/1.m4a'),
  require('../../assets/audio/2.m4a'),
  require('../../assets/audio/3.m4a'),
  require('../../assets/audio/4.m4a'),
  require('../../assets/audio/5.m4a'),
  require('../../assets/audio/6.m4a'),
  require('../../assets/audio/7.m4a'),
  require('../../assets/audio/8.m4a'),
  require('../../assets/audio/9.m4a'),
  require('../../assets/audio/10.m4a'),
]

export default () => {
  const navigation = useNavigation()
  const { course } = useParams('course:home')
  const [pageView, setPageView] = useState<PageView | null>()
  const [cannon, setCannon] = useState<ConfettiCannon | null>()
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [isReady, setIsReady] = useState(false)
  const { isPlaying, playAudio, stopAudio } = useAudio()
  const { startRecording, stopRecording, clearRecognition, recognition, isRecording, isLoading, amplitude } =
    useRecognition('fr-FR')

  useEffect(() => {
    if (isReady) {
      clearRecognition()

      stopAudio().then(() => setTimeout(toggleAudio, 100))
    }
  }, [isReady, pageNumber])

  const toggleRecording = () => {
    clearRecognition()

    if (isPlaying) {
      stopAudio()
    }
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const toggleAudio = () => {
    clearRecognition()

    if (!isRecording) {
      if (isPlaying) {
        stopAudio()
      } else {
        playAudio(audios[course.sentences[pageNumber - 1].audio - 1!])
      }
    }
  }

  const handleClose = () => {
    clearRecognition()
    stopAudio()
    navigation.navigate('dashboard')
  }

  return (
    <ScreenView>
      <ConfettiCannon ref={setCannon} />

      <View style={styles.container}>
        <View style={styles.header}>
          <SecondaryButton
            icon='close'
            onClick={handleClose}
            containerStyle={{ transform: [{ scale: 1.4 }] }}
          />
          <SecondaryButton
            icon='edit'
            label='Refine Scenario'
            noticeMe
            labelFirst
            onClick={() => navigation.navigate('course:refine_scenario', { course })}
          />
        </View>

        <Text style={styles.title}>{course?.scenario.title}</Text>

        <View>
          <PageView ref={setPageView} onPageChange={setPageNumber}>
            {course?.sentences?.map((sentence, i) => (
              <View key={sentence.id} style={styles.card}>
                <View key={sentence.id} style={styles.cardContent}>
                  <Text style={styles.translation}>
                    <Sentence
                      onSuccess={cannon?.shoot}
                      translation={sentence?.translation!}
                      recognition={i === pageNumber - 1 ? recognition! : undefined}
                    />
                  </Text>
                  <Text style={styles.original}>{sentence.original}</Text>
                </View>
              </View>
            ))}
          </PageView>

          {isReady && (
            <View style={styles.cardControls}>
              <SecondaryButton
                label='Back'
                hide={pageNumber <= 1}
                labelStyle={{ opacity: 0.7 }}
                onClick={pageView?.turnPrevious}
              />
              <Text style={styles.cardControlPagination}>
                {pageNumber}/{course?.sentences.length}
              </Text>
              <SecondaryButton
                label='Next'
                hide={pageNumber >= course?.sentences.length!}
                labelStyle={{ opacity: 0.7 }}
                onClick={pageView?.turnNext}
              />
            </View>
          )}
        </View>

        {!isReady ? (
          <PrimaryButton
            label='Start!'
            containerStyle={styles.startButton}
            onClick={() => setIsReady(true)}
          />
        ) : (
          <View style={styles.courseControls}>
            <AnimatedButton icon='audiotrack' onClick={toggleAudio} toggle={isPlaying} />
            <AnimatedButton
              icon={isLoading ? 'loop' : isRecording ? 'stop' : 'mic'}
              onClick={toggleRecording}
              toggle={!isPlaying}
            />
            <AnimatedButton icon='star' />
          </View>
        )}
      </View>
    </ScreenView>
  )
}

const AnimatedButton = ({
  icon,
  onClick,
  toggle,
}: {
  icon: string
  onClick?: () => void
  toggle?: boolean
}) => {
  const animation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    animate()
  }, [toggle])

  const scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.4, 0, 1.4],
  })

  const backgroundColor = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['transparent', 'transparent', THEME.CTA],
  }) as any

  const animate = () => {
    Animated.timing(animation, {
      duration: 200,
      toValue: toggle ? 1 : 0,
      useNativeDriver: true,
    }).start()
  }

  return (
    <Button
      icon={icon}
      onClick={onClick}
      labelStyle={{ color: toggle ? 'white' : 'grey' }}
      containerStyle={{
        ...styles.courseControlButton,
        transform: [{ scale }],
        backgroundColor,
      }}
    />
  )
}

const Sentence = ({
  translation,
  recognition,
  onSuccess,
}: {
  translation: string
  recognition?: Recognition
  onSuccess?: () => void
}) => {
  const strip = (input: string) => {
    return input
      .replace(/[.,\/#!$%\^&\*;:{}=\\?_`~()]/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase()
  }

  const flagMismatch = (sentence1: string, sentence2: string) => {
    const words1 = sentence1.split(' ')
    const words2 = sentence2.split(' ')
    const maxLength = Math.max(words1.length, words2.length)
    const mismatchedIndicies: number[] = []

    for (let i = 0; i < maxLength; i++) {
      const word1 = words1[i] || ''
      const word2 = words2[i] || ''

      if (word1 !== word2) {
        mismatchedIndicies.push(i)
      }
    }

    return mismatchedIndicies
  }

  if (recognition) {
    const parsedTranslation = strip(translation)
    const parsedTranscripted = strip(recognition.transcript)
    const mismatched = flagMismatch(parsedTranslation, parsedTranscripted)

    if (!mismatched.length && onSuccess) {
      onSuccess()
    }

    return translation.split(' ').map((word, i) => (
      <Text
        key={i}
        style={{ color: mismatched.length ? 'red' : 'green' }}
        // style={{ color: mismatched.length ? (mismatched.includes(i) ? 'red' : 'black') : 'green' }}
      >
        {word + ' '}
      </Text>
    ))
  }

  return <Text>{translation}</Text>
}

const styles = StyleSheet.create({
  courseControls: {
    width: '100%',
    position: 'absolute',
    bottom: 70,
    paddingHorizontal: 70,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  startButton: {
    position: 'absolute',
    bottom: 70,
  },
  courseControlButton: {
    aspectRatio: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1.4 }],
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
  card: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    padding: 16,
  },
  cardContent: {
    elevation: 14,
    borderRadius: 20,
    width: '100%',
    backgroundColor: 'white',
    overflow: 'hidden',
    paddingVertical: 70,
    paddingHorizontal: 32,
  },
  cardControls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    fontSize: 14,
    marginTop: 20,
    paddingHorizontal: 30,
  },
  cardControlPagination: {
    color: THEME.COLOR,
    fontSize: 14,
    alignSelf: 'center',
    textAlign: 'center',
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
})
