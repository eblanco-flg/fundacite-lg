const video = document.getElementById('video')
let predictedAges = [];

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/fundacite-lg/ai-demo/people/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/fundacite-lg/ai-demo/people/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/fundacite-lg/ai-demo/people/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/fundacite-lg/ai-demo/people/models'),
  faceapi.nets.ageGenderNet.loadFromUri('/fundacite-lg/ai-demo/people/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
  predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  video.insertAdjacentElement('afterend', canvas);
  //document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    //faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    const age = resizedDetections[0].age;
    const interpolatedAge = interpolateAgePredictions(age);
    const bottomRight = {
      x: resizedDetections[0].detection.box.bottomRight.x - 50,
      y: resizedDetections[0].detection.box.bottomRight.y
      }
    new faceapi.draw.DrawTextField(
      [`${faceapi.utils.round(interpolatedAge, 0)} años`],
      bottomRight
      ).draw(canvas);
  }, 50)
})