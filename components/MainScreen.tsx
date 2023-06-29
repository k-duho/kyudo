import React, { useState, useEffect } from 'react';
import { View, Button, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, addDays, subDays } from 'date-fns';
import Icon from 'react-native-vector-icons/FontAwesome';
import Round from './Round';
import AddIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface RoundData {
  id: string;
  initialValues: Record<string, boolean>;
}

const MainScreen: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<Record<string, any>>({});
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const storageData = await AsyncStorage.getItem(format(date, 'yyyy/MM/dd'));
      if (storageData) {
        const parsedData = JSON.parse(storageData);
        setData(parsedData);
        const roundIds = Object.keys(parsedData);
        setRounds(
          roundIds.map((id) => ({
            id,
            initialValues: parsedData[id],
          }))
        );
      } else {
        setData({});
        setRounds([]);
      }
      setIsLoading(false);
    };
    setIsLoading(true);
    loadData();
  }, [date]);

  const handleDateChange = (change: number) => {
    setDate(addDays(date, change));
  };

  const addRound = async () => {
    const newId = 'round' + (rounds.length + 1);
    const newRound = { id: newId, initialValues: { shot1: false, shot2: false, shot3: false, shot4: false } };
    setRounds([...rounds, newRound]);
    setData({ ...data, [newId]: newRound.initialValues });
    await AsyncStorage.setItem(format(date, 'yyyy/MM/dd'), JSON.stringify({ ...data, [newId]: newRound.initialValues }));
  };

  const deleteRound = async (id: string) => {
    Alert.alert(
      '削除の確認', // title
      '本当に削除しますか？', // message
      [
        {
          text: 'キャンセル',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: '削除', 
          onPress: async () => {
            setRounds(rounds.filter((round) => round.id !== id));
            const updatedData = {...data};
            delete updatedData[id];
            setData(updatedData);
            await AsyncStorage.setItem(format(date, 'yyyy/MM/dd'), JSON.stringify(updatedData));
          },
          style: 'destructive'
        }
      ],
      { cancelable: false },
    );
  };

  const handleRoundValueChange = async (id: string, values: Record<string, boolean>) => {
    setData({
      ...data,
      [id]: values,
    });
    await AsyncStorage.setItem(format(date, 'yyyy/MM/dd'), JSON.stringify({ ...data, [id]: values }));
  };

  const renderItem = ({ item, index }: { item: RoundData, index: number }) => (
    <Round
      initialValues={item.initialValues}
      onDelete={() => deleteRound(item.id)}
      onValueChange={(values) => handleRoundValueChange(item.id, values)}
      roundNumber={index + 1}  // roundNumber is now the index + 1
      date={date}
    />
  );

  if (isLoading) {
    return null; 
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.dateContainer}>
            <TouchableOpacity onPress={() => handleDateChange(-1)}>
              <Icon name="arrow-left" size={30} style={styles.arrow} />
            </TouchableOpacity>
            <Text style={styles.date}>{format(date, 'yyyy/MM/dd')}</Text>
            <TouchableOpacity onPress={() => handleDateChange(1)}>
              <Icon name="arrow-right" size={30} style={styles.arrow} />
            </TouchableOpacity>
          </View>
          <FlatList data={rounds} renderItem={renderItem} keyExtractor={(item, index) => index.toString()}  />
          
          <TouchableOpacity onPress={addRound}>
            <AddIcon name="bow-arrow" size={50} style={styles.addButton}></AddIcon>
            
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    backgroundColor: '#999999',  // Use subtheme color 2 for the main background
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 0,   // add margin at the top to move it down from status bar
    padding: 10,     // add some padding for better visuals
    backgroundColor: '#666666', // Use subtheme color 1 for date container background
  },
  date: {
    fontSize: 25,
    color: '#FFFFFF', // Use white for date text
    fontWeight: 'bold',
  },
  addButton: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF', // Use white for button text
    backgroundColor: '#333333', // Use main theme color for button background
    textAlign: 'center',
    paddingVertical: 10,
  },
  arrow: {
    color: '#FFFFFF', // Use white for date text
  }
});

export default MainScreen;
