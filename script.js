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
                    // BUG: no idea why it doesn't drop exactly at the designated point
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


// DEBUGGING TOOL:
// window.addEventListener('click', (e) => {
//     // console.log(document.elementFromPoint(e.clientX, e.clientY));
//     // console.log(e.clientX, e.clientY);
// })

