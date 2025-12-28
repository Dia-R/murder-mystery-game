import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { Audio, Video } from 'expo-av';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { width, height } = useWindowDimensions();
  const videoRef = useRef<Video>(null);
  const [showInvestigateButton, setShowInvestigateButton] = useState(false);
  const musicRef = useRef<Audio.Sound | null>(null);
  const [isMusicLoaded, setIsMusicLoaded] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  const startGame = async () => {
    console.log('Starting game... Navigating to explore screen');
    
    // Optionally pause music before navigation
    if (musicRef.current && isMusicLoaded && isMusicPlaying) {
      await musicRef.current.pauseAsync();
    }
    
    // Navigate to explore screen
    router.push('/cook');
  };
  // Load and play music
  const loadMusic = async () => {
    try {
      // First, unload any existing sound
      if (musicRef.current) {
        await musicRef.current.unloadAsync();
      }

      // Load the music file
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/black_swan_orchestra_reversed.mp3'),
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.3, // Adjust volume (0.0 to 1.0)
          isMuted: false,
        }
      );
 
      musicRef.current = sound;
      setIsMusicLoaded(true);
      setIsMusicPlaying(true);
      
      // Optional: Adjust playback rate for different moods
      await sound.setRateAsync(0.55, false);
    } catch (error) {
      console.error('Error loading music:', error);
    }
  };

  const toggleMusic = async () => {
    if (!musicRef.current || !isMusicLoaded) return;

    try {
      if (isMusicPlaying) {
        await musicRef.current.pauseAsync();
      } else {
        await musicRef.current.playAsync();
      }
      setIsMusicPlaying(!isMusicPlaying);
    } catch (error) {
      console.error('Error toggling music:', error);
    }
  };

  const setMusicVolume = async (volume: number) => {
    if (!musicRef.current || !isMusicLoaded) return;
    
    try {
      await musicRef.current.setVolumeAsync(volume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  // Calculate parallax effects
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, height * 0.5],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, height * 0.3, height * 0.5],
    outputRange: [1, 0.7, 0.3],
    extrapolate: 'clamp',
  });

  const suspectsTranslateY = scrollY.interpolate({
    inputRange: [0, height * 0.5],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const suspectsOpacity = scrollY.interpolate({
    inputRange: [0, height * 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const videoOpacity = scrollY.interpolate({
    inputRange: [0, height * 0.3],
    outputRange: [0.15, 0.4],
    extrapolate: 'clamp',
  });

  const investigateButtonOpacity = scrollY.interpolate({
    inputRange: [height * 0.8, height * 1.2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const investigateButtonScale = scrollY.interpolate({
    inputRange: [height * 0.8, height * 1.2],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });

   useEffect(() => {
    // Load and play music
    loadMusic();

    // Play video
    if (videoRef.current) {
      videoRef.current.playAsync();
    }

    // Cleanup function
    return () => {
      if (musicRef.current) {
        musicRef.current.unloadAsync();
      }
    };
  }, []);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const scrollPosition = event.nativeEvent.contentOffset.y;
        const contentHeight = height * 2; // Approximate total content height
        const scrollThreshold = contentHeight * 0.85; // 85% scrolled
        
        if (scrollPosition >= scrollThreshold && !showInvestigateButton) {
          setTimeout(() => {
            setShowInvestigateButton(true);
          }, 5000);
        } else if (scrollPosition < scrollThreshold && showInvestigateButton) {
          setShowInvestigateButton(false);
        }
      }
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Video with Parallax */}
      <Animated.View style={[styles.videoContainer, { opacity: videoOpacity }]}>
        <Video
          ref={videoRef}
          source={require('@/assets/videos/Background.mp4')}
          style={styles.backgroundVideo}
          isLooping={true} // Fixed: Added ={true}
          isMuted={true}
          shouldPlay={true}
        />
        <View style={styles.videoOverlay} />
      </Animated.View>
      
      {/* Main Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section with Parallax */}
        <Animated.View 
          style={[
            styles.titleContainer,
            { 
              transform: [{ translateY: titleTranslateY }],
              opacity: titleOpacity 
            }
          ]}
        >
          <ThemedText style={styles.mysteryText}>A MURDER</ThemedText>
          <ThemedText style={styles.mysteryText}>IN THE DARK</ThemedText>
          <View style={styles.titleDivider} />
        </Animated.View>
        <Animated.View 
          style={[
            styles.titleContainer,
            { 
              transform: [{ translateY: titleTranslateY }],
              opacity: titleOpacity 
            }
          ]}
        >
          <ThemedText style={styles.questionTitle}>WHO KILLED</ThemedText>
          <ThemedText style={styles.victimName}>IRA VALE?</ThemedText>
          <ThemedText style={styles.subtitle}>A Dark Academia Murder Mystery</ThemedText>
        </Animated.View>

        {/* Punchy Taglines that appear as you scroll */}
        <Animated.View style={[styles.taglineContainer, { opacity: scrollY.interpolate({
          inputRange: [height * 0.2, height * 0.35],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        }) }]}>
          <ThemedText style={styles.tagline}>THREE SUSPECTS</ThemedText>
          <ThemedText style={styles.taglineSmall}>ONE LIE</ThemedText>
          <ThemedText style={styles.tagline}>THREE ALIBIS</ThemedText>
          <ThemedText style={styles.taglineSmall}>ONE TRUTH</ThemedText>
        </Animated.View>
        
     

        {/* Suspects Section - Fades in */}
        <Animated.View 
          style={[
            styles.suspectsContainer,
            { 
              opacity: suspectsOpacity,
              transform: [{ translateY: suspectsTranslateY }]
            }
          ]}
        >
          <ThemedText style={styles.suspectsTitle}>THE SUSPECTS</ThemedText>
          <View style={styles.suspectsGrid}>
            <View style={styles.suspectCard}>
              <View style={[styles.suspectIcon, { backgroundColor: '#8b7355' }]} />
              <ThemedText style={styles.suspectName}>Mrs. Agatha Finch</ThemedText>
              <ThemedText style={styles.suspectRole}>The Cook</ThemedText>
              <ThemedText style={styles.suspectMotive}>"Too much noise..."</ThemedText>
            </View>
            <View style={styles.suspectCard}>
              <View style={[styles.suspectIcon, { backgroundColor: '#4a4a6a' }]} />
              <ThemedText style={styles.suspectName}>Julian Thorne</ThemedText>
              <ThemedText style={styles.suspectRole}>The Jealous Ex</ThemedText>
              <ThemedText style={styles.suspectMotive}>"She betrayed us..."</ThemedText>
            </View>
            <View style={styles.suspectCard}>
              <View style={[styles.suspectIcon, { backgroundColor: '#2a4a4a' }]} />
              <ThemedText style={styles.suspectName}>Professor Gray</ThemedText>
              <ThemedText style={styles.suspectRole}>The Voice Coach</ThemedText>
              <ThemedText style={styles.suspectMotive}>"My legacy..."</ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Ominous Final Call to Action */}
        <Animated.View 
          style={[
            styles.callToActionContainer,
            { 
              opacity: scrollY.interpolate({
                inputRange: [height * 0.7, height * 0.9],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
              transform: [{
                translateY: scrollY.interpolate({
                  inputRange: [height * 0.7, height * 1],
                  outputRange: [100, 0],
                  extrapolate: 'clamp',
                })
              }]
            }
          ]}
        >
          <ThemedText style={styles.finalTagline}> No matter how beloved,</ThemedText>
          <ThemedText style={styles.finalTagline}>you are a murderer.</ThemedText>
          

     
        </Animated.View>

        {/* Space at bottom for the button to appear */}
        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      {/* Full Screen Ominous Investigate Button - Appears only after scrolling */}
      {showInvestigateButton && (
        <Animated.View 
          style={[
            styles.fullScreenButtonContainer,
            { 
              opacity: investigateButtonOpacity,
            }
          ]}
        >
          {/* Dark overlay covering entire screen */}
          <View style={styles.fullScreenOverlay} />
          

        
          
          {/* Main button content */}
          <View style={styles.fullScreenButtonContent}>
        
            
            <TouchableOpacity 

              onPress={startGame}
              
              activeOpacity={0.9}
            >
       
              <ThemedText style={styles.fullScreenButtonText}>
                BEGIN INVESTIGATION
              </ThemedText>
            </TouchableOpacity>
            
          </View>
        </Animated.View>
      )}

      {/* Fixed Footer - Hidden when button is shown */}
      {!showInvestigateButton && (
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>Aethelred Conservatory Case File</ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  videoContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backgroundVideo: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 10, 8, 0.7)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200, // Extra space for button to appear
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 100,
    paddingHorizontal: 20,
  },
  mysteryText: {
    fontSize: 100,
    fontFamily: Fonts.serif,
    color: Colors.dark.text,
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(201, 166, 107, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    fontWeight: '900',
    opacity: 0.9,
    padding:120,
  },
  questionTitle: {
    fontSize: 60,
    fontFamily: Fonts.serif,
    color: Colors.dark.tint,
    textAlign: 'center',
    letterSpacing: 4,
    marginTop: 40,
    textTransform: 'uppercase',
    fontWeight: '700',
    padding:70,
  },
  victimName: {
    fontSize: 120,
    fontFamily: Fonts.serif,
    color: "#FF0000",
    textAlign: 'center',
    letterSpacing: 4,
    textShadowColor: 'rgba(201, 166, 107, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    fontWeight: '900',
    marginBottom: 80,
  },
  titleDivider: {
    width: 250,
    height: 1,
    backgroundColor: Colors.dark.tint,
    marginVertical: 20,
    opacity: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.icon,
    fontStyle: 'italic',
    letterSpacing: 2,
    fontFamily: Fonts.sans,
    textAlign: 'center',
    marginTop: 10,
  },
  taglineContainer: {
    alignItems: 'center',
    marginVertical: 60,
    paddingHorizontal: 20,
  },
  tagline: {
    fontSize: 36,
    fontFamily: Fonts.serif,
    color: Colors.dark.text,
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '700',
    opacity: 0.8,
    marginVertical: 5,
  },
  taglineSmall: {
    fontSize: 24,
    fontFamily: Fonts.sans,
    color: Colors.dark.tint,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 1,
    marginVertical: 5,
  },
  descriptionContainer: {
    marginVertical: 40,
    padding: 30,
    backgroundColor: 'rgba(58, 44, 31, 0.6)',
    borderRadius: 0,
    borderLeftWidth: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.dark.tint,
    marginHorizontal: 20,
  },
  description: {
    fontSize: 20,
    lineHeight: 32,
    color: Colors.dark.text,
    textAlign: 'center',
    fontFamily: Fonts.sans,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  suspectsContainer: {
    marginVertical: 60,
    paddingHorizontal: 20,
  },
  suspectsTitle: {
    fontSize: 28,
    fontFamily: Fonts.serif,
    color: Colors.dark.tint,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 30,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  suspectsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  suspectCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(58, 44, 31, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201, 166, 107, 0.2)',
  },
  suspectIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
    backgroundColor: Colors.dark.border,
    borderWidth: 2,
    borderColor: Colors.dark.tint,
  },
  suspectName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
    fontFamily: Fonts.sans,
    letterSpacing: 0.5,
  },
  suspectRole: {
    fontSize: 11,
    color: Colors.dark.tint,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: Fonts.sans,
    marginTop: 4,
  },
  suspectMotive: {
    fontSize: 10,
    color: Colors.dark.icon,
    textAlign: 'center',
    fontFamily: Fonts.mono,
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  callToActionContainer: {
    alignItems: 'center',
    marginVertical: 80,
    paddingHorizontal: 20,
  },
  finalTagline: {
    fontSize: 42,
    fontFamily: Fonts.serif,
    color: Colors.dark.tint,
    textAlign: 'center',
    letterSpacing: 3,
    fontWeight: '900',
    textShadowColor: 'rgba(201, 166, 107, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginVertical: 5,
  },
  warningContainer: {
    marginTop: 50,
    padding: 25,
    backgroundColor: 'rgba(139, 0, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 0, 0, 0.3)',
    borderRadius: 8,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 28,
    fontFamily: Fonts.serif,
    color: '#ff4444',
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 15,
  },
  warningSubtext: {
    fontSize: 14,
    color: Colors.dark.text,
    textAlign: 'center',
    fontFamily: Fonts.sans,
    fontStyle: 'italic',
    marginVertical: 3,
    opacity: 0.9,
  },
  bottomSpacer: {
    height: 150,
  },
  
  // Full Screen Button Styles
  fullScreenButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  pulsingBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fullScreenButtonContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
    zIndex: 1001,
  },
  fullScreenTitle: {
    fontSize: 32,
    fontFamily: Fonts.serif,
    color: '#ff4444',
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '900',
    textShadowColor: 'rgba(82, 32, 32, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 60,
    textTransform: 'uppercase',
  },
 

  fullScreenButtonText: {
    fontSize: 36,
    fontFamily: Fonts.serif,
    color: 'rgba(82, 32, 32, 0.8)',
    letterSpacing: 4,
    fontWeight: '900',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(82, 21, 21, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
  },

  fullScreenWarning: {
    fontSize: 16,
    color: 'rgba(255, 68, 68, 0.7)',
    fontFamily: Fonts.sans,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 1,
    marginTop: 20,
    textShadowColor: 'rgba(255, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  footerText: {
    fontSize: 12,
    color: Colors.dark.icon,
    fontStyle: 'italic',
    fontFamily: Fonts.sans,
    opacity: 0.7,
  },
  footerSubtext: {
    fontSize: 10,
    color: Colors.dark.border,
    fontFamily: Fonts.mono,
    marginTop: 2,
    opacity: 0.5,
  },
});