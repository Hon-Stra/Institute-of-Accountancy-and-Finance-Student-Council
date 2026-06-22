// script.js
// This file contains the main application logic for the College Schedule App.
// It handles UI interactions, schedule rendering, and mode switching.

// Import the allSchedules data from data.js.
// This allows for modular organization of schedule data.
import { allSchedules } from './data.js';

// Define the base path for GitHub Pages if applicable
// IMPORTANT: Replace 'College-Schedule' with your actual repository name if it's different.
const BASE_PATH = '/College-Schedule'; // Your GitHub repository name

/**
 * Helper function to convert a time string (e.g., "09:00 AM") to minutes from midnight.
 * This is useful for sorting courses chronologically.
 * @param {string} timeStr - The time string in "HH:MM AM/PM" format.
 * @returns {number} The total minutes from midnight.
 */
function timeToMinutes(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12; // Convert PM hours (except 12 PM) to 24-hour format
    if (period === 'AM' && hours === 12) hours = 0; // Convert 12 AM (midnight) to 0 hours
    return hours * 60 + minutes;
}

// Get references to key DOM elements
const mainScheduleTitleLine1 = document.getElementById('main-schedule-title-line1');
const mainScheduleTitleLine2 = document.getElementById('main-schedule-title-line2');
const scheduleShortIdButton = document.getElementById('schedule-short-id-button');
const schoolLogo = document.getElementById('school-logo'); // Although not directly manipulated by JS logic here, it's a UI element
const scheduleDisplay = document.getElementById('schedule-display');
const daySelector = document.getElementById('day-selector');
const toggleModeBtn = document.getElementById('toggle-mode-btn');

// Modal elements for schedule selection
const scheduleModalOverlay = document.getElementById('scheduleModalOverlay');
const closeScheduleModalBtn = document.getElementById('close-schedule-modal');
const scheduleSearchInput = document.getElementById('schedule-search-input');
const scheduleList = document.getElementById('schedule-list');

// Application state variables
let currentScheduleId = ''; // Stores the ID of the currently selected schedule
let currentDayIndex = 0;    // Stores the index of the currently selected day in simplified mode
let currentMode = 'simplified'; // Stores the current display mode ('simplified' or 'table')

// Map to store unique colors for each course name for consistent coloring across the schedule
const courseColors = new Map();
const availableColors = [
    '#a7f3d0', '#bfdbfe', '#fecaca', '#fed7aa', '#dbeafe', // Light pastels
    '#fef08a', '#e9d5ff', '#bae6fd', '#fbcfe8', '#ccfbf1'
];
let colorIndex = 0; // Index to cycle through availableColors

/**
 * Assigns a consistent color to a course name.
 * If the course name already has a color, it returns that color.
 * Otherwise, it assigns a new color from the availableColors array.
 * @param {string} courseName - The name of the course.
 * @returns {string} The hexadecimal color code for the course.
 */
function getCourseColor(courseName) {
    if (!courseColors.has(courseName)) {
        courseColors.set(courseName, availableColors[colorIndex % availableColors.length]);
        colorIndex++; // Move to the next color for the next unique course
    }
    return courseColors.get(courseName);
}

/**
 * Populates the schedule list in the modal with available schedules.
 * Filters schedules based on a search term if provided.
 * @param {Array} schedulesToDisplay - The array of schedules to display (filtered by search).
 */
function populateScheduleList(schedulesToDisplay) {
    scheduleList.innerHTML = ''; // Clear existing list items
    if (schedulesToDisplay.length === 0) {
        scheduleList.innerHTML = '<li class="text-center text-gray-500 py-4">No schedules found.</li>';
        return;
    }
    schedulesToDisplay.forEach(schedule => {
        const listItem = document.createElement('li');
        listItem.classList.add('schedule-list-item');
        listItem.dataset.scheduleId = schedule.id; // Store schedule ID for easy lookup
        listItem.innerHTML = `
            <strong>${schedule.displayTitleLine1}</strong>
            <span>${schedule.displayTitleLine2}</span>
        `;
        // Add click listener to select a schedule from the modal
        listItem.addEventListener('click', () => {
            currentScheduleId = schedule.id;
            saveScheduleToLocalStorage(currentScheduleId); // Save the new schedule ID
            closeScheduleModal(); // Close the modal
            renderCurrentModeSchedule(); // Render the newly selected schedule
        });
        scheduleList.appendChild(listItem);
    });
}

/**
 * Opens the schedule selection modal.
 */
function openScheduleModal() {
    populateScheduleList(allSchedules); // Populate with all schedules initially
    scheduleSearchInput.value = ''; // Clear any previous search input
    scheduleModalOverlay.classList.add('show'); // Show the modal overlay
}

