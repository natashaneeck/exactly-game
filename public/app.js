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