const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");
const call = document.getElementById("call");

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

const getCameras = async () => {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];

        cameras.forEach((camera) => {
            const option = document.createElement("option");

            option.value = camera.deviceId;
            option.innerText = camera.label;

            if (currentCamera.label === camera.label) {
                option.selected = true;
            }

            cameraSelect.appendChild(option);
        })
    } catch (e) {
        console.log(e);
    }
}

const getMedia = async (deviceId) => {
    const initialConstraints = {
        audio: true,
        video: { facingMode: "user" }
    };

    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } }
    };

    try {
        myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initialConstraints);

        myFace.srcObject = myStream;

        if(!deviceId) {
            await getCameras();
        }
    } catch(e) {
        console.log(e);
    }
}

const handleMuteClick = () => {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled));
    
    if(!muted) {
        muteBtn.innerText = "Unmuted";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

const handleCameraClick = () => {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));

    if(!cameraOff) {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    } else {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }
}

const handleCameraChange = async () => {
    await getMedia(cameraSelect.value);

    if (myPeerConnection) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find((sender) => sender.track.kind === "video");
        
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);


// NOTE Welcome From(join a room)
const welcome = document.getElementById("welcome");
const welcomeForm = document.querySelector("form");

call.hidden = true;

const initCall = async () => {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

const handleWelcomeSubmit = async (event) => {
    event.preventDefault();

    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);


// NOTE Socket Code
socket.on("welcome", async () => {
    myDataChannel = myPeerConnection.createDataChannel("chat");
    myDataChannel.addEventListener("message", (event) => {
        console.log(event.data);
    });
    console.log("made data channel");
    const offer = await myPeerConnection.createOffer();

    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
    myPeerConnection.addEventListener("datachannel", (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener("message", (event) => {
            console.log(event.data);
        });
    });
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);

    const answer = await myPeerConnection.createAnswer();

    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
});

socket.on("answer", answer => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", ice => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
});

// NOTE RTC Code
const makeConnection = () => {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ]
            }
        ]
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}

const handleIce = (data) => {
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

const handleAddStream = (data) => {
    const peerFace = document.getElementById("peerFace");
    peerFace.srcObject = data.stream;
}
