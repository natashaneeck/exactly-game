//I should probably have some more documentation huh


// Helpers

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

    get chat() {
        return [...this.#chat];
    }

    get ended() {
        return this.#ended;
    }

    getSpeaker(msgIdx) {
        return this.#chatters[msgIdx % 2]; //Assumes chat owner starts conversation
    }
}


//Firebase ref global variables
let playerId;
let playerRef;
let chatRef;

//Top-level components

function Customizer({ playerName, setPlayerName, roomKey, setRoomKey }) {
    function handleNameEnter(e) {
        if (e.key === 'Enter' && playerName.trim()) {
            console.log('Name entered:', value);
            playerRef.update({ name: playerName });
        }
    }

    function handleRoomKeyEnter(e) {
        if (e.key === 'Enter' && roomKey.trim()) {

            console.log('Room ID entered:', value);
            playerRef = firebase.database.ref(`rooms/${value}/players/${playerId}`);
            //..should probably only set up below thing after in not lobby anyways. lobby should not have chats
            chatRef = firebase.database.ref(`rooms/${roomKey}/chats/${playerId}`);
            //can't set chatRef until game started and pairs set up
        }
    }

    return (
        <div className="customizer">
            <div>
                <label htmlFor="player-name">Your Name</label>
                <input
                    id="player-name"
                    maxLength={10}
                    type="text"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value.toUpperCase())}
                    onKeyDown={handleNameEnter}
                />
            </div>
            <div>
                <label htmlFor="room-id">Room ID</label>
                <input
                    id="room-id"
                    maxLength={10}
                    type="text"
                    value={roomKey}
                    onChange={e => setRoomKey(e.target.value.toUpperCase())}
                    onKeyDown={handleRoomKeyEnter}
                />
            </div>
        </div>
    );
}

function PlayerList({ roomKey }) {
    const [players, setPlayers] = React.useState([]);

    React.useEffect(() => {
        if (!roomKey) return;
        const ref = firebase.database.ref(`rooms/${roomKey}/players`);
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            setPlayers(data ? Object.values(data) : []);
        });
        return () => ref.off();
    }, [roomKey]); // re-runs when roomKey changes

    return (
        <ul>
            {players.map(p => <li key={p.id}>{p.name}</li>)}
        </ul>
    );
}


function Game() {
    const [playerName, setPlayerName] = React.useState('INSERT NAME HERE');
    const [roomKey, setRoomKey] = React.useState('');

    React.useEffect(() => {
        firebase.auth().signInAnonymously().catch((error) => {
            console.log(error.code, error.message);
        });

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                playerId = user.uid;
                playerRef = firebase.database.ref(`rooms/lobby/players/${playerId}`);
                playerRef.set({
                    id: playerId,
                    name: playerName,
                    roomkey: roomKey
                });
                playerRef.onDisconnect().remove(); 
                // and auto-end convo this player was responsible for
//             //aka if !isEnded, do chat.addExactly? maybe do addLine first of "oops! player left early"
            }
        });
    }, []); // run once on load

    return (
        <div>
            <div className="game-container"></div>
            <Customizer
                playerName={playerName}
                setPlayerName={setPlayerName}
                roomKey={roomKey}
                setRoomKey={setRoomKey}
            />
            <PlayerList roomKey={roomKey} />
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Game />);