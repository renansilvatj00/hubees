function isValidTimestamp(_timestamp) {
    const newTimestamp = new Date(_timestamp).getTime();
    return isNumeric(newTimestamp);
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isfutureDate(target) {
    const now = new Date().getTime();
    return target > now;
}

function verifyNewDates(newEntryTime, newOutDate) {

    return newOutDate < newEntryTime;
}
  
  module.exports = {
    isValidTimestamp,
    isNumeric,
    isfutureDate,
    verifyNewDates
  }
  