const startButton = document.getElementById('startBtn');
const stopButton = document.getElementById('stopBtn');
const localVideo = document.getElementById('localVideo');

let localStream;

startButton.addEventListener('click', async () => {
    try {
        // Zugriff auf die Webcam und das Mikrofon anfordern
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (err) {
        console.error('Fehler beim Zugriff auf Webcam und Mikrofon:', err);
    }
});

stopButton.addEventListener('click', () => {
    if (localStream) {
        // Stoppt alle Tracks der Webcam und des Mikrofons
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
    }
});

let peerConnection;
const signalingUrl = 'signaling.php';

// Startet die WebRTC Verbindung
async function startConnection() {
    peerConnection = new RTCPeerConnection();

    // Füge die lokalen Tracks hinzu (Audio und Video)
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // SDP Angebot erstellen
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Sende das Angebot an den Signalisierungsserver
    await sendToServer({ sdp: peerConnection.localDescription });
}

// Empfängt Daten vom Server (z.B. SDP Antwort)
async function getFromServer() {
    const response = await fetch(signalingUrl);
    const data = await response.json();

    if (data.sdp) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
    }
}

// Sende Daten an den PHP Signalisierungsserver
async function sendToServer(data) {
    await fetch(signalingUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}

startButton.addEventListener('click', startConnection);
stopButton.addEventListener('click', () => peerConnection.close());
