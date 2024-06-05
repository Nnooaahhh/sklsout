// scripts.js

document.addEventListener('DOMContentLoaded', function() {
    // Metronome
    let bpm = 60;
    let isPlaying = false;
    let metronomeInterval;

    const bpmSlider = document.getElementById('bpm');
    const bpmValue = document.getElementById('bpm-value');
    const startStopButton = document.getElementById('start-stop');

    bpmSlider.addEventListener('input', function() {
        bpm = bpmSlider.value;
        bpmValue.textContent = bpm;
        if (isPlaying) {
            clearInterval(metronomeInterval);
            startMetronome();
        }
    });

    startStopButton.addEventListener('click', function() {
        if (isPlaying) {
            stopMetronome();
        } else {
            startMetronome();
        }
    });

    function startMetronome() {
        isPlaying = true;
        startStopButton.textContent = 'Stop';
        const interval = 60000 / bpm;
        metronomeInterval = setInterval(playClick, interval);
    }

    function stopMetronome() {
        isPlaying = false;
        startStopButton.textContent = 'Start';
        clearInterval(metronomeInterval);
    }

    function playClick() {
        const clickSound = new Audio('click.mp3');
        clickSound.play();
    }

    // Decibel Checker
    const startDbCheckButton = document.getElementById('start-db-check');
    const dbLevelDisplay = document.getElementById('db-level');
    let audioContext;
    let analyser;

    startDbCheckButton.addEventListener('click', function() {
        if (!audioContext) {
            initDecibelChecker();
        }
    });

    function initDecibelChecker() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                checkDecibels();
            })
            .catch(err => console.error('Error accessing audio stream:', err));
    }

    function checkDecibels() {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function getAverageVolume(array) {
            let values = 0;
            let average;

            for (let i = 0; i < array.length; i++) {
                values += array[i];
            }

            average = values / array.length;
            return average;
        }

        function update() {
            analyser.getByteFrequencyData(dataArray);
            const average = getAverageVolume(dataArray);
            const decibels = 20 * Math.log10(average);
            dbLevelDisplay.textContent = decibels.toFixed(2);

            requestAnimationFrame(update);
        }

        update();
    }
});
