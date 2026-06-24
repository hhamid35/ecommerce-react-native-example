import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { colors } from "../../constants";

const { width } = Dimensions.get("window");

const PromotionSlider = ({ slides }) => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % slides.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <View style={styles.promotiomSliderContainer} testID="promotion-slider">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        testID="promotion-slider-scroll"
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      >
        {slides.map((image, index) => (
          <Image
            key={index}
            source={image}
            style={styles.image}
            resizeMode="cover"
            testID={`promotion-slider-image-${index}`}
          />
        ))}
      </ScrollView>
      <View style={styles.dotContainer} testID="promotion-slider-dots">
        {slides.map((_, index) => (
          <View
            key={index}
            testID={`promotion-slider-dot-${index}`}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === currentIndex ? colors.primary : colors.muted,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  promotiomSliderContainer: {
    margin: 5,
    height: 140,
    backgroundColor: colors.light,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: width - 10,
    height: 140,
  },
  dotContainer: {
    position: "absolute",
    bottom: 8,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});

export default PromotionSlider;

// Made with Bob
