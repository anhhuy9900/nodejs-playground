import scheduler from 'node-schedule';
import moment from "moment-timezone";

function runSchedulerEveryMinute() {
    console.log('========= runSchedulerEveryMinute ============== ')
    let time = 0;
    const job = scheduler.scheduleJob('*/1 * * * *', function(){
        console.log("\n\n------------------------------------");
        console.log('LOG: ', 'runSchedulerEveryMinute: ', "The action will run very minutes once!");
        console.log("------------------------------------");
    });
}
// runSchedulerEveryMinute();

function cancelScheduleJob() {
    console.log('========= cancelScheduleJob ============== ')
    let time = 0;
    const job = scheduler.scheduleJob('*/1 * * * *', function(){
        console.log("\n------------------------------------");
        console.log('LOG: ', 'cancelScheduleJob: ', "The action will run very minutes once!");
        time++;

        console.log('LOG: ', 'cancelScheduleJob: time: ', time);

        if (time > 3) {
            job.cancel();
        }

        if (scheduler.scheduledJobs[job.name]) {
            console.log('LOG: ', 'cancelScheduleJob: ', "The job is running");
        } else {
            console.log('LOG: ', 'cancelScheduleJob: ', "The job has stopped");
        }
        console.log("------------------------------------");
    });
}
// cancelScheduleJob();

function runJobSpecificSchedule() {
    console.log('========= runJobSpecificSchedule ============== ');
    const startTime = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
    const endTime = moment().tz('Asia/Ho_Chi_Minh').add(3, 'minutes').format('YYYY-MM-DD HH:mm:ss')
    console.log("runJobSpecificSchedule: startTime: ", startTime, ", endTime: ", endTime);
    const job = scheduler.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * *' }, function(){
        console.log("\n------------------------------------");
        console.log('LOG: ', 'runJobSpecificSchedule: ', "The action will run very minutes once, at", moment().format('YYYY-MM-DD HH:mm:ss'));
        console.log("------------------------------------");
    });
}
runJobSpecificSchedule();