/**
 * Closes the schedule selection modal.
 */
function closeScheduleModal() {
    scheduleModalOverlay.classList.remove('show'); // Hide the modal overlay
}

/**
 * Renders the schedule in Simplified (Day-by-Day Card) Mode.
 * Displays courses for a specific day as individual cards.
 * @param {string} scheduleId - The ID of the schedule to render.
 * @param {number} selectedDayIdx - The index of the day to display in detail.
 */
function renderSimplifiedSchedule(scheduleId, selectedDayIdx) {
    const selectedSchedule = allSchedules.find(s => s.id === scheduleId);

    // Handle case where schedule is not found
    if (!selectedSchedule) {
        scheduleDisplay.innerHTML = '<p class="text-center text-red-500">Schedule not found.</p>';
        mainScheduleTitleLine1.textContent = 'No Schedule Selected';
        mainScheduleTitleLine2.textContent = '';
        scheduleShortIdButton.textContent = '';
        daySelector.innerHTML = '';
        daySelector.classList.add('hidden'); // Hide day selector if no schedule
        return;
    }

    // Ensure selectedDayIdx is within valid bounds
    if (selectedDayIdx < 0) selectedDayIdx = 0;
    if (selectedDayIdx >= selectedSchedule.days.length) selectedDayIdx = selectedSchedule.days.length - 1;
    currentDayIndex = selectedDayIdx; // Update global currentDayIndex

    // Update main display titles and short ID button
    mainScheduleTitleLine1.textContent = selectedSchedule.displayTitleLine1;
    mainScheduleTitleLine2.textContent = selectedSchedule.displayTitleLine2;
    scheduleShortIdButton.textContent = selectedSchedule.shortId;

    // Render day selection buttons
    daySelector.innerHTML = ''; // Clear existing day buttons
    daySelector.classList.remove('hidden'); // Ensure day selector is visible
    selectedSchedule.days.forEach((day, index) => {
        const dayButton = document.createElement('button');
        dayButton.classList.add('day-button');
        dayButton.textContent = day.substring(0, 3); // Display first 3 letters of the day
        dayButton.dataset.dayIndex = index;

        // Highlight the active day button
        if (index === currentDayIndex) {
            dayButton.classList.add('active');
        }

        dayButton.addEventListener('click', () => {
            renderSimplifiedSchedule(scheduleId, index);
            // Auto-scroll to the schedule display area when a day is clicked
            // This ensures the user sees the updated schedule content immediately.
            scheduleDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        daySelector.appendChild(dayButton);
    });

    const dayName = selectedSchedule.days[currentDayIndex];
    const coursesForDay = selectedSchedule.courses
        .filter(course => course.day === dayName)
        .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)); // Sort by start time

    let dayContentHTML = '';
    if (coursesForDay.length === 0) {
        dayContentHTML = `<p class="text-center text-gray-500 py-8">No classes scheduled for ${dayName}. Enjoy your free time!</p>`;
    } else {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];

        coursesForDay.forEach(course => {
            const courseStartMinutes = timeToMinutes(course.time);
            const courseEndMinutes = timeToMinutes(course.endTime);
            // Determine if the course is currently active or upcoming today
            const isCurrentCourse = (
                dayName === todayDayName &&
                currentMinutes >= courseStartMinutes &&
                currentMinutes < courseEndMinutes
            );
            const isUpcomingCourse = (
                dayName === todayDayName &&
                currentMinutes < courseStartMinutes &&
                !isCurrentCourse // Ensure it's not already the current course
            );

            let highlightClass = '';
            if (isCurrentCourse || isUpcomingCourse) {
                highlightClass = 'current-course-highlight'; // Apply highlight class
            }

            const courseColor = getCourseColor(course.name); // Get consistent color for the course

            // Build HTML for each course card
            dayContentHTML += `
                <div class="course-card ${highlightClass}" style="background-color: ${courseColor};">
                    <div class="course-card-header">${course.name}</div>
                    <div class="course-card-details">
                        <p>${course.time} - ${course.endTime}</p>
                        <p>Room: ${course.room}</p>
                    </div>
                </div>
            `;
        });
    }
    scheduleDisplay.innerHTML = dayContentHTML; // Update the schedule display area
    scheduleDisplay.classList.add('schedule-day-container'); // Apply simplified mode specific styles
    scheduleDisplay.classList.remove('schedule-table', 'overflow-x-auto'); // Remove table mode specific styles
}

