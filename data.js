// data.js
import { firstSemSchedule } from './schedules/ioa-bsa-1-1stsem-year-1.js';
import { spring2026Schedule } from './schedules/eng-ee-1-spring-2026.js';
import { dhmfirstsemschedule } from './schedules/cthm-dhm-1-1stsem-year-1.js'; 
import { bsbamYear3FirstSemSchedule } from './schedules/bsba-m-d-1stsem-year-3.js';
import { bsbammfirstsemsched } from './schedules/bsba-mm-1-c-1stsem-year-1.js';

// Add new schedules imports here as you create new files in the schedules/ folder
// import { yourNewSchedule } from './schedules/your-new-schedule-file.js';

export const allSchedules = [
    firstSemSchedule,
    spring2026Schedule,
    dhmfirstsemschedule,
    bsbamYear3FirstSemSchedule,
    bsbammfirstsemsched,
    // Add new schedule objects here
    // yourNewSchedule,
];



