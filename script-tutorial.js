const dialog = document.querySelector("dialog");
const showButton = document.getElementById("btn--showTut");
const btnNextIconName = 'arrow_forward_ios';
const btnBackIconName = 'arrow_back_ios';
const btnDoneIconName = 'check';

// "Show the dialog" button opens the dialog modally
showButton.addEventListener("click", () => {
    renderTutorial_paraHighlight();

    dialog.showModal();
});

function renderTutorial_paraHighlight() {
    const img = document.createElement('img');
    const h1 = document.createElement('h1');
    const p = document.createElement('p');
    const btnPanel = document.createElement('div');
    const btnBack = document.createElement('button');
    const btnNext = document.createElement('button');
    const btnSkip = document.createElement('button');
    const btnNextIcon = document.createElement('span');
    const btnBackIcon = document.createElement('span');

    btnNextIcon.textContent = btnNextIconName;
    btnBackIcon.textContent = btnBackIconName;
    btnNextIcon.classList.add('material-symbols-outlined');
    btnBackIcon.classList.add('material-symbols-outlined');

    btnSkip.setAttribute('commandfor', 'tutorial--dialog');
    btnSkip.command = "close";
    btnSkip.textContent = "Skip";
    btnSkip.classList.add('btn--skip');
    btnSkip.addEventListener("click", () => {
        dialog.close();
    });

    btnNext.classList.add('btn--next');
    btnNext.appendChild(btnNextIcon);
    btnNext.addEventListener('click', renderTutorial_dragAndDrop);

    btnBack.classList.add('btn--back');
    btnBack.appendChild(btnBackIcon);
    btnBack.disabled = 'true';

    btnPanel.classList.add('btn--panel');

    img.src = './img/paraHighlight.gif';
    h1.textContent = 'Highlight a dialogue insight';
    p.textContent = 'Select a phrase from the conversation and choose a color to mark it as an insight.';

    btnPanel.replaceChildren(btnBack, btnNext, btnSkip);
    dialog.replaceChildren(img, h1, p, btnPanel);
}

function renderTutorial_dragAndDrop() {
    const img = document.createElement('img');
    const h1 = document.createElement('h1');
    const p = document.createElement('p');
    const btnPanel = document.createElement('div');
    const btnNext = document.createElement('button');
    const btnBack = document.createElement('button');
    const btnSkip = document.createElement('button');
    const btnNextIcon = document.createElement('span');
    const btnBackIcon = document.createElement('span');

    btnNextIcon.textContent = btnNextIconName;
    btnBackIcon.textContent = btnBackIconName;
    btnNextIcon.classList.add('material-symbols-outlined');
    btnBackIcon.classList.add('material-symbols-outlined');

    btnSkip.setAttribute('commandfor', 'tutorial--dialog');
    btnSkip.command = "close";
    btnSkip.textContent = "Skip";
    btnSkip.classList.add('btn--skip');
    btnSkip.addEventListener("click", () => {
        dialog.close();
    });

    btnNext.classList.add('btn--next');
    btnNext.appendChild(btnNextIcon);
    btnNext.addEventListener('click', renderTutorial_changeHighlight);

    btnBack.classList.add('btn--back');
    btnBack.appendChild(btnBackIcon);
    btnBack.addEventListener('click', renderTutorial_paraHighlight);

    btnPanel.classList.add('btn--panel');

    img.src = './img/dragAndDrop.gif';
    h1.textContent = 'Drag insights onto the artefact';
    p.textContent = 'Drag a highlighted insight from the conversation onto the artefact to pin it in place.';

    btnPanel.replaceChildren(btnBack, btnNext, btnSkip);
    dialog.replaceChildren(img, h1, p, btnPanel);
}

function renderTutorial_changeHighlight() {
    const img = document.createElement('img');
    const h1 = document.createElement('h1');
    const p = document.createElement('p');
    const btnPanel = document.createElement('div');
    const btnNext = document.createElement('button');
    const btnBack = document.createElement('button');
    const btnSkip = document.createElement('button');
    const btnNextIcon = document.createElement('span');
    const btnBackIcon = document.createElement('span');

    btnNextIcon.textContent = btnNextIconName;
    btnBackIcon.textContent = btnBackIconName;
    btnNextIcon.classList.add('material-symbols-outlined');
    btnBackIcon.classList.add('material-symbols-outlined');

    btnSkip.setAttribute('commandfor', 'tutorial--dialog');
    btnSkip.command = "close";
    btnSkip.textContent = "Skip";
    btnSkip.classList.add('btn--skip');
    btnSkip.addEventListener("click", () => {
        dialog.close();
    });

    btnNext.classList.add('btn--next');
    btnNext.appendChild(btnNextIcon);
    btnNext.addEventListener('click', renderTutorial_artefactMarking);

    btnBack.classList.add('btn--back');
    btnBack.appendChild(btnBackIcon);
    btnBack.addEventListener('click', renderTutorial_dragAndDrop);

    btnPanel.classList.add('btn--panel');

    img.src = './img/changeHighlight.gif';
    h1.textContent = 'Change or remove a highlight color';
    p.textContent = 'Reopen the color picker on a marked insight to change its color, or remove the highlight entirely.';

    btnPanel.replaceChildren(btnBack, btnNext, btnSkip);
    dialog.replaceChildren(img, h1, p, btnPanel);
}

function renderTutorial_artefactMarking() {
    const img = document.createElement('img');
    const h1 = document.createElement('h1');
    const p = document.createElement('p');
    const btnPanel = document.createElement('div');
    const btnDone = document.createElement('button');
    const btnNext = document.createElement('button');
    const btnBack = document.createElement('button');
    const btnNextIcon = document.createElement('span');
    const btnBackIcon = document.createElement('span');
    const btnDoneIcon = document.createElement('span');

    btnNextIcon.textContent = btnNextIconName;
    btnBackIcon.textContent = btnBackIconName;
    btnDoneIcon.textContent = btnDoneIconName;
    btnNextIcon.classList.add('material-symbols-outlined');
    btnBackIcon.classList.add('material-symbols-outlined');
    btnDoneIcon.classList.add('material-symbols-outlined');

    btnDone.setAttribute('commandfor', 'tutorial--dialog');
    btnDone.appendChild(btnDoneIcon);
    btnDone.command = "close";
    btnDone.classList.add('btn--done');
    btnDone.addEventListener("click", () => {
        dialog.close();
    });

    btnNext.classList.add('btn--next');
    btnNext.appendChild(btnNextIcon);
    btnNext.disabled = 'true';

    btnBack.classList.add('btn--back');
    btnBack.appendChild(btnBackIcon);
    btnBack.addEventListener('click', renderTutorial_changeHighlight);

    btnPanel.classList.add('btn--panel');

    img.src = './img/artefactMarking.gif';
    h1.textContent = 'Mark a feature on the artefact';
    p.textContent = 'Use the brush tool to draw freehand on the artefact and label the feature you\'re pointing out.';

    btnPanel.replaceChildren(btnBack, btnNext, btnDone);
    dialog.replaceChildren(img, h1, p, btnPanel);
}

document.getElementById('btn--showTut').click();
