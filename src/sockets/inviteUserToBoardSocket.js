export const inviteUserToBoardSocket = (socket) => {
  //Listen event from client emit FE_USER_INVITED_TO_BOARD
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    //Cách làm đơn giản nhất: Emit ngược lại một sự kiện về cho mọi client khác (Ngoại trừ chính cái đang gửi lên), rồi để FE check
    //https://socket.io/get-started/chat#broadcasting
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}