/**
 * Renders the schedule in Table Mode.
 * Displays all courses in a weekly table format.
 * @param {string} scheduleId - The ID of the schedule to render.
 */
function renderTableSchedule(scheduleId) {
    const selectedSchedule = allSchedules.find(s => s.id === scheduleId);

    // Handle case where schedule is not found
    if (!selectedSchedule) {
        scheduleDisplay.innerHTML = '<p class="text-center text-red-500">Schedule not found.</p>';
        mainScheduleTitleLine1.textContent = 'No Schedule Selected';
        mainScheduleTitleLine2.textContent = '';
        scheduleShortIdButton.textContent = '';
        daySelector.innerHTML = '';
        daySelector.classList.add('hidden'); // Ensure day selector is hidden
        return;
    }

    // Update main display titles and short ID button
    mainScheduleTitleLine1.textContent = selectedSchedule.displayTitleLine1;
    mainScheduleTitleLine2.textContent = selectedSchedule.displayTitleLine2;
    scheduleShortIdButton.textContent = selectedSchedule.shortId;
    daySelector.classList.add('hidden'); // Bug fix: Ensure day selector is hidden in table mode

    const allUniqueTimesForSchedule = new Set();
    selectedSchedule.courses.forEach(course => {
        allUniqueTimesForSchedule.add(course.time);
        allUniqueTimesForSchedule.add(course.endTime);
    });
    const sortedUniqueTimesForSchedule = Array.from(allUniqueTimesForSchedule).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

    const scheduleTimeSlots = sortedUniqueTimesForSchedule.filter((time, index, arr) => {
        const isCourseStartTime = selectedSchedule.courses.some(course => course.time === time);
        const isFirstTime = (index === 0);
        return isCourseStartTime || isFirstTime;
    });

    if (scheduleTimeSlots.length === 0 && selectedSchedule.courses.length > 0) {
        scheduleTimeSlots.push(...Array.from(new Set(selectedSchedule.courses.map(c => c.time))).sort((a, b) => timeToMinutes(a) - timeToMinutes(b)));
    }

    const bookedCells = Array(scheduleTimeSlots.length).fill(0).map(() => Array(selectedSchedule.days.length).fill(false));

    let tableHTML = `
        <table class="schedule-table">
            <thead>
                <tr>
                    <th class="rounded-tl-lg">Time</th>
    `;
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const dayNamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    selectedSchedule.days.forEach((day, dayIndex) => {
        const isCurrentDay = dayNamesFull.indexOf(day) === currentDayOfWeek;
        tableHTML += `<th class="${isCurrentDay ? 'current-day-table-header' : ''} ${dayIndex === selectedSchedule.days.length - 1 ? 'rounded-tr-lg' : ''}">${day}</th>`;
    });
    tableHTML += `
                </tr>
            </thead>
            <tbody>
    `;

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    scheduleTimeSlots.forEach((time, rowIndex) => {
        const timeSlotMinutes = timeToMinutes(time);
        const isCurrentTimeRow = (timeSlotMinutes <= currentMinutes &&
                                  (rowIndex + 1 < scheduleTimeSlots.length ? timeToMinutes(scheduleTimeSlots[rowIndex + 1]) : Infinity) > currentMinutes);

        tableHTML += `<tr class="${isCurrentTimeRow ? 'current-time-row-table' : ''}"><td data-label="Time">${time}</td>`;

        selectedSchedule.days.forEach((day, colIndex) => {
            if (bookedCells[rowIndex][colIndex]) {
                return;
            }

            const coursesStartingAtSlot = selectedSchedule.courses.filter(c => c.time === time && c.day === day);

            if (coursesStartingAtSlot.length > 0) {
                const course = coursesStartingAtSlot[0];
                const startIdx = scheduleTimeSlots.indexOf(course.time);
                const endIdx = scheduleTimeSlots.indexOf(course.endTime);
                const rowspan = (endIdx !== -1 && startIdx !== -1) ? (endIdx - startIdx) : 1;

                const courseColor = getCourseColor(course.name);

                for (let i = 0; i < rowspan; i++) {
                    if (rowIndex + i < bookedCells.length) {
                        bookedCells[rowIndex + i][colIndex] = true;
                    }
                }

                const isCurrentCellHighlight = (isCurrentTimeRow && dayNamesFull.indexOf(day) === currentDayOfWeek);

                tableHTML += `
                    <td data-label="${day}" rowspan="${rowspan}" class="${isCurrentCellHighlight ? 'current-time-cell-table' : ''}">
                        <div class="table-schedule-cell-content" style="background-color: ${courseColor};">
                            <strong>${course.name}</strong>
                            <span>${course.time} - ${course.endTime}</span>
                            <span>${course.room}</span>
                        </div>
                    </td>
                `;
            } else {
                tableHTML += `<td data-label="${day}"></td>`;
            }
        });
        tableHTML += `</tr>`;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    scheduleDisplay.innerHTML = tableHTML;
    scheduleDisplay.classList.remove('schedule-day-container');
    scheduleDisplay.classList.add('schedule-table', 'overflow-x-auto');
}


/**
 * Renders the schedule based on the currently selected mode ('simplified' or 'table').
 */
function renderCurrentModeSchedule() {
    if (currentMode === 'simplified') {
        const selectedSchedule = allSchedules.find(s => s.id === currentScheduleId);
        const today = new Date();
        const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
        // Try to find today's index, otherwise default to the first day (index 0)
        const todayIdx = selectedSchedule ? selectedSchedule.days.indexOf(todayDayName) : -1;
        renderSimplifiedSchedule(currentScheduleId, todayIdx !== -1 ? todayIdx : 0);
    } else { // 'table' mode
        renderTableSchedule(currentScheduleId);
    }
}

/**
 * Saves the current schedule ID to local storage.
 * @param {string} scheduleId - The ID of the schedule to save.
 */
function saveScheduleToLocalStorage(scheduleId) {
    localStorage.setItem('lastSelectedScheduleId', scheduleId);
}

/**
 * Loads the saved schedule ID from local storage.
 * @returns {string | null} The saved schedule ID, or null if not found.
 */
function loadScheduleFromLocalStorage() {
    return localStorage.getItem('lastSelectedScheduleId');
}

// --- Event Listeners ---

// Event listener for the toggle mode button (SIMPLE MODE / TABLE MODE)
toggleModeBtn.addEventListener('click', () => {
    currentMode = (currentMode === 'simplified') ? 'table' : 'simplified'; // Toggle mode
    toggleModeBtn.textContent = (currentMode === 'simplified') ? 'SIMPLE MODE' : 'TABLE MODE'; // Update button text
    renderCurrentModeSchedule(); // Re-render schedule in the new mode
});

// Event listener for opening the schedule selection modal (via the yellow button)
scheduleShortIdButton.addEventListener('click', openScheduleModal);

// Event listener for closing the schedule selection modal (via the 'x' button)
closeScheduleModalBtn.addEventListener('click', closeScheduleModal);

// Event listener for the search input in the schedule selection modal
scheduleSearchInput.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    // Filter schedules based on various properties
    const filteredSchedules = allSchedules.filter(schedule =>
        schedule.name.toLowerCase().includes(searchTerm) ||
        schedule.displayTitleLine1.toLowerCase().includes(searchTerm) ||
        schedule.displayTitleLine2.toLowerCase().includes(searchTerm) ||
        schedule.shortId.toLowerCase().includes(searchTerm)
    );
    populateScheduleList(filteredSchedules); // Update the modal list with filtered results
});


