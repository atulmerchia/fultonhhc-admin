const Client = require('firebase');

if(!Client.apps[0]) Client.initializeApp(process.env.FIREBASE_CONFIG);

module.exports = {
  isLoggedIn: _ => !!Client.auth().currentUser,
  registerApp: ref => Client.auth().onAuthStateChanged(user => ref.forceUpdate()),
  signIn: ({ email, password }) => {
    try { return Client.auth().signInWithEmailAndPassword(email, password); }
    catch (e) { return Promise.reject(e); }
  },
  signOut: _ => Client.auth().signOut(),
  token: async _ => {
    const user = Client.auth().currentUser;
    return user ? await Client.auth().currentUser.getIdToken().catch(x => null) : null;
  }
}
