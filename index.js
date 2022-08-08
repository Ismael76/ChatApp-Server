const express = require("express");
const app = express();
//We need this 'http' to use it with socket.io, we use it to create a server
const http = require("http");
const cors = require("cors");

//We need to import Server from socket.io
const { Server } = require("socket.io");
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Chat App Is Live!");
});

//We create our server using the http library
const server = http.createServer(app);

//Initialize a variable called io, we create a new instance of a Server we imported from socket.io and pass in the server we created using the http library
const io = new Server(server, {
  cors: {
    origin: "https://livechatbot-app.herokuapp.com/",
    method: ["GET", "POST"],
  },
});

//io.on is used to listen to an event, similar to event listeners in JS
//If someone connects to the socket io server, io,on we pass it an 'event' we are listening to, in the below case we are listening for a connection. If event is captured
//We pass the action as a callback function, so when event is triggered (someone connects) we execute code in call back
//This callback function takes a parameter called socket
//We write all our socket events inside this main 'connection' event as we want to execute all the other events once a user connects to the socket
//We use the socket parameter of the callback to make the rest of the event listeners for our socket
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });

  //Join a room using the socket, we created 'join_room' as an event to listen for when someone joins a room
  //When we use the socket.on() to listen for events, we can pass the callback functions to these events some data as the parameter, this data is usually data passed from the front-end.
  socket.on("join_room", (data) => {
    //socket.join is a method in socketio, we pass in the data from the front end in order to make the join, this data is going to be the room number for our chat app.
    socket.join(data);
    //data variable is now holding our room number as on the front-end we sent our room number through using the emit method.
    console.log(`User With ID: ${socket.id} Joined Room: ${data}`);
  });

  //Message event, when our socket recieves a message from front-end we want to execute this event
  socket.on("send_message", (data) => {
    //We created a socket event on the front-end that is listening for the event 'receieve_message', we can emit data from the back-end to this event on the front-end so
    //our front-end recieves this data from the back-end to use in the front-end.
    //To send only messages to the specific room we use the method to() and we can pass it the room id which is part of the message object we recieved from the front-end
    //So we can simply do dot notation to access this room key inside of our message object to get the room number we want to send messages to
    socket.to(data.room).emit("receive_message", data);
  });
});

const port = 3500 || process.env.PORT;

server.listen(port, () => {
  console.log(`SERVER IS RUNNING ON PORT: ${port}`);
});
