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
  PanResponder,
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

export default function Clue1Screen() {
  const { height } = useWindowDimensions();
  const musicRef = useRef<Audio.Sound | null>(null);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLineComplete, setIsLineComplete] = useState(false);
  const [shouldStartTypewriter, setShouldStartTypewriter] = useState(true);
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  
  const backgroundGray = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Step content
  const steps = [
    // Step 0: Entering the recording booth
    { 
      type: 'text',
      content: "I enter the recording booth. The air is thick with silence. Blood stains the leather seat, a dark crimson against the worn material. I notice my first clue.",
    },
    // Step 1: Google Drive link
    { 
      type: 'link',
      content: "https://drive.google.com/file/d/1dPZ7vgeXT6ArM8aqjUs1iv6eY6ObSzwB/view?usp=sharing"
    },
    // Step 2: Audio analysis
    { 
      type: 'text',
      content: "Hmm... The audio seems to have been purposely jumbled up. I'll pause here to think about how to solve this, but if I need a helping hand, I can continue on...",
    },
    // Step 3: Website link
    { 
      type: 'link',
      content: "https://mp3cut.net/reverse-audio"
    },
    // Step 4: Weapon selection
    { 
      type: 'question',
      content: "What did you hear in the reversed audio?"
    },
    // Step 5: Conclusion
    { 
      type: 'text',
      content: "I note down the murder weapon. This doesn't help much, does it...? The evidence is still murky. I must proceed to the second clue."
    },
    // Step 6: Divider
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

  // Handle weapon selection
  const selectWeapon = (weapon: string) => {
    setSelectedWeapon(weapon);
  };

  // Navigate to next clue screen
  const goToNextClue = async () => {
    if (musicRef.current && isMusicLoaded && isMusicPlaying) {
      await musicRef.current.pauseAsync();
    }
    router.push('/clue2'); // This should navigate to clue2.tsx
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
      setSelectedWeapon(null); // Reset selection for next question step
      
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
      // Last step - navigate to next clue
      goToNextClue();
    }
  }, [currentStep, steps.length, fadeAnim]);

  // Check if continue button should be enabled - ALWAYS TRUE
  const isContinueEnabled = () => {
    return true; // Always enabled - user can click anytime
  };

  // Get continue button text
  const getContinueButtonText = () => {
    const isLastStep = currentStep === steps.length - 1;
    return isLastStep ? "Continue to Next Clue" : "Continue";
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

          {currentStepData.type === 'link' && (
            <View style={styles.linkContainer}>
              <ThemedText style={styles.linkTitle}>
                {currentStep === 1 ? "Audio Clue" : "Audio Analysis Tool"}
              </ThemedText>
              
              <ThemedText style={styles.linkDescription}>
                {currentStep === 1 
                  ? "Access the audio clue from Google Drive. Listen carefully for hidden details."
                  : "Use this website to reverse the audio and analyze the hidden message."}
              </ThemedText>
              
              <TouchableOpacity 
                style={[
                  styles.linkButton,
                  currentStep === 1 && styles.googleDriveButton
                ]}
                onPress={() => openWebsite(currentStepData.content)}
                activeOpacity={0.7}
              >
                <ThemedText style={[
                  styles.linkButtonText,
                  currentStep === 1 && styles.googleDriveButtonText
                ]}>
                  {currentStep === 1 
                    ? "Open Google Drive Audio" 
                    : "Open Audio Reverser Website"}
                </ThemedText>
                <ThemedText style={[
                  styles.linkUrl,
                  currentStep === 1 && styles.googleDriveUrl
                ]}>
                  {currentStep === 1 
                    ? "drive.google.com/file/d/1dPZ7vgeXT6ArM8aqjUs1iv6eY6ObSzwB"
                    : "mp3cut.net/reverse-audio"}
                </ThemedText>
              </TouchableOpacity>
              
              <ThemedText style={styles.linkNote}>
                {currentStep === 1
                  ? "Note: The audio file will open in your browser. Listen carefully and return here."
                  : "Note: The website will open in your browser. Return here after analysis."}
              </ThemedText>
            </View>
          )}

          {currentStepData.type === 'question' && (
            <View style={styles.questionContainer}>
              <ThemedText style={styles.questionText}>
                {currentStepData.content}
              </ThemedText>
              
              <View style={styles.weaponsContainer}>
                {['Knife', 'Rope', 'Poison'].map((weapon) => (
                  <TouchableOpacity
                    key={weapon}
                    style={[
                      styles.weaponButton,
                      selectedWeapon === weapon && styles.weaponButtonSelected
                    ]}
                    onPress={() => selectWeapon(weapon)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={[
                      styles.weaponText,
                      selectedWeapon === weapon && styles.weaponTextSelected
                    ]}>
                      {weapon}
                    </ThemedText>
                    {selectedWeapon === weapon && (
                      <ThemedText style={styles.weaponSelectedIcon}>✓</ThemedText>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {selectedWeapon && (
                <ThemedText style={styles.selectionNote}>
                  Selected: {selectedWeapon}
                </ThemedText>
              )}
            </View>
          )}
        </Animated.View>

        {/* Manual Continue Button - ALWAYS VISIBLE AND CLICKABLE */}
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
          
          {/* Hint text - optional, can be removed */}
          {/* {!isContinueEnabled() && (
            <ThemedText style={styles.continueHint}>
              {currentStepData.type === 'text' && !isLineComplete && "Waiting for text to complete..."}
              {currentStepData.type === 'question' && !selectedWeapon && "Select an option above to continue"}
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
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    paddingVertical: 25,
    paddingHorizontal: 35,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(80, 80, 120, 0.4)',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  googleDriveButton: {
    backgroundColor: 'rgba(30, 60, 40, 0.8)',
    borderColor: 'rgba(80, 120, 80, 0.4)',
  },
  linkButtonText: {
    fontSize: 20,
    fontFamily: Fonts.serif,
    color: '#A0A0D0',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  googleDriveButtonText: {
    color: '#A0D0A0',
  },
  linkUrl: {
    fontSize: 14,
    fontFamily: Fonts.mono,
    color: 'rgba(160, 160, 208, 0.7)',
    fontStyle: 'italic',
  },
  googleDriveUrl: {
    color: 'rgba(160, 208, 160, 0.7)',
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
  weaponsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 30,
  },
  weaponButton: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(100, 100, 100, 0.3)',
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  weaponButtonSelected: {
    borderColor: 'rgba(150, 100, 100, 0.6)',
    backgroundColor: 'rgba(60, 40, 40, 0.8)',
  },
  weaponText: {
    fontSize: 22,
    fontFamily: Fonts.serif,
    color: '#B0B0B0',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  weaponTextSelected: {
    color: '#D0A0A0',
  },
  weaponSelectedIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 16,
    color: '#D0A0A0',
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