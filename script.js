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
        el.style.borderWidth = '2px';
        el.style.borderColor = '#6a655f';

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

    el.addEventListener('pointerup', (e) => {
        el.style.borderWidth = '1px';
        el.style.borderColor = '';
    });

    el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        // console.log('yo');
    })
}

document.querySelectorAll('.annotation').forEach(makeDraggable);
// makeDraggable(document.querySelector('.world img'));


// Pan handler

const makeInsightWindowPannable = function () {
    const viewport = document.querySelector('.viewport');
    const world = document.querySelector('.world');
    let panX = 0;
    let panY = 0;
    let startX, startY;

    viewport.addEventListener('pointerdown', (e) => {
        if (viewport.classList.contains('armed')) return;
        viewport.setPointerCapture(e.pointerId);
        viewport.classList.add('panning');
        startX = e.clientX - panX;
        startY = e.clientY - panY;
    });

    viewport.addEventListener('pointermove', (e) => {
        if (!viewport.hasPointerCapture(e.pointerId)) return;
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        world.style.transform = `translate(${panX}px, ${panY}px)`;
    });

    viewport.addEventListener('pointerup', (e) => {
        if (!viewport.hasPointerCapture(e.pointerId)) return;
        viewport.releasePointerCapture(e.pointerId);
        viewport.classList.remove('panning');
    });
}();


// Highlighted marker

