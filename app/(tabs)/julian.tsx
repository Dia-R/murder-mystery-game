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
  isJulian = false,
  speed = 30,
  shouldStart = false
}: { 
  text: string, 
  onComplete: () => void,
  isJulian?: boolean,
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

  const lineStyle = isJulian ? styles.julianText : styles.investigatorText;

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

export default function JulianInterviewScreen() {
  const { height } = useWindowDimensions();
  const musicRef = useRef<Audio.Sound | null>(null);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isLineComplete, setIsLineComplete] = useState(false);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [shouldStartTypewriter, setShouldStartTypewriter] = useState(true);
  
  const backgroundBlue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Dialogue lines
  const dialogue = [
    // Investigator's thoughts
    { text: "My conversation with the cook was a mess.", isJulian: false },
    { text: "How curious, though. A knife is missing in the kitchen. Could that be the murder weapon? I need to talk to the other suspects.", isJulian: false },
    
    // Interview begins
    { text: "Introduce yourself.", isJulian: false },
    { text: "You... What brings you here?", isJulian: true },
    { text: "Please, be at ease. I'm only here to ask a few questions.", isJulian: false },
    { text: "Hmph. I am Julian of House Thorne, heir apparent to the Northern Dukedom. But to you, I'm a student of this Conservatory. I study the classical arts, largely as a painter.", isJulian: true },
    { text: "There aren't many of those here. You must be talented.", isJulian: false },
    { text: "Talent? No. I had a muse. Oh, oh yes I did! The songbird Ira... Oh, that poor bird. It was nothing short of miraculous, how that little thing gave life to my paintings. Because of her, the school has allowed me to use this studio to my heart's desire.", isJulian: true },
    { text: "You must be devastated.", isJulian: false },
    { text: "Oh, spare me your pity. You think I did it.", isJulian: true },
    { text: "Why would I?", isJulian: false },
    { text: "My little songbird was poisoned. I'm the only one with access to turpentine. Enough to kill an elephant, I imagine.", isJulian: true },
    { text: "How could everyone suspect you like that... They just don't realise what you had with her...", isJulian: false },
    { text: "Exactly. Oh, heavens, exactly! I begged father to pay for her tuition when I stumbled upon her during the entrance auditions. Since then, we've shared a bond like no other. I let her sing, and she lets me paint. Or we would have... until...", isJulian: true },
    { text: "Until?", isJulian: false },
    { text: "Julian blinks. For the first time, he seems to be watching his words. Carefully, he speaks after a moment.", isJulian: false },
    { text: "Until she died.", isJulian: true },
    { text: "The tone of the conversation has changed, and he's no longer offering much. I ask one last question.", isJulian: false },
    { text: "Who do you suspect killed her?", isJulian: false },
    { text: "Hahaha! Pain is the greatest source of art. With everyone hating that poor girl... it just made her so perfect. That's whom you must suspect, Investigator [REDACTED]. Everyone.", isJulian: true },
    { text: "____", isJulian: false },
    { text: "The tortured artist retreats into his studio, leaving me with more questions than answers.", isJulian: false },
  ];

  // Background color animation (black to blue)
  const backgroundColor = backgroundBlue.interpolate({
    inputRange: [0, dialogue.length],
    outputRange: ['rgba(0,0,0,1)', 'rgba(0,0,80,1)'],
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
      await sound.setRateAsync(0.7, false); // Slightly faster for different mood
    } catch (error) {
      console.error('Error loading music:', error);
    }
  };

  // Navigate to next suspect (Professor Gray)
  const goToNextInterview = async () => {
    if (musicRef.current && isMusicLoaded && isMusicPlaying) {
      await musicRef.current.pauseAsync();
    }
    router.push('/gray'); // Change this to your next interview screen
  };

  // Handle line completion
  const handleLineComplete = useCallback(() => {
    setIsLineComplete(true);
    setShowContinuePrompt(true);
    
    // Animate background bluer as we progress
    Animated.timing(backgroundBlue, {
      toValue: currentLineIndex + 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentLineIndex, backgroundBlue]);

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
      // Last line - navigate to next interview
      goToNextInterview();
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
                  width: backgroundBlue.interpolate({
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
            isJulian={currentLine.isJulian}
            speed={currentLine.isJulian ? 28 : 30}
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
                {isLastLine ? "Continue Investigation" : "Tap or swipe up to continue"}
              </ThemedText>
              {isLastLine && (
                <ThemedText style={styles.nextSuspectHint}>
                  The Disowned Professor
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
          <ThemedText style={styles.backIndicatorText}>Thorne Interview</ThemedText>
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
    backgroundColor: 'rgba(0, 0, 139, 0.2)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00008B',
  },
  progressText: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    color: 'rgba(166, 201, 107, 0.5)',
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
    color: '#A6C96B',
    lineHeight: 42,
    letterSpacing: 0.5,
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(166, 201, 107, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  julianText: {
    fontSize: 36,
    fontFamily: Fonts.serif,
    color: '#C6E8D8',
    lineHeight: 46,
    letterSpacing: 0.3,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(198, 232, 216, 0.1)',
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
    color: 'rgba(166, 201, 107, 0.4)',
    marginBottom: 8,
  },
  continueHint: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: 'rgba(166, 201, 107, 0.4)',
    letterSpacing: 1,
    textAlign: 'center',
  },
  nextSuspectHint: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: 'rgba(0, 0, 139, 0.6)',
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
    color: 'rgba(166, 201, 107, 0.3)',
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
    color: 'rgba(0, 0, 139, 0.5)',
    letterSpacing: 2,
  },
});