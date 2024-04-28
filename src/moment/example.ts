import moment from "moment-timezone";

function showTimeInfo() {
    const momentVal = moment().format('YYYY-MM-DD HH:mm:ss')
    console.log("\n------------------------------------");
    console.log('LOG: ', 'showTimeInfo - momentVal', momentVal);
    console.log("------------------------------------");
}

function showTimeTZ() {
    const momentVal = moment().tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD HH:mm:ss')
    console.log("\n------------------------------------");
    console.log('LOG: ', 'showTimeTZ - momentVal', momentVal);
    console.log("------------------------------------");
}

export { showTimeInfo, showTimeTZ }