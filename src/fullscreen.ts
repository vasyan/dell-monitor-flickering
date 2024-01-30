const fullscreenButton = document.getElementById('fullscreen-btn') as HTMLButtonElement;
const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;

fullscreenButton.addEventListener('click', () => {
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if ((canvas as any).mozRequestFullScreen) { /* Firefox */
        (canvas as any).mozRequestFullScreen();
    } else if ((canvas as any).webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        (canvas as any).webkitRequestFullscreen();
    } else if ((canvas as any).msRequestFullscreen) { /* IE/Edge */
        (canvas as any).msRequestFullscreen();
    }
});

document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);
document.addEventListener('mozfullscreenchange', onFullscreenChange);
document.addEventListener('MSFullscreenChange', onFullscreenChange);

function onFullscreenChange() {
    const isFullscreen = document.fullscreenElement === canvas ||
                         document.mozFullScreenElement === canvas ||
                         document.webkitFullscreenElement === canvas ||
                         document.msFullscreenElement === canvas;

    console.log('Fullscreen mode:', isFullscreen ? 'Enabled' : 'Disabled');
}
