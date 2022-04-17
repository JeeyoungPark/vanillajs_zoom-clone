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

const handleMessageSubmit = (event) => {
    event.preventDefault();

    const input = room.querySelector("input");
    const value = input.value;

    socket.emit("new_message", value, roomName, () => {
        addMessage(`You: ${value}`);
    });

    input.value = "";
}

const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");
    h3.innerHTML = `Room: ${roomName}`;

    const messageForm = room.querySelector("form");
    messageForm.addEventListener("submit", handleMessageSubmit);
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

socket.on("bye", () => {
    addMessage("someone left");
});

socket.on("send_message", (msg) => {
    addMessage(msg);
});
