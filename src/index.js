const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require("./utils/users");
const app = express();

// Create a to pass in socketio
const server = http.createServer(app);
// Send server to use sockets
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, "../public");
app.use(express.static(publicDirPath));

//http://localhost:3000/test
app.get("/test", (req, res) => {
  res.send("Hello World!");
});

//on user connection event
io.on("connection", (socket) => {
  console.log(`User connection detected `);

  // for all users
  socket.on("sendMessage", (msg, callback) => {
    const user = getUser({id:socket.id});

    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callback("Profanity is not allowed!");
    }
    io.to(user.room).emit("message", generateMessage(user.username,msg));
    callback();
  });

  socket.on("shareLocation", ({ longitude, latitude }, callback) => {
    const user = getUser({id:socket.id});
    io.to(user.room).emit(
      "locationMsg",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser({id:socket.id});
 
    if(user){
      io.to(user.room).emit("message", generateMessage("Admin",`${user.username} has left`));
      io.to(user.room).emit("roomData",{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
    
  });

  socket.on("join", ({ username, room }, callback) => {
    socket.join(room);
    const { error, user } = addUser({ id: socket.id, username, room });
    if(error) {
      callback(error);
      return;
    }
    console.log(getUsersInRoom(user.room))
    // for this user
    socket.emit("message", generateMessage("Admin","Welcome!"));
    // for all but this user
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage("Admin",`${user.username} has joined!`));

    io.to(user.room).emit("roomData",{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
      callback();
  });



});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
