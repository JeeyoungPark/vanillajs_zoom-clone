const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

const addMessage = (message) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");

    li.innerHTML = message;
    ul.appendChild(li);
}

const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");
    h3.innerHTML = `Room: ${roomName}`;
}

const handleRoomSubmit = (event) => {
    event.preventDefault();

    const input = welcomeForm.querySelector("input");
    
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
    addMessage("someone joined");
});
