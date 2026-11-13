import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

// 1. The AbleWork Logo
// Uses accessibilityRole="image" to tell TalkBack it's a graphic.
export const AbleworkLogo = ({ source, style }) => (
  <Image
    source={source}
    accessible={true}
    accessibilityRole="image"
    accessibilityLabel="Able Work logo"
    style={style}
  />
);

// 2. TalkBack-Optimized Button
// Reads the label first, pauses, then reads the hint.
export const AccessibleButton = ({ onPress, label, hint, children, style }) => (
  <TouchableOpacity
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityHint={hint}
    onPress={onPress}
    style={style}
  >
    {children}
  </TouchableOpacity>
);

// 3. Pop-ups, Sweet Alerts, and Errors
// accessibilityLiveRegion="assertive" forces TalkBack to interrupt whatever it is currently saying to read this error immediately.
export const AccessibleAlert = ({ message, isVisible, isError = false }) => {
  if (!isVisible) return null;
  
  return (
    <View
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={{ padding: 10, backgroundColor: isError ? '#ffe6e6' : '#e6ffe6', borderRadius: 8 }}
    >
      <Text style={{ color: isError ? 'red' : 'green', fontWeight: 'bold' }}>
        {message}
      </Text>
    </View>
  );
};

// 4. Standard Text & Headers
export const AccessibleText = ({ text, isHeader = false, style }) => (
  <Text
    accessible={true}
    accessibilityRole={isHeader ? "header" : "text"}
    style={style}
  >
    {text}
  </Text>
);