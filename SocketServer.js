const {Server, Socket} = require("socket.io");
const io = new Server();
let Config = require("./Config");
io.resource_members = [];

io.on("connection", (socket) => {
    console.log("User connected");
    io.resource_members.push(socket)

    socket.on("disconnect", (reason) => {

        console.log("User disconnected " + reason)

        var resource_index = io.resource_members.indexOf(socket);
        if (resource_index !== -1) {
            io.resource_members.splice(resource_index, 1);
            console.log(socket.user + " element removed from resource_members")
        }
    });
});

io.SendResourceInfo = function (info) {
    io.resource_members.forEach(element => element.emit("resource_info", info));
}


io.listen(Config.Port);
console.log(Config.Port)
console.log("Open")

module.exports = io;
