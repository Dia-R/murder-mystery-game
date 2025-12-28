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

// Improved Typewriter component with better lifecycle control
const TypewriterLine = ({ 
  text, 
  onComplete,
  isCook = false,
  speed = 30,
  shouldStart = false
}: { 
  text: string, 
  onComplete: () => void,
  isCook?: boolean,
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

  const lineStyle = isCook ? styles.cookText : styles.investigatorText;

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

export default function BakerInterviewScreen() {
  const { height } = useWindowDimensions();
  const musicRef = useRef<Audio.Sound | null>(null);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isLineComplete, setIsLineComplete] = useState(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [shouldStartTypewriter, setShouldStartTypewriter] = useState(true);
  
  const backgroundRed = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Dialogue lines
  const dialogue = [
    // Opening thoughts
    { text: "It has been a while since anyone has required my services.", isCook: false },
    { text: "I better take notes while interviewing the suspects. The headmaster won't let me go back to repeat any questions. He finds this whole affair to be... a nuisance.", isCook: false },
    
    // Interview
    { text: "Introduce yourself.", isCook: false },
    { text: "Name's Mrs Georgetta Baker. I'm the cook in this school.", isCook: true },
    { text: "Where were you before the murder?", isCook: false },
    { text: "In the Kitchen, darling. We were all seeking reprive from the hollering of those music students. That brat was the worst of the bunch, shrieking in the Music Hall till the crack of dawn. By the time she'd be done, it'd be 5 in the morning and my turn to start peeling onions again, dammit-", isCook: true },
    { text: "Hold on. Who's we?", isCook: false },
    { text: "Me. And your other suspects. Word's gotten around. You're looking at her little lovers, aren't you?", isCook: true },
    { text: "I can't confirm or deny that.", isCook: false },
    { text: "Well, if you aren't gonna spill nothing more, then get on out.", isCook: true },
    { text: "Why, are you busy?", isCook: false },
    { text: "Of course. We're missing a kitchen knife. How do you think that looks for me?", isCook: true },
    { text: "Depends. What was your relationship like with Miss Ira Vale?", isCook: false },
    { text: "I fed her when she was hungry.", isCook: true },
    { text: "Did she have any enemies? Anyone who might have wanted to do this to her?", isCook: false },
    { text: "She *only* had enemies. Nobody likes that innocent little lamb act of hers. The Vale kid came here on my taxpayer money, stealing the seat of a paying student, and has the nerve to whimper to her professor about the gossip. And now because of her... everyone thinks. Argh!", isCook: true },
    { text: "The cook slammed a fist onto the table.", isCook: false },
    { text: "____", isCook: false },
    { text: "The investigation is cut short by Mrs Georgetta's fierce temper. I better try someone else now.", isCook: false },
  ];

  // Background color animation (black to red)
  const backgroundColor = backgroundRed.interpolate({
    inputRange: [0, dialogue.length],
    outputRange: ['rgba(0,0,0,1)', 'rgba(80,0,0,1)'],
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
      await sound.setRateAsync(0.6, false);
    } catch (error) {
      console.error('Error loading music:', error);
    }
  };

  // Navigate to Julian's interview
  const goToJulianInterview = async () => {
    if (musicRef.current && isMusicLoaded && isMusicPlaying) {
      await musicRef.current.pauseAsync();
    }
    router.push('/julian');
  };

  // Handle line completion
  const handleLineComplete = useCallback(() => {
    setIsLineComplete(true);
    setShowContinuePrompt(true);
    
    // Animate background redder as we progress
    Animated.timing(backgroundRed, {
      toValue: currentLineIndex + 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentLineIndex, backgroundRed]);

  // Advance to next line OR navigate to Julian on last line
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
      // Last line - navigate to Julian interview
      goToJulianInterview();
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
                  width: backgroundRed.interpolate({
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
            isCook={currentLine.isCook}
            speed={currentLine.isCook ? 25 : 30}
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
                {isLastLine ? "Continue to Julian Thorne" : "Tap or swipe up to continue"}
              </ThemedText>
              {isLastLine && (
                <ThemedText style={styles.nextSuspectHint}>
                  The Tortured Artist Awaits...
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
          <ThemedText style={styles.backIndicatorText}>Baker Interview</ThemedText>
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
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B0000',
  },
  progressText: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    color: 'rgba(201, 166, 107, 0.5)',
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
    color: '#C9A66B',
    lineHeight: 42,
    letterSpacing: 0.5,
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(201, 166, 107, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cookText: {
    fontSize: 36,
    fontFamily: Fonts.serif,
    color: '#E8D8C6',
    lineHeight: 46,
    letterSpacing: 0.3,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(232, 216, 198, 0.1)',
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
    color: 'rgba(201, 166, 107, 0.4)',
    marginBottom: 8,
  },
  continueHint: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: 'rgba(201, 166, 107, 0.4)',
    letterSpacing: 1,
    textAlign: 'center',
  },
  nextSuspectHint: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: 'rgba(139, 0, 0, 0.6)',
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
    color: 'rgba(201, 166, 107, 0.3)',
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
    color: 'rgba(139, 0, 0, 0.5)',
    letterSpacing: 2,
  },
});