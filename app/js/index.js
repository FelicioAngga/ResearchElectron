const p = document.querySelector('p');
const btnDisable = document.getElementById('disable');
const btnEnable = document.getElementById('enable');
const btnSend = document.getElementById('send');

btnDisable.addEventListener('click', () => {
  window.api.sendToMain('disable');
});

btnEnable.addEventListener('click', () => {
  window.api.sendToMain('enable');
})

window.api.receiveFromMain((e, args) => {
  new Notification('Task Manager', {body: args})
});

window.api.receiveMessage((e, args) => {
  p.innerText += args;
  p.innerText += '\n';
});

btnSend.addEventListener('click', () => {
  const message = document.getElementById('floatingInput')
  window.api.sendMessage(message.value);
});

const btnUser = document.getElementById("user")

btnUser.addEventListener('click', () => {
  window.api.openUser();
})