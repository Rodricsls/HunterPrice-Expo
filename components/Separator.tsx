import React from "react";
import { View, StyleSheet } from "react-native";

const HorizontalSeparator = () => {
  return <View style={styles.separator} />;
};

const styles = StyleSheet.create({
  separator: {
    height: 1, // Thickness of the line
    backgroundColor: "#E0E0E0", // Line color
    marginVertical: 10, // Spacing above and below the line
    marginHorizontal:20
  },
});

export default HorizontalSeparator;
