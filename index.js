var barContainer = document.querySelector(".bar-container");
var bars = [];
var speedSlider = document.querySelector("#speed-slider");
var speedValue = document.querySelector("#speed-value");
var barCountSlider = document.querySelector("#bar-count-slider");
var barCountValue = document.querySelector("#bar-count-value");
var datasetPreset = document.querySelector("#dataset-preset");
var presetDescription = document.querySelector("#preset-description");
var customValuesInput = document.querySelector("#custom-values");
var customValuesMessage = document.querySelector("#custom-values-message");
var applyCustomValuesButton = document.querySelector("#apply-custom-values");
var barCountMeta = document.querySelector("#bar-count-meta");
var arraySize = document.querySelector("#array-size");
var sortStatus = document.querySelector("#sort-status");
var soundToggle = document.querySelector("#sound-toggle");
var soundLabel = document.querySelector("#sound-label");
var themeToggle = document.querySelector("#theme-toggle");
var themeLabel = document.querySelector("#theme-label");
var themeColorMeta = document.querySelector('meta[name="theme-color"]');
var algorithmSelect = document.querySelector("#algorithm-select");
var algorithmDescription = document.querySelector("#algorithm-description");
var runSortButton = document.querySelector("#run-sort");
var sortDisabledNote = document.querySelector("#sort-disabled-note");
var btnUnsort = document.querySelector(".btn-unsort");
var pauseButton = document.querySelector("#pause-sort");
var stepButton = document.querySelector("#step-sort");
var restartButton = document.querySelector("#restart-sort");
var compareMode = document.querySelector("#compare-mode");
var comparePicker = document.querySelector("#compare-picker");
var compareSelect = document.querySelector("#compare-select");
var compareValidation = document.querySelector("#compare-validation");
var visualPanel = document.querySelector(".visual-panel");
var compareBoard = document.querySelector("#compare-board");
var compareLeftBars = document.querySelector("#compare-left-bars");
var compareRightBars = document.querySelector("#compare-right-bars");
var heightArray = [];
var customValues = null;
var unsortColor = "var(--bar-unsorted)";
var sortColor = "var(--bar-sorted)";
var soundEnabled = true;
var audioContext;
var lastToneAt = 0;
var activeRun = null;
var runTimer = null;
var lastRunConfig = null;

var algorithmInfo = {
   bubble: { name: "Bubble sort", complexity: "O(n²)", category: "Comparison sort", stable: true, inPlace: true, description: "Repeatedly compares neighboring values and swaps them when they are out of order.", steps: ["Compare a pair of neighboring bars.", "Swap the pair when the left value is larger.", "Repeat passes until the largest values settle at the end."] },
   selection: { name: "Selection sort", complexity: "O(n²)", category: "Comparison sort", stable: false, inPlace: true, description: "Finds the smallest remaining value and moves it into place.", steps: ["Scan the unsorted section for its smallest value.", "Swap that value into the next open position.", "Continue with the remaining section."] },
   insertion: { name: "Insertion sort", complexity: "O(n²)", category: "Comparison sort", stable: true, inPlace: true, description: "Builds a sorted section by inserting each value where it belongs.", steps: ["Take the next value from the unsorted section.", "Shift larger values one position to the right.", "Insert the value into the gap that remains."] },
   merge: { name: "Merge sort", complexity: "O(n log n)", category: "Comparison based · Divide and conquer", stable: true, inPlace: false, description: "Splits the list, sorts each half, then merges the results.", steps: ["Divide the list into smaller halves.", "Sort each half recursively.", "Merge the halves by choosing the smaller next value."] },
   quick: { name: "Quick sort", complexity: "O(n log n) average", category: "Comparison based · Divide and conquer", stable: false, inPlace: true, description: "Partitions values around a pivot, then sorts each partition.", steps: ["Choose a pivot value from the section.", "Move smaller values before the pivot and larger values after it.", "Repeat on both sides of the pivot."] },
   heap: { name: "Heap sort", complexity: "O(n log n)", category: "Comparison sort", stable: false, inPlace: true, description: "Builds a max heap and repeatedly moves its largest value to the end.", steps: ["Arrange values into a max heap.", "Swap the root, the largest value, with the last unsorted bar.", "Shrink the heap and restore its order."] },
   shell: { name: "Shell sort", complexity: "O(n log² n)", category: "Comparison sort", stable: false, inPlace: true, description: "Sorts values across shrinking gaps until adjacent order is restored.", steps: ["Start by comparing bars separated by a wide gap.", "Move each value into order within its gap group.", "Reduce the gap until a final adjacent pass completes."] },
   cocktail: { name: "Cocktail sort", complexity: "O(n²)", category: "Comparison sort", stable: true, inPlace: true, description: "Moves out-of-order values in both directions through the list.", steps: ["Sweep left to right, moving large values toward the end.", "Sweep right to left, moving small values toward the start.", "Repeat the two sweeps over the remaining section."] },
   counting: { name: "Counting sort", complexity: "O(n + k)", category: "Non-comparison based", stable: true, inPlace: false, description: "Counts each integer value, then writes the values back in order.", steps: ["Count how many times each value appears.", "Visit the counts from the smallest value upward.", "Write each value back as many times as it was counted."] },
   radix: { name: "Radix sort", complexity: "O(d × (n + k))", category: "Non-comparison based", stable: true, inPlace: false, description: "Orders nonnegative integers one digit position at a time.", steps: ["Start with the least significant digit.", "Group values by that digit while preserving their order.", "Repeat for each digit until the whole list is ordered."] }
};

