const startBtn = document.querySelector('.start-btn');
const stopBtn = document.querySelector('.stop-btn');
const downloadLink = document.querySelector('.download-anc');
const webcamPreview = document.getElementById('webcam-preview');

let mediaRecorder;
let recordedChunks = [];
let combinedStream;

async function setupStreams() {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    const webcamStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    webcamPreview.srcObject = webcamStream;

    // Combine screen video and webcam audio
    const audioTrack = webcamStream.getAudioTracks()[0];
    combinedStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      audioTrack
    ]);

    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm; codecs=vp8,opus'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
    };
  } catch (err) {
    alert("Error: " + err.message);
    console.error(err);
  }
}

startBtn.addEventListener('click', async () => {
  await setupStreams();
  recordedChunks = [];
  mediaRecorder.start();
  alert("Recording started.");
});

stopBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    alert("Recording stopped.");
  }
});
