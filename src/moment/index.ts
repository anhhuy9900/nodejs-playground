import moment from 'moment-timezone';
import { showTimeInfo, showTimeTZ } from './example';
import { showExTimeInfo } from './example-2';

moment.tz.setDefault('America/Los_Angeles');

showTimeInfo();
showTimeTZ();
showExTimeInfo();
