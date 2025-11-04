const GLOBAL_INDEX = 0;

const dropArea = document.getElementById('drop-area');
const container = document.getElementById('container');
const buttons = document.getElementById('buttons');
const copy = document.getElementById('copy');
const paste = document.getElementById('paste');
const download = document.getElementById('download');
const changeFile = document.getElementById('changeFile');
const fileInput = document.getElementById('file-input');
const fileInput2 = document.getElementById('file-input-img');
const browse = document.getElementById('browse');
const preview = document.getElementById('preview');

// Highlight drop area on drag
['dragenter', 'dragover'].forEach(event =>
  dropArea.addEventListener(event, e => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add('highlight');
  })
);

// Unhighlight on drag leave/drop
['dragleave', 'drop'].forEach(event =>
  dropArea.addEventListener(event, e => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove('highlight');
  })
);

container.style.display = 'none';
buttons.style.display = 'none';

// Handle drop
dropArea.addEventListener('drop', e => {
  const files = e.dataTransfer.files;
  handleFiles(files);
});

// Click to open file dialog
dropArea.addEventListener('click', () => fileInput.click());
browse.addEventListener('click', e => {
  e.stopPropagation();
  fileInput.click();
});


let config = {"backgroundColor":"#000000","imgSize":4200,"numDots":10000,"spiralTurns":100,"minDotSize":0,"maxDotSize":50,"clockwise":1,"startAlpha":1,"middlePercent":0.8,"middleAlpha":0.5,"edgeAlpha":0,"globalAlphaAuto":false,"staticSize":false, "pGreen":0.33,"pBlue":0.33, "lumi":0.4};

let normSamples;
// Handle file input change
fileInput.addEventListener('change', async () => {
  for (const file of fileInput.files) {
		if (!file) return;
			dropArea.style.display = 'none';
    	preview.innerHTML = `<p>Selected: ${file.name}</p>`;
		preview.style.display = 'flex';

		container.style.display = 'flex';
		buttons.style.display = 'flex';
		document.title = fileInput.files[0].name.split('.')[0];

		// Read and process the file
		const arrayBuffer = await file.arrayBuffer();
		const audioBuffer = await decodeAudioData(arrayBuffer);

		// Create canvas
		const canvas = document.getElementById('canvas');
		const ctx = canvas.getContext('2d');

		ctx.fillStyle = config.backgroundColor;
		console.log(config.backgroundColor)
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// Set canvas size based on config
		canvas.style.width = '600px';
		canvas.style.height = '600px';
		canvas.width = config.imgSize;
		canvas.height = config.imgSize;

		// Process and draw
		normSamples = normalizeAudioData(audioBuffer);
		drawSpiralDots(ctx, normSamples, canvas.width);

		// Optional: Create download link
		const url = canvas.toDataURL();
		const a = document.createElement('a');
		a.href = url;
		a.download = file.name.replace('.mp3', '.png');
  }
});

function handleFiles(files) {
  preview.innerHTML = '';
  for (const file of files) {
    const div = document.createElement('div');
    div.textContent = `Selected: ${file.name}`;
    preview.appendChild(div);
  }
}

document.getElementById('configForm').addEventListener('submit', handleSubmit);
document.getElementById('configForm').addEventListener('change', handleSubmit);

