import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { format, addDays, subDays } from 'date-fns';
import TargetIcon from 'react-native-vector-icons/Foundation'; 
import Modal from 'react-native-modal';
import Arrow from './Arrow'; 

import AsyncStorage from '@react-native-async-storage/async-storage';



const windowWidth = Dimensions.get('window').width;

interface RoundProps {
  initialValues: Record<string, boolean>;
  onDelete: () => void;
  onValueChange: (values: Record<string, boolean>) => void;
  roundNumber: number;
  date: Date;
}

interface HolePosition {
  x: number;
  y: number;
}

const SHOT_KEYS = ["shot1", "shot2", "shot3", "shot4"];


const Round: React.FC<RoundProps> = ({ initialValues, onDelete, onValueChange, roundNumber, date }) => {
  const [values, setValues] = useState<Record<string, boolean>>(initialValues);
  const [isModalVisible, setModalVisible] = useState(false);
  const [holes, setHoles] = useState<HolePosition[]>([]);

  useEffect(() => {
    onValueChange(values);
  }, [values]);

  useEffect(() => {
    loadHolesFromStorage();
  }, []);

  const handleValueChange = (key: string, newValue: boolean) => {
    setValues((prevValues) => ({
      ...prevValues,
      [key]: newValue,
    }));
  };

  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const handlePress = async (locationX: number, locationY: number) => {
    console.log('locationX:', locationX);
    console.log('locationY:', locationY);
  
    if (locationY >= 30 && locationY <= 270) {
      const holePosition = { x: locationX, y: locationY };
  
      let updatedHoles;
      if (holes.length < 4) {
        updatedHoles = [...holes, holePosition];
      } else {
        updatedHoles = [...holes];
        updatedHoles[3] = holePosition;
      }
  
      console.log('updatedHoles', updatedHoles);
      await setHoles(updatedHoles);
      await saveHolesToStorage();
    }
  };

  // const handlePress = (locationX: number, locationY: number) => {
  //   if (locationY >= 30 && locationY <= 270) {
  //     const holePosition = { x: locationX, y: locationY };
  //     setHoles((prevHoles) => {
  //       if (prevHoles.length < 3) {
  //         return [...prevHoles, holePosition];
  //       } else {
  //         const updatedHoles = [...prevHoles];
  //         updatedHoles[3] = holePosition; // 4번째 홀 위치로 업데이트
  //         return updatedHoles;
  //       }
  //     });
  //     saveHolesToStorage();
  //   }
  // };
  

  // 저장
  const saveHolesToStorage = async () => {
    const currentDate = format(date, 'yyyy/MM/dd');
    const roundKey = `round${roundNumber}`;
    const holeData = {
      hit_position: holes.reduce((acc, hole, index) => {
        acc[index + 1] = hole;
        return acc;
      }, {} as Record<string, HolePosition>),
    };
  
    try {
      const storedData = await AsyncStorage.getItem(currentDate);
      const data = storedData ? JSON.parse(storedData) : {};
      const joinedData = {
        [roundKey]: {
          ...data[roundKey],
          ...holeData,
        },
      };
  
      await AsyncStorage.setItem(currentDate, JSON.stringify(joinedData));
      const storageData = await AsyncStorage.getItem(format(date, 'yyyy/MM/dd'));
      console.log('storageData after hole', storageData);
    } catch (error) {
      console.log('Error saving hole positions:', error);
    }
  };

  // 불러오기
  const loadHolesFromStorage = async () => {
    try {
      const currentDate = format(date, 'yyyy/MM/dd')
      const roundKey = `round${roundNumber}`;
      const storedData = await AsyncStorage.getItem(currentDate);

      if (storedData) {
        const data = JSON.parse(storedData);
        if (data[roundKey] && data[roundKey].hit_position) {
          const holeData = data[roundKey].hit_position;
          const loadedHoles = Object.values(holeData) as HolePosition[];
          setHoles(loadedHoles);
        }
      }
    } catch (error) {
      console.log('Error loading hole positions:', error);
    }
  };

  const resetHoles = async () => {
    setHoles([]);
    const currentDate = format(date, 'yyyy/MM/dd');
    const roundKey = `round${roundNumber}`;
    const storedData = await AsyncStorage.getItem(currentDate);
    const data = storedData ? JSON.parse(storedData) : {};
    const roundData = data[roundKey] ? data[roundKey] : {};
    delete roundData.hit_position;
    const updatedData = {
      ...data,
      [roundKey]: roundData,
    };
    await AsyncStorage.setItem(currentDate, JSON.stringify(updatedData));
  };

  return (
    <View style={styles.container}>
      <View style={styles.hitIconContainer}>
        <Text style={styles.roundNumber}>{roundNumber}</Text>
        {SHOT_KEYS.map((key) => (
          <Arrow
            key={key}
            initialValue={values[key]}
            onValueChange={(newValue) => handleValueChange(key, newValue)}
          />
        ))}
      </View>
      <View style={styles.actionButtonContainer}>
        <TouchableOpacity onPress={showModal} style={styles.iconButton}>
          <TargetIcon name="target" size={30} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
          <Icon name="trash" size={25} />
        </TouchableOpacity>
      </View>
      <Modal isVisible={isModalVisible} style={styles.modal} backdropOpacity={0.8}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalText}>矢所</Text>
            <TouchableOpacity onPress={resetHoles} style={styles.resetIcon}>
              <Icon name="refresh" size={30} color="white" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={hideModal} style={styles.closeIcon}>
            <Icon name="times" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageWrapper}
            onPressIn={(e) => handlePress(e.nativeEvent.locationX, e.nativeEvent.locationY)}
          >
            <Image style={styles.mato} source={require('../assets/images/mato.png')} />
            {holes.map((hole, index) => (
              <View key={index} style={[styles.hole, { top: hole.y, left: hole.x }]}>
                <Text style={styles.holeText}>{index + 1}</Text>
              </View>
            ))}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    marginBottom: 8,
    backgroundColor: '#FFFFFF', // Use subtheme color 2 for background
    padding: 19,
    borderRadius: 20,
    width: windowWidth - 20,
    marginHorizontal: 10,
  },

  
  hitIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 7,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 3,
  },
  iconButton: {
    marginLeft: 10,
  },
  roundNumber: {
    fontSize: 30,
    marginRight: 10,
  },
  modal: {
    flex: 1,
    backgroundColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resetIcon: {
    marginLeft: 20,
  },
  modalText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
  },
  closeIcon: {
    position: 'absolute',
    top: 30,
    right: -30,
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mato: {
    width: 300,
    height: 300,
  },
  hole: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  holeText: {
    color: 'white',
    fontSize: 20,
  },
});
export default Round;
