<script lang="ts">
  import { socket } from '$lib/ws/index.js';
  import { nanoid } from 'nanoid';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  const userId = nanoid();
  let roomId: string;
  let messages: any[] = [];
  socket.on('*', (data) => {
    console.log(data);
  });
  socket.on('roomId', (data) => {
    roomId = data;
  });
  socket.on('message', (data) => {
    console.log(data)
    messages = [...messages, data];
  });

  function createRoom() {
    socket.emit('create_room', { userId: userId });
  }

  function joinRoom() {
    socket.emit('join_room', { roomId: roomId, userId: userId });
  }
  let name:string="";
  function emitName() {
    socket.emit('name', { name: name });
  }
  const users: any[] = [];

  socket.on('user_joiner_room', (data) => {
    users.push(data);
  });
  
  let message:string="";
  function messageToRoom() {
    socket.emit('message_to_room', { roomId: roomId, message: message});
  }
  </script>

<div class="fixed top-8">
  <button on:click={createRoom}>Create Room</button><br />
  <label for="room_id">Room id:</label><br />
  <input type="text" id="room_id" name="room_id" bind:value={roomId} /><br />
  <button on:click={joinRoom}>Join Room</button><br />
  <label for="room_id">Name:</label><br />
  <input type="text" id="room_id" name="room_id" bind:value={name} /><br />
  <button on:click={emitName}>Send name</button><br />
  <label for="room_id">message to room</label><br />
  <input type="text" id="room_id" name="room_id" bind:value={message} /><br />
  <button on:click={messageToRoom}>Send message</button>
  
  <SuperDebug data={messages} />
</div>