function animationDelay() {
   return 101 - Number(speedSlider.value);
}

function applyTheme(theme) {
   document.documentElement.dataset.theme = theme;
   var isDark = theme === "dark";
   themeToggle.setAttribute("aria-pressed", String(isDark));
   themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
   themeLabel.textContent = isDark ? "Light theme" : "Dark theme";
   themeToggle.querySelector(".theme-icon").textContent = isDark ? "☀" : "☾";
   themeColorMeta.content = isDark ? "#111b2a" : "#f3f6fb";
}

function playTone(value) {
   if (!soundEnabled || !(window.AudioContext || window.webkitAudioContext)) return;
   var now = performance.now();
   if (now - lastToneAt < 45) return;
   lastToneAt = now;
   audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
   if (audioContext.state === "suspended") audioContext.resume();
   var oscillator = audioContext.createOscillator();
   var gain = audioContext.createGain();
   var start = audioContext.currentTime;
   oscillator.type = "sine";
   oscillator.frequency.setValueAtTime(180 + value * 10, start);
   gain.gain.setValueAtTime(0.0001, start);
   gain.gain.exponentialRampToValueAtTime(0.018, start + 0.006);
   gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045);
   oscillator.connect(gain);
   gain.connect(audioContext.destination);
   oscillator.start(start);
   oscillator.stop(start + 0.05);
}

function createBars(container, count) {
   container.replaceChildren();
   for (var index = 0; index < count; index++) {
      var bar = document.createElement("div");
      bar.className = "bars";
      container.appendChild(bar);
   }
   return Array.from(container.querySelectorAll(".bars"));
}

function paintBars(barNodes, values, sorted, active) {
   var sortedIndices = new Set(sorted || []);
   var activeIndices = new Set(active || []);
   barNodes.forEach((bar, index) => {
      bar.style.height = `${(values[index] / 39) * 100}%`;
      bar.classList.toggle("is-active", activeIndices.has(index));
      bar.style.background = activeIndices.has(index) ? "var(--bar-active)" : sortedIndices.has(index) ? sortColor : unsortColor;
   });
}

function resetMetricDisplays() {
   [
      "counter-comparisons", "counter-swaps", "counter-writes", "counter-time",
      "compare-left-comparisons", "compare-left-swaps", "compare-left-writes", "compare-left-time",
      "compare-right-comparisons", "compare-right-swaps", "compare-right-writes", "compare-right-time"
   ].forEach((id) => {
      document.querySelector(`#${id}`).textContent = id.endsWith("time") ? "0.00s" : "0";
   });
}

