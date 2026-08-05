const compassFace = document.getElementById('compassFace');
const qiblaNeedle = document.getElementById('qiblaNeedle');
const startBtn = document.getElementById('startBtn');

// Koordinat Ka'bah (Mekkah)
const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

let qiblaBearing = 0;

// Fungsi Menghitung Arah Kiblat berdasarkan koordinat pengguna
function calculateQiblaBearing(lat, lng) {
    const phiK = (KAABA_LAT * Math.PI) / 180;
    const lambdaK = (KAABA_LNG * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const lambda = (lng * Math.PI) / 180;

    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
}

// Mengambil lokasi pengguna
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                qiblaBearing = calculateQiblaBearing(userLat, userLng);
                
                // Posisikan jarum indikator Kiblat sesuai azimuth hasil kalkulasi
                qiblaNeedle.style.transform = `rotate(${qiblaBearing}deg)`;
            },
            () => {
                alert("Gagal mengakses lokasi. Gunakan lokasi default.");
            }
        );
    }
}

// Menangani rotasi kompas dari sensor HP
function handleOrientation(event) {
    let alpha = event.alpha; // Rotasi dalam derajat [0, 360]
    
    // Penanganan khusus Safari iOS
    if (event.webkitCompassHeading) {
        alpha = event.webkitCompassHeading;
    } else if (alpha !== null) {
        alpha = 360 - alpha;
    }

    if (alpha !== null) {
        compassFace.style.transform = `rotate(${-alpha}deg)`;
    }
}

// Mengaktifkan Sensor Kompas (Mendukung iOS & Android)
function initCompass() {
    getUserLocation();

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // Khusus iOS 13+
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation, true);
                    startBtn.style.display = 'none';
                } else {
                    alert('Izin akses sensor kompas ditolak.');
                }
            })
            .catch(console.error);
    } else {
        // Android & Browser Standar
        window.addEventListener('deviceorientationabsolute', handleOrientation, true) ||
        window.addEventListener('deviceorientation', handleOrientation, true);
        startBtn.style.display = 'none';
    }
}

startBtn.addEventListener('click', initCompass);
