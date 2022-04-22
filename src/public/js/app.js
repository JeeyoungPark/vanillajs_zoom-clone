const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

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
}

getMedia();

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);