function isArraySorted(values) {
   return values.every((value, index) => index === 0 || values[index - 1] <= value);
}

function updateSortAvailability() {
   var sameAlgorithms = compareMode.checked && algorithmSelect.value === compareSelect.value;
   var alreadySorted = isArraySorted(heightArray) && datasetPreset.value !== "sorted";
   runSortButton.disabled = sameAlgorithms || alreadySorted;
   sortDisabledNote.hidden = !alreadySorted;
   compareValidation.hidden = !sameAlgorithms;
}

function makePresetValues(preset, count) {
   var ascending = Array.from({ length: count }, (_, index) => {
      return count <= 1 ? 22 : 5 + Math.round((index / (count - 1)) * 34);
   });
   if (preset === "random") return ascending.map(() => Math.floor(Math.random() * 35) + 5);
   if (preset === "reverse") return ascending.reverse();
   if (preset === "equal") return ascending.map(() => 22);
   if (preset === "nearly") {
      var first = Math.floor(count / 3);
      var second = Math.floor((count * 2) / 3);
      var value = ascending[first];
      ascending[first] = ascending[second];
      ascending[second] = value;
      return ascending;
   }
   if (preset === "few-unique") {
      var choices = [8, 17, 26, 35];
      return ascending.map((_, index) => choices[index % choices.length]);
   }
   return ascending;
}

function applyPreset(preset) {
   var descriptions = {
      random: "A fresh random arrangement.",
      sorted: "Values are already in ascending order.",
      reverse: "Values start in descending order.",
      equal: "Every bar has the same value.",
      nearly: "Mostly sorted, with two values out of place.",
      "few-unique": "Repeated values from a small set.",
      custom: "Your own values, ready to sort."
   };
   if (preset === "custom") {
      if (customValues && customValues.length === bars.length) heightArray = customValues.slice();
      else heightArray = heightArray.length === bars.length ? heightArray.slice() : makePresetValues("random", bars.length);
   } else {
      heightArray = makePresetValues(preset, bars.length);
   }
   presetDescription.textContent = descriptions[preset];
   paintBars(bars, heightArray);
   resetMetricDisplays();
   lastRunConfig = null;
   updatePlaybackButtons();
   updateComparePreview();
   btnEnable();
}

function setBarCount(count) {
   if (datasetPreset.value === "custom" && customValues && customValues.length !== count) {
      datasetPreset.value = "random";
      customValues = null;
   }
   bars = createBars(barContainer, count);
   barCountValue.value = String(count);
   barCountMeta.textContent = `${count} ELEMENT${count === 1 ? "" : "S"}`;
   arraySize.textContent = `${count} item${count === 1 ? "" : "s"}`;
   applyPreset(datasetPreset.value);
}

function makeFrame(values, sorted, metrics, active) {
   return {
      values: values.slice(),
      sorted: sorted.slice(),
      comparisons: metrics.comparisons || 0,
      swaps: metrics.swaps || 0,
      writes: metrics.writes || 0,
      active: active || []
   };
}

