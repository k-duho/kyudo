import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface ArrowProps {
  onValueChange: (value: boolean) => void;
  initialValue: boolean;
}

const Arrow: React.FC<ArrowProps> = ({ onValueChange, initialValue }) => {
  const [hit, setHit] = useState(initialValue);

  useEffect(() => {
    onValueChange(hit);
  }, [hit]);

  return (
    <TouchableOpacity onPress={() => setHit(!hit)} style={styles.container}>
      <Icon name={hit ? 'circle-o' : 'times'} size={35} color={hit ? 'blue' : 'red'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
});

export default Arrow;
