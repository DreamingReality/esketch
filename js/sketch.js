function Sketch() {
    let gridWrapper;
    let gridCells = [];
    let layoutContent, activeButton;
    let gridSize, gridSizeText;
    let selectedColor = '#000';
    let mouseDown = false;
    let ctrlDown = false;
    const rainbowColors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    let currentRainbowColorIndex = 0;
    let drawedElement = null;

    function createGridWrapper(rows, cols) {
        let div = document.createElement('div');
        div.className = 'grid-wrapper';
        div.style = `grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, 1fr)`;
        return div;
    }

    function createGrid(rows, cols) {
        let list = [];
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            for (let colIndex = 0; colIndex < cols; colIndex++) {
                let div = document.createElement('div');
                let cName = 'grid-cell border-top-left';
                if (colIndex === cols - 1) {
                    cName += ' border-right';
                }
                if (rowIndex === rows - 1) {
                    cName += ' border-bottom';
                }
                div.className = cName;
                list.push(div);
            }
        }
        return list;
    }

    function initializeGrid(rows, cols) {
        let grid = createGridWrapper(rows, cols);
        gridCells = createGrid(rows, cols);
        gridCells.forEach((cell) => {
            grid.appendChild(cell);
        });
        return grid;
    }

    /**
     * Creates a list of html elements from the given list
     * each item of the list must contain at least tagName
     * @param {array} list list of objects from which to create the elements
     * @returns {arary} list with created html elements
     */
    function createElements(list) {
        let elementList = [];
        list.forEach((item) => {
            if (item.tagName) {
                let elm = document.createElement(item.tagName);
                Object.keys(item).forEach((key) => {
                    if (key !== 'tagName') {
                        elm[key] = item[key];
                    }
                });
                elementList.push(elm);
            }
        })
        return elementList;
    }

    /**
     * Creates a list of html elements from the given list 
     * each item of the list must contain at least tagName
     * first element in the list will be the parent, the other elements will be added as children of the parent
     * @param {array} list list of objects from which to create the elements
     * @returns {HtmlElement} parent element which contain all children (if any)
     */
    function createParentAndChildren(list) {
        let elementList = createElements(list);
        let parentElement = elementList.shift();
        elementList.forEach((item) => {
            parentElement.appendChild(item);
        });

        return parentElement;
    }

    function createMenu(cols) {
        let elements = [
            { tagName: 'div', className: 'menu-wrapper'},
            { tagName: 'input', className: 'color-picker', id: 'colorPicker', type: 'color'},
            { tagName: 'button', id: 'btnColor', textContent: 'Color mode', className: 'active'},
            { tagName: 'button', id: 'btnGray', textContent: 'Gray mode'},
            { tagName: 'button', id: 'btnRainbow', textContent: 'Rainbow'},
            { tagName: 'button', id: 'btnEraser', textContent: 'Eraser'},
            { tagName: 'button', id: 'btnClear', textContent: 'Clear'},
            { tagName: 'div', id: 'gridSizeText', className: 'grid-size-text', textContent: cols + ' x ' + cols},
            { tagName: 'input', className: 'grid-size', id: 'gridSize', type: 'range', min: 4, max: 76, value: cols},
            { tagName: 'div', className: 'info-text', textContent: 'For non pointer devices hold down left mouse button or Ctrl key to draw while moving the mouse'},
        ]

        return createParentAndChildren(elements);
    }

    function createLayout() {
        let year = new Date().getFullYear();
        let elements = [
            {tagName: 'div', className: 'layout'},
            { tagName: 'div', className: 'header', textContent: 'Etch-a-Sketch'},
            { tagName: 'div', className: 'content', id:'content'},
            { tagName: 'div', className: 'footer', innerHTML: `Copyright &copy; ${year} DreamingReality`},
        ];

        return createParentAndChildren(elements);
    }

    function clearSketch() {
        gridCells.forEach((item) => {
            item.removeAttribute('style');
        })
    }

    function addMenuEvents(menu) {
        gridSizeText = menu.querySelector('#gridSizeText');
        menu.addEventListener('click', function(ev) {
            if (ev.target.tagName === 'BUTTON') {
                if (ev.target.id === 'btnClear') {
                    clearSketch();
                }
                else if (activeButton.id !== ev.target.id) {
                    activeButton.classList.remove('active');
                    activeButton = ev.target;
                    activeButton.classList.add('active');
                    // reset drawed element to be able to change it's style
                    drawedElement = null;
                }
            }
        });

        menu.querySelector('#colorPicker').addEventListener('change', function(ev) {
            selectedColor = ev.target.value;
            // reset drawed element to be able to change it's style
            drawedElement = null;
        })

        menu.querySelector('#gridSize').addEventListener('change', function (ev) {
            recreateGrid(ev.target.value);
        });
    }

    function recreateGrid(size) {
        gridSize = size;
        setGridSizeText(gridSize);
        gridWrapper.remove();
        gridWrapper = initializeGrid(gridSize, gridSize);
        layoutContent.appendChild(gridWrapper);

        addGridEvents();
    }

    function setGridSizeText(val) {
        gridSizeText.textContent = val + ' x ' + val;
    }

    function getNextRainbowColor() {
        currentRainbowColorIndex++;
        if (currentRainbowColorIndex >= rainbowColors.length) {
            currentRainbowColorIndex = 0;
        }
        return rainbowColors[currentRainbowColorIndex];
    }

    function getNextGrayColor(target) {
        let grayColor = 230;
        if (target.dataset && target.dataset.color) {
            grayColor = parseInt(target.dataset.color);
            if (grayColor === 0) {
                // restart from gray
                grayColor = 230; 
            } else {
                // next shade of gray
                grayColor-=25;
                // make it black if less than 25
                if (grayColor < 25) {
                    grayColor = 0;
                }
            }
        }
        
        target.dataset.color = grayColor;
        return `rgb(${grayColor},${grayColor},${grayColor})`;
    }

    function drawElement(target) {
        if (drawedElement === target) {
            return;
        }
        drawedElement = target;
        switch (activeButton.id) {
            case 'btnColor': target.style.backgroundColor = selectedColor; break;
            case 'btnGray': target.style.backgroundColor = getNextGrayColor(target); break;
            case 'btnEraser': target.removeAttribute('style'); break;
            case 'btnRainbow': target.style.backgroundColor = getNextRainbowColor(); break;
        }

        // remove dataset attribute if not gray mode
        if (activeButton.id !== 'btnGray' && target.dataset && target.dataset.color) {
            target.removeAttribute('dataset');
        }
    }

    function addGridEvents() {
        gridWrapper.addEventListener('mousemove', function(ev) {
            if (mouseDown || ctrlDown) {
                drawElement(ev.target);
            }
        });

        gridWrapper.addEventListener('touchmove', function(ev) {
            if (mouseDown || ctrlDown) {
                // get target from point, since touchmove doesn't update the event target (the initial pressed element remains the target)
                let target = document.elementFromPoint(ev.changedTouches[0].clientX, ev.changedTouches[0].clientY);
                if (target && target.classList && target.classList.contains('grid-cell')) {
                    if (ev.cancelable) {
                        ev.preventDefault();
                    }
                    drawElement(target);
                }
            }
        });

        gridWrapper.addEventListener('mouseup', function(ev) {
            drawElement(ev.target);
            mouseDown = false;
            if (activeButton.id === 'btnRainbow' || activeButton.id === 'btnGray') {
                // reset drawed element to be able to change it's style after mouse up
                drawedElement = null;
            }
        });

        gridWrapper.addEventListener('touchend', function(ev) {
            console.log('touch end');
            drawElement(ev.target);
            mouseDown = false;
            if (activeButton.id === 'btnRainbow' || activeButton.id === 'btnGray') {
                // reset drawed element to be able to change it's style after mouse up
                drawedElement = null;
            }
        });

        gridWrapper.addEventListener('mousedown', function(ev) {
            mouseDown = true;
        });

        gridWrapper.addEventListener('touchstart', function(ev) {
            mouseDown = true;
            console.log('touch start');
        });
    }

    function addWindowEvents() {
        window.addEventListener('keydown', function(ev) {
            if (ev.key === 'Control') {
                ctrlDown = true;
            }
        });

        window.addEventListener('keyup', function(ev) {
            if (ev.key === 'Control') {
                ctrlDown = false;
            }
        });
    }

    function initialize(size) {
        gridSize = size;
        let layout = createLayout();
        let menu = createMenu(gridSize);
        gridWrapper = initializeGrid(gridSize, gridSize);

        layoutContent = layout.querySelector('#content');
        layoutContent.appendChild(menu);
        layoutContent.appendChild(gridWrapper);
        document.body.appendChild(layout);

        activeButton = menu.querySelector('#btnColor');
        addMenuEvents(menu);
        addGridEvents();
        addWindowEvents();
    }

    initialize(16);
}

var sketch = new Sketch();