function createFrames(name, input) {
   var values = input.slice();
   var frames = [];
   var sorted = [];
   function emit(metrics, active) {
      frames.push(makeFrame(values, sorted, metrics || {}, active));
   }
   function swap(first, second) {
      if (first === second) return false;
      var value = values[first];
      values[first] = values[second];
      values[second] = value;
      return true;
   }
   function addFinalFrame() {
      sorted = values.map((_, index) => index);
      emit({}, []);
      return frames;
   }

   if (name === "bubble") {
      for (var end = values.length - 1; end > 0; end--) {
         for (var index = 0; index < end; index++) {
            var didSwap = values[index] > values[index + 1] && swap(index, index + 1);
            emit({ comparisons: 1, swaps: didSwap ? 1 : 0, writes: didSwap ? 2 : 0 }, [index, index + 1]);
         }
         sorted.push(end);
      }
      return addFinalFrame();
   }

   if (name === "selection") {
      for (var start = 0; start < values.length - 1; start++) {
         var minimum = start;
         for (var scan = start + 1; scan < values.length; scan++) {
            var smaller = values[scan] < values[minimum];
            emit({ comparisons: 1 }, [minimum, scan]);
            if (smaller) minimum = scan;
         }
         var selectionSwap = swap(start, minimum);
         if (selectionSwap) emit({ swaps: 1, writes: 2 }, [start, minimum]);
         sorted.push(start);
         emit({}, [start]);
      }
      return addFinalFrame();
   }

   if (name === "insertion") {
      for (var insert = 1; insert < values.length; insert++) {
         var key = values[insert];
         var cursor = insert - 1;
         var moved = false;
         while (cursor >= 0) {
            var shouldMove = values[cursor] > key;
            if (shouldMove) {
               values[cursor + 1] = values[cursor];
               moved = true;
               emit({ comparisons: 1, writes: 1 }, [cursor, cursor + 1]);
               cursor--;
            } else {
               emit({ comparisons: 1 }, [cursor, cursor + 1]);
               break;
            }
         }
         if (moved) {
            values[cursor + 1] = key;
            emit({ writes: 1 }, [cursor + 1]);
         }
         sorted = Array.from({ length: insert + 1 }, (_, index) => index);
      }
      return addFinalFrame();
   }

   if (name === "merge") {
      function mergeSort(low, high) {
         if (high - low < 2) return;
         var middle = Math.floor((low + high) / 2);
         mergeSort(low, middle);
         mergeSort(middle, high);
         var merged = [];
         var left = low;
         var right = middle;
         while (left < middle && right < high) {
            var takeLeft = values[left] <= values[right];
            emit({ comparisons: 1 }, [left, right]);
            merged.push(takeLeft ? values[left++] : values[right++]);
         }
         while (left < middle) merged.push(values[left++]);
         while (right < high) merged.push(values[right++]);
         merged.forEach((value, offset) => {
            var target = low + offset;
            values[target] = value;
            emit({ writes: 1 }, [target]);
         });
      }
      mergeSort(0, values.length);
      return addFinalFrame();
   }

   if (name === "quick") {
      function quickSort(low, high) {
         if (low >= high) {
            if (low === high && !sorted.includes(low)) sorted.push(low);
            return;
         }
         var pivot = values[high];
         var boundary = low;
         for (var scanIndex = low; scanIndex < high; scanIndex++) {
            var belongsLeft = values[scanIndex] <= pivot;
            emit({ comparisons: 1 }, [scanIndex, high]);
            if (belongsLeft) {
               if (swap(boundary, scanIndex)) emit({ swaps: 1, writes: 2 }, [boundary, scanIndex]);
               boundary++;
            }
         }
         if (swap(boundary, high)) emit({ swaps: 1, writes: 2 }, [boundary, high]);
         sorted.push(boundary);
         emit({}, [boundary]);
         quickSort(low, boundary - 1);
         quickSort(boundary + 1, high);
      }
      quickSort(0, values.length - 1);
      return addFinalFrame();
   }

   if (name === "heap") {
      function siftDown(root, size) {
         var largest = root;
         var left = root * 2 + 1;
         var right = left + 1;
         if (left < size) {
            var leftLarger = values[left] > values[largest];
            emit({ comparisons: 1 }, [left, largest]);
            if (leftLarger) largest = left;
         }
         if (right < size) {
            var rightLarger = values[right] > values[largest];
            emit({ comparisons: 1 }, [right, largest]);
            if (rightLarger) largest = right;
         }
         if (largest !== root) {
            swap(root, largest);
            emit({ swaps: 1, writes: 2 }, [root, largest]);
            siftDown(largest, size);
         }
      }
      for (var parent = Math.floor(values.length / 2) - 1; parent >= 0; parent--) siftDown(parent, values.length);
      for (var last = values.length - 1; last > 0; last--) {
         swap(0, last);
         sorted.push(last);
         emit({ swaps: 1, writes: 2 }, [0, last]);
         siftDown(0, last);
      }
      return addFinalFrame();
   }

   if (name === "shell") {
      for (var gap = Math.floor(values.length / 2); gap > 0; gap = Math.floor(gap / 2)) {
         for (var shellIndex = gap; shellIndex < values.length; shellIndex++) {
            var shellValue = values[shellIndex];
            var position = shellIndex;
            while (position >= gap) {
               var isGreater = values[position - gap] > shellValue;
               emit({ comparisons: 1 }, [position - gap, position]);
               if (!isGreater) break;
               values[position] = values[position - gap];
               emit({ writes: 1 }, [position - gap, position]);
               position -= gap;
            }
            if (position !== shellIndex) {
               values[position] = shellValue;
               emit({ writes: 1 }, [position]);
            }
         }
      }
      return addFinalFrame();
   }

   if (name === "cocktail") {
      var leftEdge = 0;
      var rightEdge = values.length - 1;
      var didMove = true;
      while (didMove) {
         didMove = false;
         for (var forward = leftEdge; forward < rightEdge; forward++) {
            var forwardSwap = values[forward] > values[forward + 1];
            if (forwardSwap) swap(forward, forward + 1);
            emit({ comparisons: 1, swaps: forwardSwap ? 1 : 0, writes: forwardSwap ? 2 : 0 }, [forward, forward + 1]);
            if (forwardSwap) didMove = true;
         }
         if (!didMove) break;
         sorted.push(rightEdge--);
         didMove = false;
         for (var backward = rightEdge; backward > leftEdge; backward--) {
            var backwardSwap = values[backward - 1] > values[backward];
            if (backwardSwap) swap(backward - 1, backward);
            emit({ comparisons: 1, swaps: backwardSwap ? 1 : 0, writes: backwardSwap ? 2 : 0 }, [backward - 1, backward]);
            if (backwardSwap) didMove = true;
         }
         sorted.push(leftEdge++);
      }
      return addFinalFrame();
   }

   if (name === "counting") {
      var minValue = Math.min(...values);
      var maxValue = Math.max(...values);
      var counts = Array(maxValue - minValue + 1).fill(0);
      values.forEach((value, index) => {
         counts[value - minValue]++;
         emit({ writes: 1 }, [index]);
      });
      var outputIndex = 0;
      counts.forEach((count, offset) => {
         while (count-- > 0) {
            values[outputIndex] = minValue + offset;
            emit({ writes: 1 }, [outputIndex]);
            outputIndex++;
         }
      });
      return addFinalFrame();
   }

   if (name === "radix") {
      var largestValue = Math.max(...values);
      for (var exponent = 1; Math.floor(largestValue / exponent) > 0; exponent *= 10) {
         var buckets = Array(10).fill(0);
         var output = Array(values.length);
         values.forEach((value, index) => {
            buckets[Math.floor(value / exponent) % 10]++;
            emit({ writes: 1 }, [index]);
         });
         for (var digit = 1; digit < buckets.length; digit++) buckets[digit] += buckets[digit - 1];
         for (var inputIndex = values.length - 1; inputIndex >= 0; inputIndex--) {
            var inputValue = values[inputIndex];
            var bucket = Math.floor(inputValue / exponent) % 10;
            output[--buckets[bucket]] = inputValue;
            emit({ writes: 1 }, [inputIndex]);
         }
         output.forEach((value, index) => {
            values[index] = value;
            emit({ writes: 1 }, [index]);
         });
      }
      return addFinalFrame();
   }

   return addFinalFrame();
}

