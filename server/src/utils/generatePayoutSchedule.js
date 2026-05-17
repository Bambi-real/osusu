function addInterval(date, frequency, startDay) {
  const d = new Date(date);
  if (frequency === 'DAILY')   d.setDate(d.getDate() + 1);
  if (frequency === 'WEEKLY')  d.setDate(d.getDate() + 7);
  if (frequency === 'MONTHLY') {
    const targetMonth = d.getMonth() + 1;
    const lastDay = new Date(d.getFullYear(), targetMonth + 1, 0).getDate();
    d.setMonth(targetMonth, Math.min(startDay, lastDay));
  }
  return d;
}

function generatePayoutSchedule(group, members) {
  const sorted = [...members].sort((a, b) => a.payout_order - b.payout_order);
  const cycles = [];
  
  const startDate = new Date(group.start_date);
  const startDay = startDate.getDate();
  let cycleDate = new Date(startDate);

  for (let i = 0; i < sorted.length; i++) {
    cycles.push({
      group_id:        group.id,
      cycle_number:    i + 1,
      due_date:        cycleDate.toISOString(),
      payout_user_id:  sorted[i].user_id,
      total_expected:  group.contribution_amount * sorted.length,
      total_collected: 0,
      status:          i === 0 ? 'COLLECTING' : 'PENDING',
    });
    cycleDate = addInterval(cycleDate, group.frequency, startDay);
  }

  return cycles;
}

module.exports = { generatePayoutSchedule };
