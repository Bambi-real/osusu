function addInterval(date, frequency) {
  const d = new Date(date);
  if (frequency === 'WEEKLY') {
    d.setDate(d.getDate() + 7);
  } else if (frequency === 'MONTHLY') {
    const currentMonth = d.getMonth();
    d.setMonth(currentMonth + 1);
    if (d.getMonth() !== (currentMonth + 1) % 12) {
      d.setDate(0); // clamp to last day of previous month
    }
  }
  return d;
}

function generatePayoutSchedule(group, members) {
  const sorted = [...members].sort((a, b) => a.payout_order - b.payout_order);
  const cycles = [];
  
  // Create based on start date. Past or present.
  let cycleDate = new Date(group.start_date);

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
    cycleDate = addInterval(cycleDate, group.frequency);
  }

  return cycles;
}

module.exports = { generatePayoutSchedule };
