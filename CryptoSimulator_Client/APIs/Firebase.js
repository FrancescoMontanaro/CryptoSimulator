import * as firebase from 'firebase'
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/storage";


export async function registration(email, password, lastName, firstName) {
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
    const currentUser = firebase.auth().currentUser;

    const db = firebase.firestore();
    db.collection("users")
      .doc(currentUser.uid)
      .set({
        email: currentUser.email,
        lastName: lastName,
        firstName: firstName,
      });
  } catch (err) {
    Alert.alert("There is something wrong!!!!", err.message);
  }
}

export async function signIn(email, password) {
  try {
   await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
  } catch (err) {
    Alert.alert("There is something wrong!", err.message);
  }
}

export async function loggingOut() {
  try {
    await firebase.auth().signOut();
  } catch (err) {
    Alert.alert('There is something wrong!', err.message);
  }
}

export async function getCryptoList(){
  return new Promise((resolve, reject) => {
      var getCryptoList = firebase.functions.httpsCallable('getCryptoList');
      getCryptoList().then(response =>{
          resolve(response);
      }).catch(error =>{
          reject(error);
      })
  })
}