function updateAlgorithmGuide() {
   var details = algorithmInfo[algorithmSelect.value];
   algorithmDescription.textContent = details.description;
   document.querySelector("#guide-name").textContent = details.name;
   document.querySelector("#guide-complexity").textContent = details.complexity;
   document.querySelector("#guide-description").textContent = details.description;
   document.querySelector("#guide-kind").textContent = details.category.toUpperCase();
   document.querySelector("#guide-stability").textContent = details.stable ? "Stable" : "Not stable";
   document.querySelector("#guide-space").textContent = details.inPlace ? "In-place" : "Uses extra space";
   document.querySelector("#guide-steps").replaceChildren(...details.steps.map((step) => {
      var item = document.createElement("li");
      item.textContent = step;
      return item;
   }));
}

function setMetricText(job, elapsed) {
   var prefix = job.side === "left" ? "compare-left" : job.side === "right" ? "compare-right" : "counter";
   var ids = job.side ? {
      comparisons: `${prefix}-comparisons`, swaps: `${prefix}-swaps`, writes: `${prefix}-writes`, time: `${prefix}-time`
   } : {
      comparisons: "counter-comparisons", swaps: "counter-swaps", writes: "counter-writes", time: "counter-time"
   };
   document.querySelector(`#${ids.comparisons}`).textContent = String(job.metrics.comparisons);
   document.querySelector(`#${ids.swaps}`).textContent = String(job.metrics.swaps);
   document.querySelector(`#${ids.writes}`).textContent = String(job.metrics.writes);
   document.querySelector(`#${ids.time}`).textContent = `${(elapsed / 1000).toFixed(2)}s`;
}

