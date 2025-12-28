import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Animated, 
  StyleSheet, 
  TouchableOpacity, 
  useWindowDimensions, 
  View,
  Dimensions,
  PanResponder
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Typewriter component
const TypewriterLine = ({ 
  text, 
  onComplete,
  isDante = false,
  speed = 30,
  shouldStart = false
}: { 
  text: string, 
  onComplete: () => void,
  isDante?: boolean,
  speed?: number,
  shouldStart: boolean
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setIsComplete(false);
    hasStartedRef.current = false;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [text]);

  useEffect(() => {
    if (!shouldStart || hasStartedRef.current || isComplete) return;
    
    hasStartedRef.current = true;
    let currentIndex = 0;
    
    intervalRef.current = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.substring(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onComplete();
      }
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldStart, text, speed, onComplete, isComplete]);

  const lineStyle = isDante ? styles.danteText : styles.investigatorText;

  return (
    <View style={styles.typewriterContainer}>
      <ThemedText style={[lineStyle, { opacity: isComplete ? 1 : 0.9 }]}>
        {displayedText}
        {!isComplete && hasStartedRef.current && (
          <ThemedText style={[lineStyle, { opacity: 0.7 }]}>▋</ThemedText>
        )}
      </ThemedText>
    </View>
  );
};