const makeHighlightDrag = function () {
    const chatThread = document.getElementById('chat-thread');
    const picker = document.querySelector('.color-picker'); // hidden by default
    let clonedRange = null;
    let rangeList = [];

    function toggleColorPicker(value = 'on' | 'off') {
        switch (value) {
            case 'on': {
                picker.style.display = 'flex';
                picker.hidden = false;
                break;
            }
            case 'off': {
                picker.style.display = 'none';
                picker.hidden = true;
                break;
            }
        }
    }

    function makeChipDraggable(chip) {
        let ghost = null;

        chip.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            chip.style.borderWidth = '2px';
            chip.style.cursor = 'grabbing';
            chip.setPointerCapture(e.pointerId);
            ghost = chip.cloneNode(true);
            ghost.classList.add('drag-ghost');
            ghost.style.backgroundColor = '#cbcbcb';
            ghost.style.border = '2px dashed grey';
            document.body.appendChild(ghost);
        });

        chip.addEventListener('pointermove', (e) => {
            if (!ghost) return;

            const chatThread = document.getElementById('chat-thread');
            const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
            const viewport = document.querySelector('.viewport');
            // const chatThread = document.querySelector('.chatThread');
            // offset by half chip bounding box
            ghost.style.left = `${e.clientX - chip.getBoundingClientRect().width / 2}px`;
            ghost.style.top = `${e.clientY - chip.getBoundingClientRect().height / 2}px`;

            if (viewport.contains(dropTarget)) {
                ghost.style.backgroundColor = '';
                ghost.style.border = '2px dashed grey';
            }

            if (chatThread.contains(dropTarget)) {
                ghost.style.backgroundColor = '#cbcbcb';
                ghost.style.border = '2px dashed grey';
            }
        });

        chip.addEventListener('pointerup', (e) => {
            e.stopPropagation();
            const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
            const viewport = document.querySelector('.viewport');
            const color = chip.className.toString().replace('highlight highlight--', '');
            if (viewport.contains(dropTarget)) {
                const worldRect = document.querySelector('.world').getBoundingClientRect();
                createAnnotation({
                    text: chip.textContent,
                    color: color,
                    x: e.clientX - worldRect.left - chip.getBoundingClientRect().width / 2,
                    y: e.clientY - worldRect.top - chip.getBoundingClientRect().height / 2,
                });
            }
            chip.style.borderWidth = '1px';
            chip.style.cursor = 'grab';

            // BUG: selection ends in another mark
            try {
                ghost.remove();
            } catch (error) {
                ghost = undefined;
            }

            // ghost.remove();
            ghost = null;
        });
    }

    function createAnnotation({ text, color, x, y, anchorX, anchorY }) {
        const el = document.createElement('div');
        el.className = `annotation annotation--${color}`;
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        document.querySelector('.world').appendChild(el);
        // make new annotation draggable
        makeDraggable(el);

        if (anchorX != null) {
            // optionally draw a connecannotations
        }
        return el;
    }

    toggleColorPicker('off');

    // Highlight selection

    // Show not-allowed cursor when selection in middle of marks
    chatThread.addEventListener('pointermove', (e) => {
        const sel = window.getSelection();
        let landedMark;
        if (!sel.isCollapsed && e.target.nodeName === "MARK") {
            landedMark = e.target;
            landedMark.style.cursor = 'not-allowed';
        };

    })

    chatThread.addEventListener('mouseup', (e) => {
        const sel = window.getSelection();
        // Reset cursor for marks
        document.querySelectorAll('mark').forEach((m) => m.style.cursor = 'grab');

        // If selection ends in a mark, return
        if (e.target.nodeName === "MARK") {
            return;
        }

        // Normal click || select only space
        if (sel.isCollapsed || sel.toString().trim() === '') {
            toggleColorPicker('off');

            // Select mark
            // if (e.target.nodeName === "MARK") {
            //     // Reset all border width then bolden current mark
            //     document.querySelectorAll('mark').forEach((el) => {
            //         el.style.borderWidth = '1px';
            //     });
            //     const currentMark = e.target;
            //     currentMark.style.borderWidth = '2px';
            //     return;
            // }

            // if (e.target.nodeName !== "MARK") {
            //     document.querySelectorAll('mark').forEach((el) => {
            //         el.style.borderWidth = '1px';
            //     });
            //     return;
            // }
            return;
        }

        // if (!sel.isCollapsed && e.target.nodeName === "MARK") {
        //     console.log('wow');
        // }


        const range = sel.getRangeAt(0);
        clonedRange = range.cloneRange();
        /**
         * Note that the getRangeAt() method returns a range object
         * that gives me where the current selection begins and ends
         * in the HTML structure.
         * Thus, I can use this to get the coord for the color picker
         */
        // const rect = sel.getRangeAt(0).getBoundingClientRect();
        /**
         * Actually, we don't want to use the highlighted bounding box
         * but we want to use the position of the cursor instead.
         * It's more intuitive.
         */

        // Show picker widget
        picker.style.left = `${e.clientX + 4}px`;
        picker.style.top = `${e.clientY + 4}px`;
        toggleColorPicker('on');

    });

    // Picker workflow
    picker.addEventListener('click', (e) => {
        const color = e.target.getAttribute('color');
        if (!color || !clonedRange) return;

        const mark = document.createElement('mark');
        mark.className = `highlight highlight--${color}`;
        /**
         * BUG: Do not recall window.getSelection().getRangeAt(0) here
         * because it's scoped to picker, such that `mark` would be 
         * added to picker, not chatThread.
         * clonedRange works because it's lexically scoped in chatThread */

        // operate on the saved range, not a fresh selection
        clonedRange.surroundContents(mark);
        rangeList.push(clonedRange);
        clonedRange = null;

        // console.log(rangeList);
        toggleColorPicker('off');
        makeChipDraggable(mark);
    });

    document.querySelectorAll('mark').forEach(makeChipDraggable);


}();


// Freehand artefact-highlighter