function updateComparePreview() {
   if (!compareMode.checked) return;
   var left = createBars(compareLeftBars, heightArray.length);
   var right = createBars(compareRightBars, heightArray.length);
   paintBars(left, heightArray);
   paintBars(right, heightArray);
   document.querySelector("#compare-left-name").textContent = algorithmInfo[algorithmSelect.value].name;
   document.querySelector("#compare-right-name").textContent = algorithmInfo[compareSelect.value].name;
   ["compare-left-comparisons", "compare-left-swaps", "compare-left-writes", "compare-right-comparisons", "compare-right-swaps", "compare-right-writes"].forEach((id) => {
      document.querySelector(`#${id}`).textContent = "0";
   });
   document.querySelector("#compare-left-time").textContent = "0.00s";
   document.querySelector("#compare-right-time").textContent = "0.00s";
}

function btnDisable() {
   algorithmSelect.disabled = true;
   compareSelect.disabled = true;
   compareMode.disabled = true;
   runSortButton.disabled = true;
   runSortButton.innerHTML = '<span aria-hidden="true">◌</span> Sorting…';
   btnUnsort.disabled = true;
   barCountSlider.disabled = true;
   datasetPreset.disabled = true;
   applyCustomValuesButton.disabled = true;
   customValuesInput.disabled = true;
}

function btnEnable() {
   algorithmSelect.disabled = false;
   compareSelect.disabled = false;
   compareMode.disabled = false;
   runSortButton.disabled = false;
   runSortButton.innerHTML = '<span aria-hidden="true">▶</span> Start sorting';
   btnUnsort.disabled = false;
   barCountSlider.disabled = false;
   datasetPreset.disabled = false;
   applyCustomValuesButton.disabled = false;
   customValuesInput.disabled = false;
   sortStatus.textContent = "READY TO SORT";
   barContainer.setAttribute("aria-label", "Data bars ready to sort");
   updateSortAvailability();
}

function updatePlaybackButtons() {
   var hasRun = Boolean(activeRun);
   pauseButton.disabled = !hasRun;
   stepButton.disabled = !hasRun || !activeRun.paused;
   restartButton.disabled = !lastRunConfig;
   pauseButton.textContent = hasRun && activeRun.paused ? "Resume" : "Pause";
}

function updateElapsed(job, now) {
   var elapsed = job.finishedAt ? job.finishedAt - job.startedAt : now - job.startedAt;
   setMetricText(job, elapsed);
}

function advanceRun() {
   if (!activeRun) return;
   var now = performance.now();
   activeRun.jobs.forEach((job) => {
      if (job.done) return;
      var frame = job.frames[job.index++];
      if (!frame) {
         job.done = true;
         job.finishedAt = now;
         updateElapsed(job, now);
         return;
      }
      job.metrics.comparisons += frame.comparisons;
      job.metrics.swaps += frame.swaps;
      job.metrics.writes += frame.writes;
      if (job.side === null) heightArray = frame.values.slice();
      paintBars(job.barNodes, frame.values, frame.sorted, frame.active);
      playTone(frame.values[frame.active[0] || 0] || 5);
      updateElapsed(job, now);
      if (job.index >= job.frames.length) {
         job.done = true;
         job.finishedAt = now;
         updateElapsed(job, now);
      }
   });
   if (activeRun.jobs.every((job) => job.done)) finishRun();
}

