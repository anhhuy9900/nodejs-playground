import moment from 'moment-timezone';

function showExTimeInfo() {
  const momentVal = moment().format('YYYY-MM-DD HH:mm:ss');
  console.log('\n------------------------------------');
  console.log('LOG: ', 'EXAMPLE2 -> showExTimeInfo - momentVal', momentVal);
  console.log('------------------------------------');
}

export { showExTimeInfo };