function handleSubmit(e) {
	if (e != "newConfig")
  	e.preventDefault();
	if (fileInput.files.length == 0)
		return;
  const newConfig = e != "newConfig" ? {
    backgroundColor: document.getElementById('backgroundColor').value,
    imgSize: parseInt(document.getElementById('imgSize').value, 10),
    numDots: parseInt(document.getElementById('numDots').value, 10),
    spiralTurns: parseInt(document.getElementById('spiralTurns').value, 10),
    minDotSize: parseFloat(document.getElementById('minDotSize').value),
    maxDotSize: parseFloat(document.getElementById('maxDotSize').value),
	pGreen: parseFloat(document.getElementById('pGreen').value),
	pBlue: parseFloat(document.getElementById('pBlue').value),
	lumi: parseFloat(document.getElementById('lumi').value),
    clockwise: parseInt(document.getElementById('clockwise').value, 10),
    startAlpha: parseFloat(document.getElementById('startAlpha').value),
    middlePercent: parseFloat(document.getElementById('middlePercent').value),
    middleAlpha: parseFloat(document.getElementById('middleAlpha').value),
    edgeAlpha: parseFloat(document.getElementById('edgeAlpha').value),
    globalAlphaAuto: document.getElementById('globalAlphaAuto').checked,
    staticSize: document.getElementById('staticSize').checked
  } : newConfigGlobal;
	if (JSON.stringify(newConfig) == JSON.stringify(config))
		return;
	config = newConfig;

	document.title = fileInput.files[0].name.split('.')[0];
	document.getElementById('imgSizeValue').innerHTML = config.imgSize;
	document.getElementById('numDotsValue').innerHTML = config.numDots;
	document.getElementById('pGreenValue').innerHTML = config.pGreen;
	document.getElementById('pBlueValue').innerHTML = config.pBlue;
	document.getElementById('lumiValue').innerHTML = config.lumi;
	document.getElementById('spiralTurnsValue').innerHTML = config.spiralTurns;
	document.getElementById('minDotSizeValue').innerHTML = config.minDotSize;
	document.getElementById('maxDotSizeValue').innerHTML = config.maxDotSize;

	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');

	// Set canvas size based on config
	canvas.style.width = '600px';
	canvas.style.height = '600px';
	canvas.width = config.imgSize;
	canvas.height = config.imgSize;

	ctx.fillStyle = config.backgroundColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	drawSpiralDots(ctx, normSamples, canvas.width);
  // Now use `config` as needed!
  console.log(config);
}

copy.addEventListener('click', () => {
	const configString = JSON.stringify(config);
	navigator.clipboard.writeText(configString);
	alert('Config copied to clipboard!');
});

paste.addEventListener('click', () => {
	fileInput2.click();
});

let newConfigGlobal;

fileInput2.addEventListener('change', async () => {
	// bug when multiple files
  for (const file of fileInput2.files) {
		if (!file) return;
		// get file name
		let fileName = file.name;
		// check file name regex
		const regexFile = /^#[0-9a-fA-F]{6}(,\d+){5},-?\d+(,(0(?:\.\d+)?|1(?:\.0+)?)){4}(,true|,false){2}.png$/;
		if (!regexFile.test(fileName))
			alert('Please select a .png file with valid name format');

		// load config from file
		fileName = fileName.split('.png')[0];
		newConfigGlobal = string_to_config(fileName);

		handleSubmit("newConfig");
  }
});

download.addEventListener('click', () => {
	const canvas = document.getElementById('canvas');
	const url = canvas.toDataURL();
	const a = document.createElement('a');
	a.href = url;
	a.download = config_to_string(config) + '.png';
	a.click();
});

changeFile.addEventListener('click', () => {
	fileInput.click();
});


// Audio decoding using Web Audio API
function decodeAudioData(arrayBuffer) {
	return new Promise((resolve, reject) => {
		const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		audioContext.decodeAudioData(arrayBuffer, resolve, reject);
	});
}

function normalizeAudioData(audioBuffer) {
	const channelData = audioBuffer.getChannelData(0);
	let min = Infinity, max = -Infinity;
	for (let i = 0; i < channelData.length; i++) {
			if (channelData[i] < min) min = channelData[i];
			if (channelData[i] > max) max = channelData[i];
	}
	// Now normalize
	return Array.from(channelData, s => (s - min) / (max - min));
}

