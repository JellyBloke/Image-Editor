const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const filterSelect = document.getElementById('filter');
const applyButton = document.getElementById('apply');

let image = new Image();

//Load Image
upload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

image.onload = () => {
  canvas.width = image.width * 2;
  canvas.height = image.height;

  ctx.drawImage(image, 0, 0);
};

//Filter
applyButton.addEventListener('click', () => {
  const selectedFilter = filterSelect.value;

  //Before
  ctx.drawImage(image, 0, 0);

  //Select Filter
  const imageData = ctx.getImageData(0, 0, canvas.width / 2, canvas.height);
  const filteredData = selectedFilter === 'grayscale' 
    ? applyGrayscale(imageData) 
    : applyBlur(imageData);

  //After
  ctx.putImageData(filteredData, canvas.width / 2, 0);
});

//Grayscale
function applyGrayscale(imageData) {
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = data[i + 1] = data[i + 2] = gray;
  }

  return imageData;
}

//Blur
function applyBlur(imageData) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const tempData = new Uint8ClampedArray(data);

  const kernel = [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
  ];
  const kernelWeight = 9;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let rSum = 0, gSum = 0, bSum = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex = ((y + ky) * width + (x + kx)) * 4;

          rSum += tempData[pixelIndex] * kernel[ky + 1][kx + 1];
          gSum += tempData[pixelIndex + 1] * kernel[ky + 1][kx + 1];
          bSum += tempData[pixelIndex + 2] * kernel[ky + 1][kx + 1];
        }
      }

      const pixelIndex = (y * width + x) * 4;
      data[pixelIndex] = rSum / kernelWeight;
      data[pixelIndex + 1] = gSum / kernelWeight;
      data[pixelIndex + 2] = bSum / kernelWeight;
    }
  }

  return imageData;
}