// --- Initial Application Load Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const savedScheduleId = loadScheduleFromLocalStorage();

    if (allSchedules.length > 0) {
        // If a saved schedule ID exists and is valid, use it. Otherwise, default to the first schedule.
        const scheduleToLoad = allSchedules.find(s => s.id === savedScheduleId);
        if (scheduleToLoad) {
            currentScheduleId = savedScheduleId;
        } else {
            currentScheduleId = allSchedules[0].id; // Fallback to the first schedule
            saveScheduleToLocalStorage(currentScheduleId); // Save the fallback schedule
        }

        toggleModeBtn.textContent = 'SIMPLE MODE'; // Set initial button text
        renderCurrentModeSchedule(); // Render the initial schedule
    } else {
        // Display a message if no schedules are available and disable controls
        scheduleDisplay.innerHTML = '<p class="text-center text-gray-500">No schedules available.</p>';
        mainScheduleTitleLine1.textContent = 'No Schedule Available';
        mainScheduleTitleLine2.textContent = '';
        scheduleShortIdButton.textContent = '';
        daySelector.innerHTML = '';
        daySelector.classList.add('hidden');
        toggleModeBtn.disabled = true;
        scheduleShortIdButton.disabled = true;
    }

    // --- Service Worker Registration for PWA ---
    // This enables offline capabilities and installability.
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Register the service worker with the correct scope for GitHub Pages
            // IMPORTANT: Replace 'College-Schedule' with your actual repository name.
            navigator.serviceWorker.register(`${BASE_PATH}/service-worker.js`, { scope: `${BASE_PATH}/` })
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.error('ServiceWorker registration failed: ', err);
                });
        });
    }
});