function drawSpiralDots(ctx, normSamples, imgSize) {
	ctx.fillStyle = config.backgroundColor;
	ctx.fillRect(0, 0, imgSize, imgSize);
	const centerX = imgSize / 2;
	const centerY = imgSize / 2;
	const numDots = config.numDots;
	const spiralTurns = config.spiralTurns;
	const maxRadius = imgSize * 0.45;

	for (let i = 0; i < numDots; i++) {
		const idx = Math.floor(map(i, 0, numDots, 0, normSamples.length));
		const amp = normSamples[idx];

		const angle = config.clockwise * (i / numDots) * spiralTurns * 2 * Math.PI;
		const radius = map(i, 0, numDots, 0, maxRadius) * (0.6 + amp * 0.9);

		const x = centerX + Math.cos(angle) * radius;
		const y = centerY + Math.sin(angle) * radius;

		const hue = getColor(i, amp);
		const size = config.staticSize ?
			config.maxDotSize :
			map(i, 0, numDots-1, config.minDotSize, config.maxDotSize);

		const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
		// grad.addColorStop(0, `hsla(${hue}, 80%, 60%, ${1 - map(i, 0, numDots, 0, 0.8)})`); // Center
		// grad.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);     // Edge
		const lumi = (config.lumi ?? 0.4) * 100;
		grad.addColorStop(0, `hsla(${hue}, 80%, ${lumi}%, ${config.startAlpha})`); // Center
		grad.addColorStop(config.middlePercent, `hsla(${hue}, 80%, ${lumi}%, ${config.middleAlpha})`);     // Middle
		grad.addColorStop(1, `hsla(${hue}, 80%, ${lumi}%, ${config.edgeAlpha})`);     // Edge

		ctx.beginPath();
		ctx.arc(x, y, size, 0, 2 * Math.PI);
		ctx.fillStyle = grad;
		ctx.globalAlpha = config.globalAlphaAuto ? 1 : 0.15 + 0.85 * amp;
		ctx.fill();
	}
}

function getColor(i, amp) {
	const totalP = (config.pGreen ?? 0.33) + (config.pBlue ?? 0.33);
	if (totalP > 1) {
		pGreen = (config.pGreen ?? 0.33) / totalP;
		pBlue = (config.pBlue ?? 0.33) / totalP;
	}
	const pOther = 1 - totalP < 0 ? 0 : 1 - totalP;
	document.getElementById('pOtherValue').innerHTML = pOther.toFixed(2);
	const r = Math.random();
	if (r < pBlue) {
		// Plus d'aléatoire dans le bleu (180-240)
		const blueBase = map(amp, 0, 1, 150, 210);
		const randomOffset = (Math.random() - 0.5) * 40; // ±20 de variation
		return Math.max(180, Math.min(240, blueBase + randomOffset));
	} else if (r < totalP) {
		// Vert plus foncé (60-120 au lieu de 90-150) avec plus d'aléatoire
		const greenBase = map(amp, 0, 1, 60, 120);
		const randomOffset = (Math.random() - 0.5) * 30; // ±15 de variation
		return Math.max(60, Math.min(120, greenBase + randomOffset));
	}
	return (Math.sin(amp * Math.PI * 2) * 180 + 180 + i * 137.5) % 360;
}

function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function config_to_string(config) {
  return Object.keys(config).map(key => config[key]).join(',');
}

function string_to_config(string) {
  // parse a one line string, short for config
  const stringArray = string.split(',');
  return {
    backgroundColor: stringArray[0],
    imgSize: parseInt(stringArray[1]),
    numDots: parseInt(stringArray[2]),
    spiralTurns: parseInt(stringArray[3]),
    minDotSize: parseInt(stringArray[4]),
    maxDotSize: parseInt(stringArray[5]),
    clockwise: parseInt(stringArray[6]),
    startAlpha: parseFloat(stringArray[7]),
    middlePercent: parseFloat(stringArray[8]),
    middleAlpha: parseFloat(stringArray[9]),
    edgeAlpha: parseFloat(stringArray[10]),
    globalAlphaAuto: stringArray[11] == 'true',
    staticSize: stringArray[12] == 'true'
  };
}