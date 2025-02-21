import React, { useEffect, useState } from 'react';
import SQLite from 'react-native-sqlite-storage';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Button,
  useColorScheme,
  View,
} from 'react-native';
import { Colors, Header } from 'react-native/Libraries/NewAppScreen';

SQLite.enablePromise(true);

function App(): React.JSX.Element {
  const [data, setData] = useState<{ id: number; name: string; age: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for input fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    const initDB = async () => {
      let db;
      try {
        db = await SQLite.openDatabase({ name: 'my.db', location: 'default' });

        // Create table if it doesn't exist
        await db.transaction(tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER);'
          );
        });

        // Query data
        const [results] = await db.executeSql('SELECT * FROM users');
        const users: { id: number; name: string; age: number }[] = [];
        for (let i = 0; i < results.rows.length; i++) {
          users.push(results.rows.item(i));
        }

        setData(users);
      } catch (err) {
        setError('An error occurred while accessing the database.');
        console.error(err);
      } finally {
        db?.close();
      }
    };

    initDB();
  }, []);

  // Function to add a new user
  const addUser = async () => {
    if (name && age) {
      let db;
      try {
        db = await SQLite.openDatabase({ name: 'my.db', location: 'default' });

        // Insert the new user
        await db.transaction(tx => {
          tx.executeSql('INSERT INTO users (name, age) VALUES (?, ?)', [name, parseInt(age)]);
        });

        // Reload the data
        const [results] = await db.executeSql('SELECT * FROM users');
        const users: { id: number; name: string; age: number }[] = [];
        for (let i = 0; i < results.rows.length; i++) {
          users.push(results.rows.item(i));
        }

        setData(users);
        setName('');  // Clear the input fields
        setAge('');
      } catch (err) {
        setError('Failed to add the user.');
        console.error(err);
      } finally {
        db?.close();
      }
    } else {
      setError('Please enter both name and age');
    }
  };

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <Header />
        <View style={styles.container}>
          <Text style={styles.headerText}>Add user</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter age"
            value={age}
            keyboardType="numeric"
            onChangeText={setAge}
          />
          <Button title="Add User" onPress={addUser} />

          <Text style={styles.subHeaderText}>Users List:</Text>
          <ScrollView
  contentInsetAdjustmentBehavior="automatic"
  style={[backgroundStyle, { height: 250 }]} // Set the height here
>
          {data.length > 0 ? (
            data.map(user => (
              <View key={user.id} style={styles.userContainer}>
                <Text style={styles.userText}>{`Name: ${user.name}`}</Text>
                <Text style={styles.userText}>{`Age: ${user.age}`}</Text>
              </View>
            ))

          ) : (
            <Text>No data found</Text>
          )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 24,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
  userContainer: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  userText: {
    fontSize: 16,
    fontWeight: '400',
  },
});

export default App;
