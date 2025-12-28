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
  Dimensions
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

export default function ConclusionScreen() {
  const { height } = useWindowDimensions();
  const musicRef = useRef<Audio.Sound | null>(null);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLineComplete, setIsLineComplete] = useState(false);
  const [shouldStartTypewriter, setShouldStartTypewriter] = useState(true);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [revealedTruth, setRevealedTruth] = useState(false);
  
  const backgroundGray = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Step content
  const steps = [
    // Step 0: Entering the Music Hall
    { 
      type: 'text',
      content: "The headmaster seems bored as I walk into the Music Hall. There, the three suspects are seated opposite me, with the damning pieces of evidence sitting across them.",
    },
    // Step 1: Suspect reactions
    { 
      type: 'text',
      content: "Mrs. Georgetta looks at me with an annoyed expression, as if wondering who stole the knife.",
    },
    // Step 2: Julian's reaction
    { 
      type: 'text',
      content: "Julian is grinning at his portrait of Ira Vale.",
    },
    // Step 3: Professor's reaction
    { 
      type: 'text',
      content: "The professor stares straight ahead.",
    },
    // Step 4: The question
    { 
      type: 'question',
      content: "Well, who did it?"
    },
    // Step 5: Headmaster's prompt
    { 
      type: 'text',
      content: "Well done, Investigator [REDACTED]. Are you ready to reveal the truth?",
    },
    // Step 6: Mrs. Georgetta analysis
    { 
      type: 'text',
      content: "Mrs. Georgetta is from the United Colonies. She came here to work and support her family. Her biggest gripe with Ira Vale was her loud practices. I did consider that might have been her since the murder weapon was a knife, but all three suspects were present in the kitchen before the murder. It could have been any of them.",
    },
    // Step 7: Mrs. Georgetta's reaction
    { 
      type: 'text',
      content: "Mrs. Georgetta nods in approval.",
    },
    // Step 8: Julian Thorne analysis
    { 
      type: 'text',
      content: "Julian Thorne. He's certainly an eccentric individual, and I do not put murder past him if it is in the name of art—",
    },
    // Step 9: Julian's reaction
    { 
      type: 'text',
      content: "Julian shrugs.",
    },
    // Step 10: Julian analysis continued
    { 
      type: 'text',
      content: "—But it is clear that Ira Vale fuelled his creativity. As such, killing her would have been a foolish endeavour, even if her transfer to St. Accolades angered him.",
    },
    // Step 11: The accusation
    { 
      type: 'text',
      content: "The one who stood to lose the most was this man right here. Professor Danté.",
    },
    // Step 12: The motive
    { 
      type: 'text',
      content: "Having been disowned by his family, his only way back in was to make a name for himself. When Ira decided to transfer out to regain agency over her life, she threatened to tear down everything Danté had built for himself.",
    },
    // Step 13: The silence
    { 
      type: 'text',
      content: "The room is silent.",
    },
    // Step 14: Headmaster's reaction
    { 
      type: 'text',
      content: "The Headmaster claps, not quite caring about the resolution.",
    },
    // Step 15: The investigator's final thoughts
    { 
      type: 'text',
      content: "I can't help myself. My lips purse, and I continue.",
    },
    // Step 16: The moral indictment
    { 
      type: 'text',
      content: "While Ira Vale suffered in silence, none of you saw her as anything more than a means to your own ends. The Cook, consumed by her own survival; Julian, romanticizing her pain for art; and Professor Danté, building his reputation on her talent.",
    },
    // Step 17: The final accusation
    { 
      type: 'text',
      content: "And yet, in fear of becoming a commoner like her, Professor Danté, you have found it fit to commit such a horrific crime—",
    },
    // Step 18: Headmaster interrupts
    { 
      type: 'text',
      content: "The Headmaster raises his hand, motioning for me to stop.",
    },
    // Step 19: Case closed
    { 
      type: 'text',
      content: "Thank you, Investigator [REDACTED]. It is clear. The case is closed.",
    },
    // Step 20: Departure
    { 
      type: 'text',
      content: "I have overstayed my welcome. My moral chiding is not required here.",
    },
    // Step 21: Return home
    { 
      type: 'text',
      content: "I return home.",
    },
    // Step 22: Final line
    { 
      type: 'text',
      content: "Justice has come here to die.",
    },
    // Step 23: Divider
    { 
      type: 'divider',
      content: "____"
    },
    // Step 24: Play again button
    { 
      type: 'restart',
      content: "Case Closed"
    },
  ];

  // Background color animation (getting darker as we reach conclusion)
  const backgroundColor = backgroundGray.interpolate({
    inputRange: [0, steps.length],
    outputRange: ['rgba(30,30,30,1)', 'rgba(10,10,10,1)'],
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
          volume: 0.08, // Even quieter for conclusion
          isMuted: false,
        }
      );

      musicRef.current = sound;
      setIsMusicLoaded(true);
      setIsMusicPlaying(true);
      await sound.setRateAsync(0.3, false); // Slower for somber conclusion
    } catch (error) {
      console.error('Error loading music:', error);
    }
  };

  // Handle suspect selection
  const selectSuspect = (suspect: string) => {
    setSelectedSuspect(suspect);
    if (suspect === 'Professor Danté') {
      setRevealedTruth(true);
    }
  };

  // Restart the game
  const restartGame = async () => {
    if (musicRef.current && isMusicLoaded && isMusicPlaying) {
      await musicRef.current.stopAsync();
      await musicRef.current.unloadAsync();
    }
    router.push('/'); // Navigate back to start screen
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
    }
  }, [currentStep, steps.length, fadeAnim]);

  // Get continue button text
  const getContinueButtonText = () => {
    const currentStepData = steps[currentStep];
    if (currentStepData.type === 'restart') {
      return "Investigate Another Case";
    }
    return "Continue";
  };

  // Handle Continue button press - different behavior for question step
  const handleContinuePress = useCallback(() => {
    const currentStepData = steps[currentStep];
    
    if (currentStepData.type === 'question' && selectedSuspect === null) {
      // If on question step and no selection made, do nothing
      // User should select an option first, but button is still clickable
      return;
    }
    
    if (currentStepData.type === 'restart') {
      restartGame();
      return;
    }
    
    advanceToNextStep();
  }, [currentStep, steps, selectedSuspect, advanceToNextStep]);

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
        {/* Progress indicator - hidden for conclusion */}
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
            Conclusion
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
              speed={40} // Slightly slower for dramatic effect
              onComplete={handleLineComplete}
              shouldStart={shouldStartTypewriter}
            />
          )}

          {currentStepData.type === 'divider' && (
            <View style={styles.dividerContainer}>
              <ThemedText style={styles.dividerText}>{currentStepData.content}</ThemedText>
            </View>
          )}

          {currentStepData.type === 'question' && (
            <View style={styles.questionContainer}>
              <ThemedText style={styles.questionText}>
                {currentStepData.content}
              </ThemedText>
              
              <View style={styles.optionsContainer}>
                {[
                  'Mrs. Georgetta',
                  'Julian Thorne', 
                  'Professor Danté'
                ].map((suspect) => (
                  <TouchableOpacity
                    key={suspect}
                    style={[
                      styles.suspectButton,
                      selectedSuspect === suspect && styles.suspectButtonSelected,
                      selectedSuspect && selectedSuspect !== suspect && styles.suspectButtonWrong
                    ]}
                    onPress={() => selectSuspect(suspect)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={[
                      styles.suspectText,
                      selectedSuspect === suspect && styles.suspectTextSelected,
                      selectedSuspect && selectedSuspect !== suspect && styles.suspectTextWrong
                    ]}>
                      {suspect}
                    </ThemedText>
                    {selectedSuspect === suspect && (
                      <ThemedText style={[
                        styles.suspectSelectedIcon,
                        suspect === 'Professor Danté' ? styles.suspectCorrectIcon : styles.suspectWrongIcon
                      ]}>
                        {suspect === 'Professor Danté' ? '✓' : '✗'}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              {selectedSuspect && (
                <ThemedText style={[
                  styles.selectionNote,
                  selectedSuspect === 'Professor Danté' ? styles.correctNote : styles.wrongNote
                ]}>
                  {selectedSuspect === 'Professor Danté' 
                    ? "Correct. The evidence points to Professor Danté."
                    : "Incorrect. Consider the evidence more carefully."}
                </ThemedText>
              )}
              
              {/* Hint for question step */}
              {!selectedSuspect && (
                <ThemedText style={styles.questionHint}>
                  Select a suspect above, then click Continue
                </ThemedText>
              )}
            </View>
          )}

          {currentStepData.type === 'restart' && (
            <View style={styles.restartContainer}>
              <ThemedText style={styles.restartTitle}>
                Case Closed
              </ThemedText>
              
              <ThemedText style={styles.restartDescription}>
                The investigation is complete.
              </ThemedText>
              
              <TouchableOpacity 
                style={styles.restartButton}
                onPress={restartGame}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.restartButtonText}>
                  Investigate Another Case
                </ThemedText>
              </TouchableOpacity>
              
              <ThemedText style={styles.restartNote}>
                Thank you for investigating the murder of Ira Vale.
              </ThemedText>
            </View>
          )}
        </Animated.View>

        {/* Continue Button - ALWAYS VISIBLE AND CLICKABLE */}
        <View style={styles.continueContainer}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              // Slightly dimmed if on question step without selection, but still clickable
              currentStepData.type === 'question' && !selectedSuspect && styles.continueButtonDimmed
            ]}
            onPress={handleContinuePress}
            activeOpacity={0.7}
          >
            <ThemedText style={[
              styles.continueButtonText,
              currentStepData.type === 'question' && !selectedSuspect && styles.continueButtonTextDimmed
            ]}>
              {getContinueButtonText()}
            </ThemedText>
            <ThemedText style={[
              styles.continueButtonIcon,
              currentStepData.type === 'question' && !selectedSuspect && styles.continueButtonTextDimmed
            ]}>→</ThemedText>
          </TouchableOpacity>
          
          {/* Hint text for question step */}
          {currentStepData.type === 'question' && !selectedSuspect && (
            <ThemedText style={styles.continueHint}>
              Select a suspect first, then click Continue
            </ThemedText>
          )}
        </View>
      </View>

      {/* Back indicator */}
      <View style={styles.backIndicator}>
        <ThemedText style={styles.backIndicatorText}>Final Verdict</ThemedText>
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
    opacity: 0.03,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
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
    backgroundColor: '#888',
  },
  progressText: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    color: 'rgba(180, 180, 180, 0.7)',
    letterSpacing: 1,
  },
  stepContainer: {
    width: '100%',
    minHeight: screenHeight * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  typewriterContainer: {
    width: '100%',
    maxWidth: 600,
  },
  investigatorText: {
    fontSize: 32,
    fontFamily: Fonts.serif,
    color: '#C0C0C0',
    lineHeight: 42,
    letterSpacing: 0.5,
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(192, 192, 192, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  dividerContainer: {
    paddingVertical: 40,
  },
  dividerText: {
    fontSize: 28,
    color: '#777',
    opacity: 0.5,
  },
  questionContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  questionText: {
    fontSize: 32,
    fontFamily: Fonts.serif,
    color: '#C0C0C0',
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center',
    lineHeight: 40,
  },
  optionsContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 30,
  },
  suspectButton: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    paddingVertical: 22,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(120, 120, 120, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  suspectButtonSelected: {
    borderColor: 'rgba(100, 150, 100, 0.6)',
    backgroundColor: 'rgba(40, 60, 40, 0.8)',
  },
  suspectButtonWrong: {
    borderColor: 'rgba(150, 100, 100, 0.3)',
    backgroundColor: 'rgba(60, 40, 40, 0.6)',
    opacity: 0.6,
  },
  suspectText: {
    fontSize: 24,
    fontFamily: Fonts.serif,
    color: '#C0C0C0',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  suspectTextSelected: {
    color: '#A0D0A0',
  },
  suspectTextWrong: {
    color: 'rgba(200, 150, 150, 0.5)',
  },
  suspectSelectedIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  suspectCorrectIcon: {
    color: '#A0D0A0',
  },
  suspectWrongIcon: {
    color: '#D0A0A0',
  },
  selectionNote: {
    fontSize: 16,
    fontFamily: Fonts.sans,
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  correctNote: {
    color: 'rgba(160, 208, 160, 0.8)',
  },
  wrongNote: {
    color: 'rgba(208, 160, 160, 0.7)',
  },
  questionHint: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: 'rgba(150, 150, 150, 0.6)',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
  restartContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  restartTitle: {
    fontSize: 36,
    fontFamily: Fonts.serif,
    color: '#C0C0C0',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  restartDescription: {
    fontSize: 20,
    fontFamily: Fonts.sans,
    color: '#999',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  restartButton: {
    backgroundColor: 'rgba(60, 60, 80, 0.9)',
    paddingVertical: 18,
    paddingHorizontal: 45,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(100, 100, 140, 0.6)',
    marginBottom: 30,
  },
  restartButtonText: {
    fontSize: 20,
    fontFamily: Fonts.serif,
    color: '#B0B0E0',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  restartNote: {
    fontSize: 14,
    fontFamily: Fonts.sans,
    color: 'rgba(150, 150, 150, 0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
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
  continueButtonDimmed: {
    backgroundColor: 'rgba(50, 50, 60, 0.7)',
    borderColor: 'rgba(80, 80, 100, 0.4)',
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: Fonts.serif,
    color: '#B0B0E0',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 10,
  },
  continueButtonTextDimmed: {
    color: 'rgba(150, 150, 180, 0.6)',
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
    color: 'rgba(120, 120, 120, 0.5)',
    letterSpacing: 2,
  },
});