window.addEventListener('load', _event => {
  let bitmapSource;
  let paths = [[]];
  let context;

  const fileInput = document.querySelector('#fileInput');
  const traceCanvas = document.querySelector('#traceCanvas');
  const vectorSvg = document.querySelector('#vectorSvg');

  fileInput.addEventListener('change', event => {
    if (event.currentTarget.files === 0) {
      return;
    }

    if (event.currentTarget.files > 1) {
      alert('Upload just one file.');
      return;
    }

    const rasterFile = event.currentTarget.files[0];
    if (bitmapSource && !confirm('You already have a file open. Are you sure you want to discard it?')) {
      return;
    }

    const rasterUrl = URL.createObjectURL(rasterFile);
    const sizeImg = document.createElement('img');
    sizeImg.src = rasterUrl;

    sizeImg.addEventListener('load', async event => {
      bitmapSource = await createImageBitmap(event.currentTarget);
      URL.revokeObjectURL(rasterUrl);
      traceCanvas.width = bitmapSource.width;
      traceCanvas.height = bitmapSource.height;
      vectorSvg.setAttribute('width', bitmapSource.width);
      vectorSvg.setAttribute('height', bitmapSource.height);
      paths = [[]];
      context = traceCanvas.getContext('2d');
      render();
    });

    sizeImg.addEventListener('error', _event => {
      alert('There was an erro loading your image.');
      return;
    });
  });

  // Note that Firefox will restore the file upon refresh in local development so we do not have to open it constantly
  if (fileInput.files.length === 1) {
    const changeEvent = document.createEvent('HTMLEvents');
    changeEvent.initEvent('change', false, false);
    fileInput.dispatchEvent(changeEvent);
  }

  function render() {
    context.drawImage(bitmapSource, 0, 0);
    if (paths.length === 0) {
      return;
    }

    for (let path of paths) {
      if (path.length === 0) {
        continue;
      }

      context.beginPath();

      context.moveTo(path[0].x, path[0].y);
      for (let index = 1; index < path.length; index++) {
        const x = path[index].x;
        const y = path[index].y;
        context.lineTo(x, y);
      }
  
      context.closePath();
      context.stroke();
    }

    if (vectorSvg.children.length === 0) {
      const pathPolyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      pathPolyline.setAttribute('fill', 'none');
      pathPolyline.setAttribute('stroke', 'black');
      vectorSvg.appendChild(pathPolyline);
    }

    if (vectorSvg.children.length !== paths.length) {
      alert('The SVG element was corrupted.');
      return;
    }

    let counter = 0;
    for (let path of paths) {
      const pathPolyline = vectorSvg.children[counter++];
      pathPolyline.setAttribute('points', path.map(c => `${c.x},${c.y} `).join(''));
      pathPolyline.style.setProperty('--polyline-length', pathPolyline.getTotalLength());
    }
  }

  traceCanvas.addEventListener('pointerdown', event => {
    paths[paths.length - 1].push({ x: event.offsetX, y: event.offsetY });
    render();
  });

  // Pop point
  const popPointButton = document.querySelector('#popPointButton');
  popPointButton.addEventListener('click', _event => {
    paths[paths.length - 1].pop();
    render();
  });

  // Split path
  const splitPathButton = document.querySelector('#splitPathButton');
  splitPathButton.addEventListener('click', _event => {
    paths.push([]);
    render();
  });

  // Animation?
  const animateInput = document.querySelector('#animateInput');
  vectorSvg.classList.toggle('animate', animateInput.checked);
  animateInput.addEventListener('change', _event => {
    vectorSvg.classList.toggle('animate', animateInput.checked);
  });

  // Animation duration
  const animationDurationInput = document.querySelector('#animationDurationInput');
  const animationDurationUnitSelect = document.querySelector('#animationDurationUnitSelect');
  setAnimationDuration(animationDurationInput.value, animationDurationUnitSelect.value);
  animationDurationInput.addEventListener('input', _event => setAnimationDuration(animationDurationInput.value, animationDurationUnitSelect.value));
  animationDurationUnitSelect.addEventListener('change', _event => setAnimationDuration(animationDurationInput.value, animationDurationUnitSelect.value));

  // Animation timing function
  const animationTimingFunctionSelect = document.querySelector('#animationTimingFunctionSelect');
  const animationTimingFunctionValueInput = document.querySelector('#animationTimingFunctionValueInput');
  setAnimationTimingFunction(animationTimingFunctionSelect.value, animationTimingFunctionValueInput.value);
  animationTimingFunctionValueInput.classList.toggle('hidden', animationTimingFunctionSelect.value);
  animationTimingFunctionSelect.addEventListener('change', _event => {
    setAnimationTimingFunction(animationTimingFunctionSelect.value, animationTimingFunctionValueInput.value);
    animationTimingFunctionValueInput.classList.toggle('hidden', animationTimingFunctionSelect.value);
  });
  animationTimingFunctionValueInput.addEventListener('input', _event => {
    setAnimationTimingFunction(animationTimingFunctionSelect.value, animationTimingFunctionValueInput.value);
    animationTimingFunctionValueInput.classList.toggle('hidden', animationTimingFunctionSelect.value);
  });

  // Animation delay
  const animationDelayInput = document.querySelector('#animationDelayInput');
  const animationDelayUnitSelect = document.querySelector('#animationDelayUnitSelect');
  setAnimationDelay(animationDelayInput.value, animationDelayUnitSelect.value);
  animationDelayInput.addEventListener('input', _event => setAnimationDelay(animationDelayInput.value, animationDelayUnitSelect.value));
  animationDelayUnitSelect.addEventListener('change', _event => setAnimationDelay(animationDelayInput.value, animationDelayUnitSelect.value));

  // Animation iteration count
  const animationIterationCountInput = document.querySelector('#animationIterationCountInput');
  const animationIterationCountInfiniteInput = document.querySelector('#animationIterationCountInfiniteInput');
  const animationIterationCountNotInfiniteInput = document.querySelector('#animationIterationCountNotInfiniteInput');
  setAnimationIterationCount(animationIterationCountInput.value, animationIterationCountInfiniteInput.checked);
  animationIterationCountInput.addEventListener('input', _event => setAnimationIterationCount(animationIterationCountInput.value, animationIterationCountInfiniteInput.checked));
  animationIterationCountInfiniteInput.addEventListener('change', _event => setAnimationIterationCount(animationIterationCountInput.value, animationIterationCountInfiniteInput.checked));
  animationIterationCountNotInfiniteInput.addEventListener('change', _event => setAnimationIterationCount(animationIterationCountInput.value, animationIterationCountInfiniteInput.checked));

  // Animation direction
  const animationDirectionSelect = document.querySelector('#animationDirectionSelect');
  setAnimationDirection(animationDirectionSelect.value);
  animationDirectionSelect.addEventListener('change', _event => setAnimationDirection(animationDirectionSelect.value));

  // Copy source code
  document.querySelector('#copySourceButton').addEventListener('click', _event => {
    navigator.clipboard.writeText(vectorSvg.outerHTML);
  });
});

function setAnimationDuration(value, unit) {
  document.body.style.setProperty('--animation-duration', value + unit);
}

function setAnimationTimingFunction(value, customValue) {
  document.body.style.setProperty('--animation-timing-function', value || customValue);
}

function setAnimationDelay(value, unit) {
  document.body.style.setProperty('--animation-delay', value + unit);
}

function setAnimationIterationCount(count, infinite) {
  document.body.style.setProperty('--animation-iteration-count', infinite ? 'infinite' : count);
}

function setAnimationDirection(value) {
  document.body.style.setProperty('--animation-direction', value);
}
