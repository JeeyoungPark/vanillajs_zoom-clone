const nickForm = document.querySelector("#nick");
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
    const msg = { type, payload };
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("Connection to Server");
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerHTML = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("Disconnected from Server");
});

const handleNickSubmit = (event) => {
    event.preventDefault();

    const input = nickForm.querySelector("input");

    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

const handleSubmit = (event) => {
    event.preventDefault();

    const input = messageForm.querySelector("input");

    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}

nickForm.addEventListener("submit", handleNickSubmit);
messageForm.addEventListener("submit", handleSubmit);
