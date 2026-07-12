const drawGrid = function () {
    // 1. Get the canvas element and its 2D context
    const canvas = document.querySelector('.world canvas');
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = 32;

    // 2. Set line styles
    ctx.strokeStyle = 'lightgray';
    ctx.lineWidth = 0.5;

    // 3. Clear the canvas before drawing (optional I think)
    // ctx.clearRect(0, 0, width, height);

    // 4. Begin the batch drawing path
    ctx.beginPath();

    // 5. Create vertical lines
    for (let x = 0; x <= width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }

    // 6. Create horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }

    // 7. Paint all lines to the canvas at once
    ctx.stroke();
}();


function makeDraggable(el) {
    let offsetX, offsetY;

    el.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        // Specify the element as a capture target for future pointer events
        el.setPointerCapture(e.pointerId);
        // Get the bounding rectangle of el
        const rect = el.getBoundingClientRect();
        // return the relative offset based on pointerdown
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        // console.clear();
        // console.log(`${offsetX} = ${e.clientX} - ${rect.left}`);
    });

    el.addEventListener('pointermove', (e) => {
        if (!el.hasPointerCapture(e.pointerId)) return;

        // get the absolute position of the parent frame
        // BUG: make sure el references the immediate parent .world 
        const worldRect = el.closest('.world').getBoundingClientRect();

        // return the absolute offset based on the parent world frame - pointer offset
        const newLeft = e.clientX - worldRect.left - offsetX;
        // console.clear();
        // console.log(`${newLeft} = ${e.clientX} - ${worldRect.left} - ${offsetX}`);
        const newTop = e.clientY - worldRect.top - offsetY;

        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;

    });
}

document.querySelectorAll('.annotation').forEach(makeDraggable);
// makeDraggable(document.querySelector('.world img'));


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