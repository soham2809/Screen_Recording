const startBtn = document.querySelector('.start-btn');
const stopBtn = document.querySelector('.stop-btn');
const downloadLink = document.querySelector('.download-anc');
const webcamPreview = document.getElementById('webcam-preview');

let mediaRecorder;
let recordedChunks = [];

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    webcamPreview.srcObject = stream;

    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.style.display = 'inline';
    };

    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    alert("Recording started.");
  } catch (err) {
    alert("Error: " + err.message);
    console.error(err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    alert("Recording stopped.");
  }
}

startBtn.addEventListener('click', startRecording);
stopBtn.addEventListener('click', stopRecording);
