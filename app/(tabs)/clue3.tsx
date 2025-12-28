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
  Image,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Typewriter component
const TypewriterLine = ({ 
  text, 
  onComplete,
  speed = 30,
  shouldStart = false
}: { 
  text: string, 
  onComplete: () => void,
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

  return (
    <View style={styles.typewriterContainer}>
      <ThemedText style={[styles.investigatorText, { opacity: isComplete ? 1 : 0.9 }]}>
        {displayedText}
        {!isComplete && hasStartedRef.current && (
          <ThemedText style={[styles.investigatorText, { opacity: 0.7 }]}>▋</ThemedText>
        )}
      </ThemedText>
    </View>
  );
};

export default function Clue3Screen() {
  const { height } = useWindowDimensions();
  const musicRef = useRef<Audio.Sound | null>(null);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLineComplete, setIsLineComplete] = useState(false);
  const [shouldStartTypewriter, setShouldStartTypewriter] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const backgroundGray = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Step content
  const steps = [
    // Step 0: Reflection on previous clue
    { 
      type: 'text',
      content: "Ira Vale was going to transfer to St. Accolades. Where have I heard that name before?",
    },
    // Step 1: Approaching the final suspect
    { 
      type: 'text',
      content: "I walk towards the office of my final suspect. There is no point in speculating. I must confirm things for myself.",
    },
    // Step 2: Finding the letter
    { 
      type: 'text',
      content: "As I inspect the room, I find a letter, but the contents seems strange. Is this my final clue?",
    },
    // Step 3: Display the cipher text
    { 
      type: 'cipher',
      content: `\nAv tf zvu,\n\nPa pz uva lhzf av spcl vbazpkl tf wyvaljapvu, pz pa? Iba P rllw tf wyvtpzlz. Aol Ilsmvyk uhtl dpss il ylabyulk av fvb hz svun hz fvb rllw bw fvby nvvk dvyr.\n\nIlmvyl fvb kpzhwwvpua tl, P dvukly, hyl fvb wylwhylk av spcl sprl fvby jhnlk ipyk?\n\nSvyk Ilsmvyk.`
    },
    // Step 4: Observation about the cipher
    { 
      type: 'text',
      content: "The clue seems to be some sort of cipher. I can stop here to think, or continue for a bit of help.",
    },
    // Step 5: Caesar cipher tool link
    { 
      type: 'link',
      content: "https://cryptii.com/pipes/caesar-cipher"
    },
    // Step 6: Question about the clue's meaning
    { 
      type: 'question',
      content: "What does the clue suggest?"
    },
    // Step 7: Realization
    { 
      type: 'text',
      content: "My hands tremble over the letter. I understand it now.",
    },
    // Step 8: Decision to see Headmaster
    { 
      type: 'text',
      content: "I must see the Headmaster.",
    },
    // Step 9: Divider
    { 
      type: 'divider',
      content: "____"
    },
  ];

  // Background color animation (gray tones)
  const backgroundColor = backgroundGray.interpolate({
    inputRange: [0, steps.length],
    outputRange: ['rgba(20,20,20,1)', 'rgba(60,60,60,1)'],
  });

  // Load background music
  const loadMusic = async () => {
    try {
      if (musicRef.current) {
        await musicRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/ira_living_vocals.mp3'),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.1,
          isMuted: false,
        }
      );

      musicRef.current = sound;
      setIsMusicLoaded(true);
      setIsMusicPlaying(true);
      await sound.setRateAsync(0.4, false); // Very slow for investigation mood
    } catch (error) {
      console.error('Error loading music:', error);
    }
  };

  // Open website link
  const openWebsite = (url: string) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open the link. Please check your connection.');
    });
  };

  // Handle option selection
  const selectOption = (option: string) => {
    setSelectedOption(option);
  };

  // Navigate to conclusion screen
  const goToConclusion = async () => {
    if (musicRef.current && isMusicLoaded && isMusicPlaying) {
      await musicRef.current.pauseAsync();
    }
    router.push('/conclusion'); // Navigate to conclusion.tsx
  };

  // Handle line completion
  const handleLineComplete = useCallback(() => {
    setIsLineComplete(true);
    
    // Animate background as we progress
    Animated.timing(backgroundGray, {
      toValue: currentStep + 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [currentStep, backgroundGray]);

  // Advance to next step
  const advanceToNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      // Regular step advance
      setIsLineComplete(false);
      setShouldStartTypewriter(false);
      setSelectedOption(null); // Reset selection for next question step
      
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
        // After fade, advance to next step
        setCurrentStep(prev => prev + 1);
        setShouldStartTypewriter(true);
      });
    } else {
      // Last step - navigate to conclusion
      goToConclusion();
    }
  }, [currentStep, steps.length, fadeAnim]);

  // Check if continue button should be enabled - ALWAYS TRUE NOW
  const isContinueEnabled = () => {
    return true; // Always enabled - user can click anytime
  };

  // Get continue button text
  const getContinueButtonText = () => {
    const isLastStep = currentStep === steps.length - 1;
    return isLastStep ? "Proceed to Headmaster" : "Continue";
  };

  useEffect(() => {
    loadMusic();

    return () => {
      if (musicRef.current) {
        musicRef.current.unloadAsync();
      }
    };
  }, []);

  // Current step data
  const currentStepData = steps[currentStep];

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated background */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
      
      {/* Subtle pattern overlay */}
      <View style={styles.patternOverlay} />

      {/* Main content area */}
      <View 
        style={styles.contentContainer}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  width: backgroundGray.interpolate({
                    inputRange: [0, steps.length],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} 
            />
          </View>
          <ThemedText style={styles.progressText}>
            Clue {currentStep + 1} / {steps.length}
          </ThemedText>
        </View>

        {/* Step content */}
        <Animated.View 
          style={[
            styles.stepContainer,
            { opacity: fadeAnim }
          ]}
        >
          {currentStepData.type === 'text' && (
            <TypewriterLine
              text={currentStepData.content}
              speed={35}
              onComplete={handleLineComplete}
              shouldStart={shouldStartTypewriter}
            />
          )}

          {currentStepData.type === 'divider' && (
            <View style={styles.dividerContainer}>
              <ThemedText style={styles.dividerText}>{currentStepData.content}</ThemedText>
            </View>
          )}

          {currentStepData.type === 'cipher' && (
            <View style={styles.cipherContainer}>
              <ThemedText style={styles.cipherTitle}>Encrypted Letter</ThemedText>
              
              <View style={styles.cipherWrapper}>
                <ThemedText style={styles.cipherText}>
                  {currentStepData.content}
                </ThemedText>
              </View>
              
              <ThemedText style={styles.cipherHint}>
                Hint: Make sure to copy this message to your notes!
              </ThemedText>
            </View>
          )}

          {currentStepData.type === 'link' && (
            <View style={styles.linkContainer}>
              <ThemedText style={styles.linkTitle}>
                Caesar Cipher Decoder
              </ThemedText>
              
              <ThemedText style={styles.linkDescription}>
                Use this online tool to decode the encrypted letter. Try different shift values.
              </ThemedText>
              
              <TouchableOpacity 
                style={styles.linkButton}
                onPress={() => openWebsite(currentStepData.content)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.linkButtonText}>
                  Open Caesar Cipher Tool
                </ThemedText>
                <ThemedText style={styles.linkUrl}>
                  cryptii.com/pipes/caesar-cipher
                </ThemedText>
              </TouchableOpacity>
              
              <ThemedText style={styles.linkNote}>
                Note: The "7" at the top suggests starting with shift 7.
              </ThemedText>
            </View>
          )}

          {currentStepData.type === 'question' && (
            <View style={styles.questionContainer}>
              <ThemedText style={styles.questionText}>
                {currentStepData.content}
              </ThemedText>
              
              <View style={styles.optionsContainer}>
                {[
                  'Ira Vale was blackmailing the Professor.',
                  'The Professor needed to impress his father to regain his title.',
                  'The Professor was concerned about Julian\'s fascination with Ira Vale.'
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      selectedOption === option && styles.optionButtonSelected
                    ]}
                    onPress={() => selectOption(option)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={[
                      styles.optionText,
                      selectedOption === option && styles.optionTextSelected
                    ]}>
                      {option}
                    </ThemedText>
                    {selectedOption === option && (
                      <ThemedText style={styles.optionSelectedIcon}>✓</ThemedText>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {selectedOption && (
                <ThemedText style={styles.selectionNote}>
                  Selected: {selectedOption}
                </ThemedText>
              )}
            </View>
          )}
        </Animated.View>

        {/* Manual Continue Button - ALWAYS CLICKABLE */}
        <View style={styles.continueContainer}>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={advanceToNextStep}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.continueButtonText}>
              {getContinueButtonText()}
            </ThemedText>
            <ThemedText style={styles.continueButtonIcon}>→</ThemedText>
          </TouchableOpacity>
          
          {/* Optional hint text - removed since button is always enabled */}
          {/* {!isContinueEnabled() && (
            <ThemedText style={styles.continueHint}>
              {currentStepData.type === 'text' && !isLineComplete && "Waiting for text to complete..."}
              {currentStepData.type === 'cipher' && !isLineComplete && "Examining the cipher..."}
              {currentStepData.type === 'question' && !selectedOption && "Select an option above to continue"}
              {currentStepData.type === 'divider' && !isLineComplete && "Waiting..."}
            </ThemedText>
          )} */}
        </View>
      </View>

      {/* Back indicator */}
      <View style={styles.backIndicator}>
        <ThemedText style={styles.backIndicatorText}>Evidence Analysis</ThemedText>
      </View>
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
    paddingBottom: 40, // Add padding for continue button
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
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#666',
  },
  progressText: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    color: 'rgba(150, 150, 150, 0.7)',
    letterSpacing: 1,
  },
  stepContainer: {
    width: '100%',
    minHeight: screenHeight * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40, // Space for continue button
  },
  typewriterContainer: {
    width: '100%',
    maxWidth: 600,
  },
  investigatorText: {
    fontSize: 32,
    fontFamily: Fonts.serif,
    color: '#B0B0B0',
    lineHeight: 42,
    letterSpacing: 0.5,
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(176, 176, 176, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  dividerContainer: {
    paddingVertical: 40,
  },
  dividerText: {
    fontSize: 28,
    color: '#666',
    opacity: 0.5,
  },
  cipherContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  cipherTitle: {
    fontSize: 28,
    fontFamily: Fonts.serif,
    color: '#B0B0B0',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cipherWrapper: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    padding: 25,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(100, 100, 100, 0.3)',
    marginBottom: 20,
    width: '100%',
  },
  cipherText: {
    fontSize: 18,
    fontFamily: Fonts.mono,
    color: '#B0B0B0',
    lineHeight: 28,
    textAlign: 'left',
  },
  cipherHint: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: 'rgba(150, 150, 150, 0.7)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  linkContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  linkTitle: {
    fontSize: 28,
    fontFamily: Fonts.serif,
    color: '#B0B0B0',
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  linkDescription: {
    fontSize: 18,
    fontFamily: Fonts.sans,
    color: '#999',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  linkButton: {
    backgroundColor: 'rgba(40, 60, 40, 0.8)',
    paddingVertical: 25,
    paddingHorizontal: 35,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(80, 120, 80, 0.4)',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  linkButtonText: {
    fontSize: 20,
    fontFamily: Fonts.serif,
    color: '#A0D0A0',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  linkUrl: {
    fontSize: 14,
    fontFamily: Fonts.mono,
    color: 'rgba(160, 208, 160, 0.7)',
    fontStyle: 'italic',
  },
  linkNote: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: 'rgba(150, 150, 150, 0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 15,
  },
  questionContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  questionText: {
    fontSize: 28,
    fontFamily: Fonts.serif,
    color: '#B0B0B0',
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 36,
  },
  optionsContainer: {
    width: '100%',
    gap: 15,
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(100, 100, 100, 0.3)',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
  },
  optionButtonSelected: {
    borderColor: 'rgba(100, 150, 100, 0.6)',
    backgroundColor: 'rgba(40, 60, 40, 0.8)',
  },
  optionText: {
    fontSize: 20,
    fontFamily: Fonts.sans,
    color: '#B0B0B0',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  optionTextSelected: {
    color: '#A0D0A0',
  },
  optionSelectedIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    fontSize: 16,
    color: '#A0D0A0',
    fontWeight: 'bold',
  },
  selectionNote: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: 'rgba(150, 150, 150, 0.7)',
    fontStyle: 'italic',
    marginTop: 10,
  },
  // Continue button styles
  continueContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: 'rgba(60, 60, 80, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(100, 100, 140, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: Fonts.serif,
    color: '#B0B0E0',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 10,
  },
  continueButtonIcon: {
    fontSize: 20,
    color: '#B0B0E0',
    fontWeight: 'bold',
  },
  continueHint: {
    fontSize: 12,
    fontFamily: Fonts.sans,
    color: 'rgba(150, 150, 150, 0.5)',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
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
    color: 'rgba(100, 100, 100, 0.5)',
    letterSpacing: 2,
  },
});