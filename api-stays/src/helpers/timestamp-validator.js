function isValidTimestamp(_timestamp) {
    const newTimestamp = new Date(_timestamp).getTime();
    return isNumeric(newTimestamp);
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isFutureDate(target) {
    target = new Date(target).getTime()
    const now = new Date().getTime();
    return target > now;
}

function isPastDate(target) {
    const past = new Date("2021-01-01 00:00:00").getTime();
    return target < past;
}

module.exports = {
    isValidTimestamp,
    isNumeric,
    isFutureDate,
    isPastDate
}
