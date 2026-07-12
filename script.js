
function makeDraggable(el) {
    let offsetX, offsetY;

    el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        // Specify the element as a capture target for future pointer events
        el.setPointerCapture(e.pointerId);
        // Get the bounding rectangle
        const rect = el.getBoundingClientRect();
        // return the relative offset based on original position
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        console.clear();
        console.log(`${offsetX} = ${e.clientX} - ${rect.left}`);
        console.log(`${offsetY} = ${e.clientY} - ${rect.top}`);
    });

    el.addEventListener('pointermove', (e) => {
        if (!el.hasPointerCapture(e.pointerId)) return;

        // get the absolute position of the parent figure frame
        const figureRect = el.closest('figure').getBoundingClientRect();

        // return the absolute offset based on the parent figure frame
        const newLeft = e.clientX - figureRect.left - offsetX;
        const newTop = e.clientY - figureRect.top - offsetY;

        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;

    });
}

document.querySelectorAll('.annotation').forEach(makeDraggable);


// Pan handler

const viewport = document.querySelector('.viewport');
const world = document.querySelector('.world');
let panX = 0;
let panY = 0;
let startX, startY;

viewport.addEventListener('pointerdown', (e) => {
    viewport.setPointerCapture(e.pointerId);
    viewport.classList.add('panning');
    startX = e.clientX - panX;
    startY = e.clientY - panY;
})

viewport.addEventListener('pointermove', (e) => {
    if (!viewport.hasPointerCapture(e.pointerId)) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    world.style.transform = `translate(${panX}px, ${panY}px)`;
})

viewport.addEventListener('pointerup', (e) => {
    viewport.releasePointerCapture(e.pointerId);
    viewport.classList.remove('panning');
})