const socket = io();

//Elements
const $messageForm = document.querySelector("#messageForm");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $shareLocationBtn = document.querySelector("#shareLocation");
const $messages = document.querySelector("#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template")
  .innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;

// Height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visiavle height
  const visiableHeight = $messages.offsetHeight
//Height of message container
  const containerHeight = $messages.scrollHeight;
//How far have I scrolled
  const scrollOffset = $messages.scrollTop + visiableHeight;

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (msg) => {
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    msg: msg.text,
    createdAt: moment(msg.createdAt).format("HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMsg", (msg) => {
  const html = Mustache.render(locationTemplate, {
    username: msg.username,
    url: msg.url,
    createdAt: moment(msg.createdAt).format("HH:mm"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const msg = e.target.elements.message.value;
  socket.emit("sendMessage", msg, (error) => {
    $messageFormInput.value = "";
    $messageFormInput.focus();
    $messageFormButton.removeAttribute("disabled");

    if (error) {
      return console.log(error);
    }

    console.log("Message delivered!");
  });
});

$shareLocationBtn.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation is nnot supported bu tyour broewser");
  }

  $shareLocationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    1;
    const { latitude, longitude } = position.coords;
    socket.emit("shareLocation", { latitude, longitude }, () => {
      $shareLocationBtn.removeAttribute("disabled");
      console.log("Location shared!");
    });
  });
});

socket.emit("join", { room, username }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
