import React, {useState, useEffect} from 'react';
import {Button, StyleSheet, View, Text} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import unmock from 'unmock-browser';
import {u, UnmockPackage} from 'unmock';
import axios from 'axios';

const useUnmock = process.env.NODE_ENV === 'development';

export const CAT_FACT_API_URL = 'https://cat-fact.herokuapp.com';
export const CAT_FACT_PATH = '/facts/random?animal_type=cat&amount=1';

export const mockCatFactAPI = (unmock: UnmockPackage) => {
  unmock.on();

  unmock
    .nock(CAT_FACT_API_URL, 'catFactApi')
    .get(CAT_FACT_PATH)
    .reply(200, {text: u.string('lorem.sentence')});
};

if (useUnmock) {
  mockCatFactAPI(unmock);
}

const fetchFact = async () => {
  const CAT_FACT_URL = `${CAT_FACT_API_URL}${CAT_FACT_PATH}`;
  const fetchResult = await axios(CAT_FACT_URL);
  if (fetchResult.status != 200) {
    throw Error(`Failed fetching cat fact with code: ${fetchResult.status}`);
  }
  const fact = fetchResult.data.text;
  console.log(`Got a new fact: ${fact}`);
  return fact;
};

const App = () => {
  const [shownFact, setFact] = useState('');
  const [err, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const refreshFact = async () => {
    try {
      setLoading(true);
      const fact = await fetchFact();
      setFact(fact);
      setError(null);
      console.log(`Set fact: ${fact}`);
    } catch (err) {
      console.log(`Failed fetching fact: ${err.message}`);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFact();
  }, []);

  return (
    <>
      <View style={styles.body}>
        <View style={styles.container}>
          <Text style={styles.title}>Your daily cat fact</Text>
          {loading ? (
            <Text style={styles.loading} testID="loading">
              Loading...
            </Text>
          ) : err ? (
            <Text style={{...styles.fact, ...styles.error}} testID="error">
              Something went horribly wrong, please try again!
            </Text>
          ) : (
            <Text style={styles.fact} testID="fact">
              {shownFact}
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <Button
              disabled={loading}
              title={'Get me a new one'}
              onPress={refreshFact}
              color="blue"
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.lighter,
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  fact: {
    padding: 20,
    width: '100%',
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
    textAlign: 'center',
  },
  loading: {
    color: 'gray',
  },
  error: {
    backgroundColor: 'red',
  },
  buttonContainer: {
    margin: 20,
  },
});

export default App;
