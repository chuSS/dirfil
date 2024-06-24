const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

socket.addEventListener('open', () => {
  console.log('WebSocket connection established');
});

socket.addEventListener('message', (event) => {
  // console.log('Message from server:', event.data);
  const results = JSON.parse(event.data);
  displayResults(results);
});

socket.addEventListener('error', (event) => {
  console.error('WebSocket error:', event);
});

document.getElementById('dirForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const dirPath = document.getElementById('dirPath').value;
  socket.send(dirPath);
});

function displayResults(results) {
  const resultsElement = document.getElementById('results');
  resultsElement.textContent = JSON.stringify(results, null, 2);
}
