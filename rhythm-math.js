export function calculateRhythm(frequency,duration){
 const count=Number(frequency),minutes=Number(duration);
 if(!Number.isInteger(count)||count<1||count>5||![30,45,60].includes(minutes))throw new RangeError('Invalid rhythm selection');
 const patterns={1:[2],2:[1,4],3:[0,2,4],4:[0,2,4,6],5:[0,1,3,4,6]};
 return {frequency:count,duration:minutes,weeklyMinutes:count*minutes,fourWeekSessions:count*4,angle:count/5*300,days:patterns[count]};
}
