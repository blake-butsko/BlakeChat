import React from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore'; //hooks to make it easier to work with fire base in react

firebase.initializeApp({
  apiKey: "AIzaSyAG6yKIr_kM3Zh6tPk1J8xVGXmBHTu5V28",
  authDomain: "blake-chat-9e092.firebaseapp.com",
  projectId: "blake-chat-9e092",
  storageBucket: "blake-chat-9e092.appspot.com",
  messagingSenderId: "584733650137",
  appId: "1:584733650137:web:0e093c129e8b81fdd962c8",
  measurementId: "G-BDNHT99B54"
})

// references to auth and firestore sdks as global variables
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  // hook to check if user is signed in
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn(){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider(); //google sign in 
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <div>
        <h1>Blake's Chat</h1>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      </div>
    </>
  )
}

function SignOut(){
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const bottom = React.useRef();  //reference to the bottom of the chat)

  //references messages collection in firestore
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25); //query to get the last 25 messages

  const [messages] = useCollectionData(query, {idField: 'id'});

  const [formValue, setFormValue] = React.useState(''); //stateful variable to check if text box is filled

  const sendMessage = async(e) => {

    e.preventDefault(); //prevents page from refreshing bc firebase is realtime

    const { uid, photoURL } = auth.currentUser;

    // makes firebase document
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(), //timestamp of when message was sent
      uid,
      photoURL
    })

    setFormValue('');
    bottom.current.scrollIntoView({ behavior: 'smooth' }); //scrolls to the bottom of the chat
  }

  return (
    <>
      <main>
        <div>
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        </div>
        <div ref={bottom}></div>
      </main>
      {/* How to send a message */}
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit" disabled={!formValue}>Send⬆️</button>
      </form>

    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'; // checks if the message was sent by the user or not (to style differently)

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="profile pic"/>
        <p>{text}</p> 
      </div>
    </>
  )
}

export default App;