function startTimer() {
   clearInterval(runTimer);
   runTimer = setInterval(advanceRun, animationDelay());
}

function makeJob(name, values, container, side) {
   var barNodes = createBars(container, values.length);
   if (container === barContainer) bars = barNodes;
   paintBars(barNodes, values);
   var now = performance.now();
   return {
      name: name,
      frames: createFrames(name, values),
      index: 0,
      barNodes: barNodes,
      side: side || null,
      metrics: { comparisons: 0, swaps: 0, writes: 0 },
      startedAt: now,
      finishedAt: null,
      done: false
   };
}

function startRun(config) {
   clearInterval(runTimer);
   resetMetricDisplays();
   var initialValues = config.values.slice();
   heightArray = initialValues.slice();
   var jobs = [makeJob(config.primary, initialValues, config.compare ? compareLeftBars : barContainer, config.compare ? "left" : null)];
   if (config.compare) jobs.push(makeJob(config.secondary, initialValues, compareRightBars, "right"));
   activeRun = { jobs: jobs, paused: false, compare: config.compare };
   lastRunConfig = { primary: config.primary, secondary: config.secondary, compare: config.compare, values: initialValues };
   visualPanel.classList.toggle("compare-active", config.compare);
   compareBoard.hidden = !config.compare;
   if (config.compare) {
      document.querySelector("#compare-left-name").textContent = algorithmInfo[config.primary].name;
      document.querySelector("#compare-right-name").textContent = algorithmInfo[config.secondary].name;
   }
   sortStatus.textContent = config.compare ? "COMPARING ALGORITHMS" : `SORTING · ${algorithmInfo[config.primary].name.toUpperCase()}`;
   btnDisable();
   pauseButton.disabled = false;
   stepButton.disabled = true;
   restartButton.disabled = false;
   pauseButton.textContent = "Pause";
   jobs.forEach((job) => updateElapsed(job, job.startedAt));
   startTimer();
}

function finishRun() {
   var wasComparison = activeRun.compare;
   clearInterval(runTimer);
   runTimer = null;
   activeRun = null;
   btnEnable();
   sortStatus.textContent = "SORT COMPLETE";
   barContainer.setAttribute("aria-label", wasComparison ? "Original input data bars" : "Sorted data bars");
   updatePlaybackButtons();
}

function runSelectedAlgorithm() {
   var config = {
      primary: algorithmSelect.value,
      secondary: compareSelect.value,
      compare: compareMode.checked,
      values: heightArray.slice()
   };
   startRun(config);
}

function updateCustomValues() {
   var raw = customValuesInput.value.trim();
   var parts = raw.split(/[\s,]+/).filter(Boolean);
   var values = parts.map(Number);
   if (values.length < 5 || values.length > 60 || values.some((value) => !Number.isInteger(value) || value < 5 || value > 39)) {
      customValuesMessage.textContent = "Enter 5–60 whole numbers, each from 5 to 39.";
      customValuesMessage.classList.add("is-error");
      return;
   }
   customValues = values.slice();
   datasetPreset.value = "custom";
   barCountSlider.value = String(values.length);
   barCountValue.value = String(values.length);
   bars = createBars(barContainer, values.length);
   barCountMeta.textContent = `${values.length} ELEMENTS`;
   arraySize.textContent = `${values.length} items`;
   heightArray = values.slice();
   customValuesMessage.textContent = "Custom values applied.";
   customValuesMessage.classList.remove("is-error");
   presetDescription.textContent = "Your own values, ready to sort.";
   paintBars(bars, heightArray);
   resetMetricDisplays();
   lastRunConfig = null;
   updatePlaybackButtons();
   updateComparePreview();
   btnEnable();
}

