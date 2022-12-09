const speedText = document.getElementById('speed');
const percent = document.getElementById('percent');
const transfered = document.getElementById('transfered');

window.api.receiveProgress((e, args) => {
  speedText.innerText = `${(args.speed / 1024 / 1024).toFixed(2)} Mb/second`;
  percent.innerText = `${args.percent.toFixed(0)} %`;
  percent.style.width = `${args.percent}%`;
  transfered.innerText = `${(args.current / 1024 / 1024).toFixed(1)} MB / ${(args.total / 1024 / 1024).toFixed(1)} MB`;
});