const makeFreehandHighlighter = function () {
    const chatForm = document.getElementById('window--chat-input');
    const chatInput = document.getElementById('chat-input');
    const toggleBtn = document.getElementById('freehand-toggle');
    const picker = document.getElementById('freehand-picker');
    const viewport = document.querySelector('.viewport');
    const world = document.querySelector('.world');
    const freehandCanvas = document.getElementById('freehand-canvas');
    const ctx = freehandCanvas.getContext('2d');

    // Saturated stroke colors (pastel fill vars are too light to read on the image)
    const STROKE_COLOR = {
        sunshine: '#e0b400',
        lightgreen: '#4caf50',
        lavender: '#8a6fd8',
        lightsalmon: '#e8813f',
        orange: '#b8552f',
    };

    const usedColorsThisDraft = new Set();
    let armedColor = null;
    let lastRange = null;
    let points = [];
    let isDrawing = false;

    // --- caret tracking in the compose box ---

    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (chatInput.contains(range.startContainer)) {
            lastRange = range.cloneRange();
        }
    });

    // Reset "used colors" once the draft is sent (Enter, no shift)

    function resetChatInput(e) {
            e.preventDefault();
            chatInput.textContent = '';
            usedColorsThisDraft.clear();
            lastRange = null;

    }

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            resetChatInput(e);
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target !== chatInput && chatInput.textContent === '') {
            resetChatInput(e);
        }
    })

    // --- color popover ---

    function renderPicker() {
        picker.querySelectorAll('.color-picker--swatch').forEach((swatch) => {
            const color = swatch.dataset.color;
            const disabled = usedColorsThisDraft.has(color);
            swatch.classList.toggle('is-disabled', disabled);
            swatch.setAttribute('aria-disabled', String(disabled));
        });
    }

    function openPicker() {
        renderPicker();
        picker.hidden = false;
    }

    function closePicker() {
        picker.hidden = true;
    }

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // If toggleBtn pressed when armed, disarm and return
        if (armedColor) {
            disarm();
            return;
        }

        if (picker.hidden) {
            openPicker();
        } else {
            closePicker();
        }
    });

    picker.addEventListener('click', (e) => {
        const swatch = e.target.closest('.color-picker--swatch');
        if (!swatch || swatch.classList.contains('is-disabled')) return;
        arm(swatch.dataset.color);
        closePicker();
    });

    document.addEventListener('pointerdown', (e) => {
        if (picker.hidden) return;
        if (picker.contains(e.target) || toggleBtn.contains(e.target)) return;
        closePicker();
    });

    // --- arm / disarm ---

    function arm(color) {
        armedColor = color;
        toggleBtn.setAttribute('aria-pressed', 'true');
        // Disable panning while armed
        viewport.classList.add('armed');
        document.body.classList.add('freehand-drawing');
    }

    function disarm() {
        armedColor = null;
        toggleBtn.setAttribute('aria-pressed', 'false');
        viewport.classList.remove('armed');
        document.body.classList.remove('freehand-drawing');
        closePicker();
    }

    // --- drawing on the artefact ---

    function toWorldPoint(e) {
        const worldRect = world.getBoundingClientRect();
        return {
            x: e.clientX - worldRect.left,
            y: e.clientY - worldRect.top,
        };
    }

    function midpoint(a, b) {
        return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    }

    freehandCanvas.addEventListener('pointerdown', (e) => {
        if (!armedColor) return;
        e.preventDefault();
        freehandCanvas.setPointerCapture(e.pointerId);
        isDrawing = true;
        points = [toWorldPoint(e)];

        ctx.strokeStyle = STROKE_COLOR[armedColor];
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 28;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    });

    freehandCanvas.addEventListener('pointermove', (e) => {
        if (!isDrawing) return;
        points.push(toWorldPoint(e));

        const n = points.length;
        if (n < 3) return;

        const p0 = points[n - 3];
        const p1 = points[n - 2];
        const p2 = points[n - 1];
        const start = midpoint(p0, p1);
        const end = midpoint(p1, p2);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(p1.x, p1.y, end.x, end.y);
        ctx.stroke();
    });

    freehandCanvas.addEventListener('pointerup', (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        freehandCanvas.releasePointerCapture(e.pointerId);

        const color = armedColor;
        if (points.length >= 1) {
            usedColorsThisDraft.add(color);
            insertChip(color);
        }
        points = [];
        disarm();
    });

    // --- inline chip insertion ---

    function insertChip(color) {
        chatInput.focus();

        let range = lastRange;
        if (!range || !chatInput.contains(range.startContainer)) {
            range = document.createRange();
            range.selectNodeContents(chatInput);
            range.collapse(false);
        }

        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        const chip = document.createElement('span');
        chip.className = `chip chip--${color}`;
        chip.contentEditable = 'false';
        chip.textContent = '● this part';

        range.deleteContents();
        range.insertNode(chip);

        const space = document.createTextNode(' ');
        range.setStartAfter(chip);
        range.collapse(true);
        range.insertNode(space);
        range.setStartAfter(space);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);

        lastRange = range.cloneRange();
    }
}();


// DEBUGGING TOOL:
// window.addEventListener('click', (e) => {
//     // console.log(document.elementFromPoint(e.clientX, e.clientY));
//     // console.log(e.clientX, e.clientY);
// })

