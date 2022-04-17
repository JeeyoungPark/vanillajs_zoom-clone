const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;
}

const handleRoomSubmit = (event) => {
    event.preventDefault();

    const input = welcomeForm.querySelector("input");
    
    socket.emit("enter_room", input.value, showRoom);
    input.value = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit);
