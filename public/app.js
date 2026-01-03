//I should probably have some documentation huh
// fix single letter variable names

function randomizeArray(arr) {
    let shuffled = [...arr];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; 
    }
    
    return shuffled;
}

function assignPairs(arr) {
    let shuffled = randomizeArray(arr);
    let map = new Map(); 
    
    for (let i = 0; i < arr.length; i++) {
        map.set(arr[i], shuffled[(i + 1) % arr.length]);
    }
    
    return map;
}

class Conversation {
    #chat;
    #ended;
    #chatters;

    constructor(chatOwner, chatParticipant) {
        this.#chat = new Array();
        this.#ended = false;
        this.#chatters = [chatOwner, chatParticipant];
    }

    addLine(line) {
        if (!this.#ended) {
            this.#chat.push(line);
        } 
    }

    addExactly() {
        this.addLine("Exactly!");
        this.addLine("Exactly!");
        this.#ended = true;
    }

    removeExactly() {
        if (this.#chat[this.#chat.length] == "Exactly!" 
            && this.#chat[this.#chat.length - 1] == "Exactly!") {
                this.#chat.pop();
                this.#chat.pop();
                this.#ended = false;
            }
    }

    viewChat() {
        return [...this.#chat];
    }

    isEnded() {
        return this.#ended;
    }

    getSpeaker(msgIdx) {
        return this.#chatters[msgIdx % 2]; //Assumes chat owner starts conversation
    }
}


(function () {
    let playerId;
    let playerRef; // Corresponding firebase node to this user so we can update it
    
    
    firebase.auth.onAuthStateChanged((user) => {
        console.log(user);
        if (user) {
            //Signed in, set up and start game
            playerId = user.uid;
            playerRef = firebase.database.ref(`players/${playerId}`);
            playerRef.set({
                id : playerId,
                name: "INSERT NAME",
                roomkey: "lobby",
                friend: "",
            });

            playerRef.onDisconnect().remove(); 
            // and auto-end convo this player was responsible for
        } else {
            //logged out, user = null
        }
    })
    
    //Sign in anonymously and show errors if they occur
    firebase.auth().signInAnonymously().catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode, errorMessage);
  });
})();