export default function DanteInterviewScreen() {
  const { height } = useWindowDimensions();
  const musicRef = useRef<Audio.Sound | null>(null);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isLineComplete, setIsLineComplete] = useState(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [shouldStartTypewriter, setShouldStartTypewriter] = useState(true);
  
  const backgroundPurple = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Dialogue lines
  const dialogue = [
    // Investigator's thoughts
    { text: "Ira Vale being poisoned to death, huh? Strange, there are so many rumours about her.", isDante: false },
    { text: "I guess it comes with being the only commoner in a school for aristocrats. Everyone who comes in contact with her becomes the subject of scrutiny.", isDante: false },
    { text: "I need to meet my final suspect.", isDante: false },
    
    // Interview begins
    { text: "Introduce yourself.", isDante: false },
    { text: "I am Professor Danté Belford. I was formerly of House Belford. Thankfully, I have found a new job here.", isDante: true },
    { text: "And what is your relationship with the deceased?", isDante: false },
    { text: "I was her mentor. She was a student I advocated strongly for.", isDante: true },
    { text: "Why?", isDante: false },
    { text: "Her voice is undeniable. Her background is unsavoury. She doesn't follow the school rules. And many would agree that she spends far too much time with her head up in the clouds with that Thorne boy. But yes, that voice is worth the trouble.", isDante: true },
    { text: "Who do you think killed her?", isDante: false },
    { text: "Unlike the rumours floating around, I did not strangle her to death. It'd be a crime to damage that voice of hers. I am Professor of Music, you realise.", isDante: true },
    { text: "If I may ask, Professor, have you been having a difficult time recently? There is a lot of talk about you and the deceased.", isDante: false },
    { text: "It is no secret. Miss Vale... She was my golden goose. The Conservatory has been able to sweep award after award, accolade after accolade, thanks to her. I was going to sign her up for upcoming La Fianza Competition against St. Accolade's.", isDante: true },
    { text: "I must say, that is a lot of money she must have won and yet, the records show that she was being sponsored till the time of her murder.", isDante: false },
    { text: "Do you really think the Conservatory would ever let her grow wings? She showed her cards too early. Her mistake was letting the headmaster know that she came here to earn money for her family. He knew exactly how to keep her from leaving.", isDante: true },
    { text: "By making sure that she never had access to what she won?", isDante: false },
    { text: "Yes.", isDante: true },
    { text: "That works out for you too, doesn't it?", isDante: false },
    { text: "It does. Her wins will remain credited to my name.", isDante: true },
    { text: "And you've allowed this since...Always?", isDante: false },
    { text: "Always.", isDante: true },
    { text: "____", isDante: false },
    { text: "The professor's cold pragmatism leaves me feeling uneasy. I return to the Music Hall. It's time for me piece together the clues.", isDante: false },
  ];

  // Background color animation (black to purple)
  const backgroundColor = backgroundPurple.interpolate({
    inputRange: [0, dialogue.length],
    outputRange: ['rgba(0,0,0,1)', 'rgba(60,0,60,1)'],
  });

  // Load music
  const loadMusic = async () => {
    try {
      if (musicRef.current) {
        await musicRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/ira_reversed.mp3'),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.15,
          isMuted: false,
        }
      );

      musicRef.current = sound;
      setIsMusicLoaded(true);
      setIsMusicPlaying(true);
      await sound.setRateAsync(0.5, false); // Slower for more ominous mood
    } catch (error) {
      console.error('Error loading music:', error);
    }
  };

  // Navigate to clue screen
  const goToClues = async () => {
    if (musicRef.current && isMusicLoaded && isMusicPlaying) {
      await musicRef.current.pauseAsync();
    }
    router.push('/clue1');
  };

  // Handle line completion
  const handleLineComplete = useCallback(() => {
    setIsLineComplete(true);
    setShowContinuePrompt(true);
    
    // Animate background purpler as we progress
    Animated.timing(backgroundPurple, {
      toValue: currentLineIndex + 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentLineIndex, backgroundPurple]);

  // Advance to next line OR navigate on last line
  const advanceToNextLine = useCallback(() => {
    if (currentLineIndex < dialogue.length - 1) {
      // Regular line advance
      setShowContinuePrompt(false);
      setIsLineComplete(false);
      setShouldStartTypewriter(false);
      
      // Fade transition
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After fade, advance to next line
        setCurrentLineIndex(prev => prev + 1);
        setShouldStartTypewriter(true);
      });
    } else {
      // Last line - navigate to clues
      goToClues();
    }
  }, [currentLineIndex, dialogue.length, fadeAnim]);

  // Handle tap to advance
  const handleTap = useCallback(() => {
    if (isLineComplete) {
      advanceToNextLine();
    }
  }, [isLineComplete, advanceToNextLine]);

  // Handle swipe up to advance
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        if (isLineComplete && gestureState.dy < -50) {
          advanceToNextLine();
        }
      },
    })
  ).current;

  useEffect(() => {
    loadMusic();

    return () => {
      if (musicRef.current) {
        musicRef.current.unloadAsync();
      }
    };
  }, []);

  // Current line data
  const currentLine = dialogue[currentLineIndex];
  const isLastLine = currentLineIndex === dialogue.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated background */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
      
      {/* Subtle pattern overlay */}
      <View style={styles.patternOverlay} />

      {/* Main content area */}
      <View 
        style={styles.contentContainer}
        {...panResponder.panHandlers}
        onTouchEnd={handleTap}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: backgroundPurple.interpolate({
                    inputRange: [0, dialogue.length],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>
            {currentLineIndex + 1} / {dialogue.length}
          </ThemedText>
        </View>

        {/* Typewriter line */}
        <Animated.View 
          style={[
            styles.lineContainer,
            { opacity: fadeAnim }
          ]}
        >
          <TypewriterLine
            text={currentLine.text}
            isDante={currentLine.isDante}
            speed={currentLine.isDante ? 32 : 30}
            onComplete={handleLineComplete}
            shouldStart={shouldStartTypewriter}
          />
        </Animated.View>

        {/* Continue prompt - shows on ALL lines including last one */}
        {showContinuePrompt && (
          <Animated.View 
            style={[
              styles.continuePrompt,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity 
              onPress={advanceToNextLine}
              activeOpacity={0.7}
              style={styles.continueButton}
            >
              <ThemedText style={styles.continueText}>▼</ThemedText>
              <ThemedText style={styles.continueHint}>
                {isLastLine ? "Review the Clues" : "Tap or swipe up to continue"}
              </ThemedText>
              {isLastLine && (
                <ThemedText style={styles.nextClueHint}>
                  All suspects interviewed • Time to solve the case
                </ThemedText>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Tap indicator (subtle) - only for non-last lines */}
        {isLineComplete && !showContinuePrompt && !isLastLine && (
          <View style={styles.tapIndicator}>
            <ThemedText style={styles.tapIndicatorText}>Tap to continue</ThemedText>
          </View>
        )}
      </View>

      {/* Back indicator for first line only */}
      {currentLineIndex === 0 && (
        <View style={styles.backIndicator}>
          <ThemedText style={styles.backIndicatorText}>Belford Interview</ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.02,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  progressContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(80, 0, 80, 0.2)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#800080',
  },
  progressText: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    color: 'rgba(201, 166, 207, 0.5)',
    letterSpacing: 1,
  },
  lineContainer: {
    width: '100%',
    minHeight: screenHeight * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typewriterContainer: {
    width: '100%',
    maxWidth: 600,
  },
  investigatorText: {
    fontSize: 32,
    fontFamily: Fonts.serif,
    color: '#C9A6CF',
    lineHeight: 42,
    letterSpacing: 0.5,
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(201, 166, 207, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  danteText: {
    fontSize: 36,
    fontFamily: Fonts.serif,
    color: '#D8C6E8',
    lineHeight: 46,
    letterSpacing: 0.3,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(216, 198, 232, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  continuePrompt: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  continueButton: {
    alignItems: 'center',
    padding: 20,
  },
  continueText: {
    fontSize: 32,
    color: 'rgba(201, 166, 207, 0.4)',
    marginBottom: 8,
  },
  continueHint: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: 'rgba(201, 166, 207, 0.4)',
    letterSpacing: 1,
    textAlign: 'center',
  },
  nextClueHint: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: 'rgba(128, 0, 128, 0.6)',
    fontStyle: 'italic',
    letterSpacing: 1,
    marginTop: 4,
  },
  tapIndicator: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  tapIndicatorText: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: 'rgba(201, 166, 207, 0.3)',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  backIndicator: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  backIndicatorText: {
    fontSize: 14,
    fontFamily: Fonts.mono,
    color: 'rgba(128, 0, 128, 0.5)',
    letterSpacing: 2,
  },
});