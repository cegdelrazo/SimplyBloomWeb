// utils/dates.js
export function todayStrLocal() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export const dateToStr = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

export const isHoliday = (yyyyMmDd, list) => list.includes(yyyyMmDd);

export const nextBusinessDay = (yyyyMmDd, holidays = []) => {
    const d = new Date(yyyyMmDd + "T00:00:00");
    do {
        d.setDate(d.getDate() + 1);
    } while (d.getDay() === 0 || isHoliday(dateToStr(d), holidays));
    return dateToStr(d);
};

export const tomorrowStrLocal = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const cutoffHourForCity = (cityName) => (cityName === "CDMX" ? 16 : 15);

export const shouldWarnLateForTomorrow = (selectedCityObj, selectedDateStr, tomorrowStr) => {
    if (!selectedCityObj || !selectedDateStr) return false;
    const now = new Date();
    const hour = now.getHours();
    const cutoff = cutoffHourForCity(selectedCityObj.city);
    return selectedDateStr === tomorrowStr && hour >= cutoff;
};