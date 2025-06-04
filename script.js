const startBtn = document.querySelector('.start-btn');
const stopBtn = document.querySelector('.stop-btn');
const downloadLink = document.querySelector('.download-anc');
const webcamPreview = document.getElementById('webcam-preview');

let mediaRecorder;
let recordedChunks = [];
let combinedStream;

function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

async function setupStreams() {
  try {
    let videoStream, audioStream;

    if (!isMobile() && navigator.mediaDevices.getDisplayMedia) {
      // Desktop screen recording
      videoStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } else {
      // Mobile fallback: camera + mic
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    }

    // Display webcam preview
    webcamPreview.srcObject = videoStream;

    // Combine video and audio tracks
    const tracks = [
      ...videoStream.getVideoTracks(),
      ...(audioStream ? audioStream.getAudioTracks() : videoStream.getAudioTracks())
    ];
    combinedStream = new MediaStream(tracks);

    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.style.display = 'inline';
    };
  } catch (err) {
    alert("Error: " + err.message);
    console.error(err);
  }
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;
  recordedChunks = [];
  await setupStreams();
  if (mediaRecorder) {
    mediaRecorder.start();
    alert("Recording started.");
  }
});

stopBtn.addEventListener('click', () => {
  stopBtn.disabled = true;
  startBtn.disabled = false;
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    alert("Recording stopped.");
  }
});
