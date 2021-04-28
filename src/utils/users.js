const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (!username || !room) {
    return {
      error: "username and room are required",
    };
  }
  const exsistingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  if (exsistingUser) {
    return {
      error: "Username is in use!",
    };
  }

  const user = { id, username, room };
  console.log(user);

  users.push(user);
  return {user};
};

const removeUser = ({id}) => {
    console.log(`from remove user ${id}`);
console.log(users);
    const index = users.findIndex((user)=>user.id === id);
    if(index !== -1){
        return users.splice(index,1)[0];
    }
    return {
        error:'user not found'
    }
};

const getUser = ({id}) => {
    return  users.find((user)=>user.id === id) ;
};

const getUsersInRoom = (room) => {
    return users.filter((user)=>user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
