import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

// NOTE 사용자가 홈(/)으로 GET 요청을 보내면 home 템플릿을 제공
app.get("/", (req, res) => res.render("home"));
// NOTE 사용자가 홈이 아닌 다른 주소로 요청하면 홈으로 리다이렉트
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log('Listening on http://localhost:3000');

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// NOTE fake database
const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    console.log("Connected to Browser");
    socket.on("close", () => console.log("Disconnected from Browser"));
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);

        switch(message.type) {
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${message.payload}`));
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
});

server.listen(3000, handleListen);

