const image1 = document.getElementById('bgImage1');
const image2 = document.getElementById('bgImage2');

// Function to toggle images
function randomGlitch() {
    const randomValue = Math.random();
    if (randomValue < 0.5) {
        image1.style.opacity = 1;
        image2.style.opacity = 0.5;
    } else {
        image1.style.opacity = 0.5;
        image2.style.opacity = 1;
    }
}

// Set an interval to switch images every 5 seconds (5000 milliseconds)
setInterval(randomGlitch, 150);