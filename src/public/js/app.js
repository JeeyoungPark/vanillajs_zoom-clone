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

    const messageInput = room.querySelector("#message input");
    const value = messageInput.value;

    socket.emit("new_message", value, roomName, () => {
        addMessage(`You: ${value}`);
    });

    messageInput.value = "";
}

const handleNickSubmit = (event) => {
    event.preventDefault();

    const nickInput = room.querySelector("#nick input");
    const value = nickInput.value;

    socket.emit("set_nick", value);
    nickInput.value = "";
}

const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");
    h3.innerHTML = `Room: ${roomName}`;

    const messageForm = room.querySelector("#message");
    const nickForm = room.querySelector("#nick");

    messageForm.addEventListener("submit", handleMessageSubmit);
    nickForm.addEventListener("submit", handleNickSubmit);
}

const handleRoomSubmit = (event) => {
    event.preventDefault();

    const input = welcomeForm.querySelector("input");
    
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (userNick) => {
    addMessage(`${userNick} arrived`);
});

socket.on("bye", (userNick) => {
    addMessage(`${userNick} left`);
});

socket.on("send_message", (msg) => {
    addMessage(msg);
});
