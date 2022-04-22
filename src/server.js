import http from "http";
import SocketIO from "socket.io"
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

// NOTE 사용자가 홈(/)으로 GET 요청을 보내면 home 템플릿을 제공
app.get("/", (req, res) => res.render("home"));
// NOTE 사용자가 홈이 아닌 다른 주소로 요청하면 홈으로 리다이렉트
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });

    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });

    socket.on("ice", (ice, roomName) => {
        socket.to(roomName).emit("ice", ice);
    })
});

const handleListen = () => console.log('Listening on http://localhost:3000');

httpServer.listen(3000, handleListen);