function initialize() {
   bars = createBars(barContainer, Number(barCountSlider.value));
   heightArray = makePresetValues(datasetPreset.value, bars.length);
   paintBars(bars, heightArray);
   barCountMeta.textContent = `${bars.length} ELEMENTS`;
   arraySize.textContent = `${bars.length} items`;
   updateAlgorithmGuide();
   btnEnable();
}

algorithmSelect.addEventListener("change", () => {
   updateAlgorithmGuide();
   updateComparePreview();
   updateSortAvailability();
});

compareMode.addEventListener("change", () => {
   comparePicker.hidden = !compareMode.checked;
   visualPanel.classList.toggle("compare-active", compareMode.checked);
   compareBoard.hidden = !compareMode.checked;
   if (!compareMode.checked) {
      paintBars(bars, heightArray, isArraySorted(heightArray) ? heightArray.map((_, index) => index) : []);
   }
   updateComparePreview();
   updateSortAvailability();
});

compareSelect.addEventListener("change", () => {
   updateComparePreview();
   updateSortAvailability();
});

runSortButton.addEventListener("click", runSelectedAlgorithm);

pauseButton.addEventListener("click", () => {
   if (!activeRun) return;
   activeRun.paused = !activeRun.paused;
   if (activeRun.paused) clearInterval(runTimer);
   else startTimer();
   updatePlaybackButtons();
});

stepButton.addEventListener("click", () => {
   if (activeRun && activeRun.paused) advanceRun();
   updatePlaybackButtons();
});

restartButton.addEventListener("click", () => {
   if (!lastRunConfig) return;
   clearInterval(runTimer);
   runTimer = null;
   activeRun = null;
   heightArray = lastRunConfig.values.slice();
   bars = createBars(barContainer, heightArray.length);
   paintBars(bars, heightArray);
   visualPanel.classList.toggle("compare-active", lastRunConfig.compare);
   compareBoard.hidden = !lastRunConfig.compare;
   if (lastRunConfig.compare) updateComparePreview();
   resetMetricDisplays();
   barContainer.setAttribute("aria-label", "Data bars ready to sort");
   btnEnable();
   updatePlaybackButtons();
});

speedSlider.addEventListener("input", () => {
   speedValue.value = `${speedSlider.value}%`;
   if (activeRun && !activeRun.paused) startTimer();
});

document.querySelectorAll(".speed-presets button").forEach((button) => {
   button.addEventListener("click", () => {
      speedSlider.value = button.dataset.speed;
      speedSlider.dispatchEvent(new Event("input", { bubbles: true }));
   });
});

soundToggle.addEventListener("click", () => {
   soundEnabled = !soundEnabled;
   soundToggle.setAttribute("aria-pressed", String(soundEnabled));
   soundToggle.setAttribute("aria-label", soundEnabled ? "Turn sound off" : "Turn sound on");
   soundLabel.textContent = soundEnabled ? "Sound on" : "Sound off";
});

themeToggle.addEventListener("click", () => {
   var nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
   applyTheme(nextTheme);
   try { localStorage.setItem("sortlab-theme", nextTheme); } catch (error) { /* Theme remains available without storage. */ }
});

try { applyTheme(localStorage.getItem("sortlab-theme") === "dark" ? "dark" : "light"); }
catch (error) { applyTheme("light"); }

barCountSlider.addEventListener("input", () => setBarCount(Number(barCountSlider.value)));

datasetPreset.addEventListener("change", () => {
   if (datasetPreset.value === "custom") {
      customValues = heightArray.slice();
      customValuesInput.value = customValues.join(", ");
      presetDescription.textContent = "Edit the values below, then apply your list.";
      updateSortAvailability();
      return;
   }
   customValuesMessage.textContent = "";
   applyPreset(datasetPreset.value);
});

applyCustomValuesButton.addEventListener("click", updateCustomValues);

btnUnsort.addEventListener("click", () => {
   datasetPreset.value = "random";
   customValues = null;
   customValuesMessage.textContent = "";
   applyPreset("random");
});

compareBoard.hidden = true;
comparePicker.hidden = true;
initialize();
