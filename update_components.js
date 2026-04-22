const fs = require('fs');

function updateFile(path, replaceFn) {
  let content = fs.readFileSync(path, 'utf8');
  content = replaceFn(content);
  fs.writeFileSync(path, content, 'utf8');
}

// 1. GroupDetailPage.jsx
updateFile('/home/basman/Personal/osusu/client/src/pages/GroupDetailPage.jsx', (content) => {
  // Update header and overview
  let newContent = content.replace(
    /<div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between">([\s\S]*?)<div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">/m,
    `<div className="px-4 py-6 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{group.name}</h1>
              <Badge status={group.status} />
            </div>
            {isOrganiser && group.status === 'FORMING' && (
              <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-1.5 border border-gray-200">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Invite Code</span>
                <span className="text-sm font-mono font-bold text-gray-900">{group.invite_code}</span>
                <button onClick={copyToClipboard} className="ml-2 text-gray-400 hover:text-green-600 focus:outline-none transition-colors" title="Copy code">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-y-2 text-sm text-gray-600">
            <span className="capitalize font-medium">{group.frequency.toLowerCase()}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span className="font-medium text-gray-900">{formatCurrency(group.contribution_amount)}</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>{members.length} of {group.max_members} members</span>
            <span className="mx-2 text-gray-300">|</span>
            <span>Started {formatDate(group.start_date)}</span>
          </div>
        </div>
        
        {/* Removed old stats grid */}
        
        {/* Tabs Navigation */}`
  );

  // Update Overview Start Group section and members list
  newContent = newContent.replace(
    /\{group\.status === 'FORMING' && \([\s\S]*?<div className="bg-white shadow rounded-lg overflow-hidden mb-8">/,
    `{group.status === 'FORMING' && isOrganiser && (
            <div className="mb-8">
              <div className="bg-green-50 rounded-xl p-6 border border-green-100 flex flex-col sm:flex-row items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-bold text-green-900 mb-1">Ready to start the group?</h3>
                  <p className="text-sm text-green-700">You have {members.length} of {group.max_members} members. Starting locks the list and creates the schedule.</p>
                  
                  <div className="mt-3 flex items-center">
                    <div className="w-48 bg-green-200 rounded-full h-2.5 mr-3">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: \`\${(members.length / group.max_members) * 100}%\` }}></div>
                    </div>
                    <span className="text-xs font-semibold text-green-800">{members.length}/{group.max_members} joined</span>
                  </div>
                </div>
                
                <Button 
                  variant="primary" 
                  onClick={handleStartGroup} 
                  loading={startLoading}
                  disabled={members.length < 2}
                  className="w-full sm:w-auto px-8 py-3 text-base shadow-sm"
                >
                  Start Group
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">`
  );

  // Update Members list to show initials avatar and better table format
  newContent = newContent.replace(
    /<ul className="divide-y divide-gray-200">[\s\S]*?<\/ul>/,
    `<div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Position</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => {
                    const isCurrentRecipient = currentCycle?.payout_user_id === member.user.id;
                    const initials = member.user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    
                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                              {initials}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                {member.user.fullName}
                                {member.user.id === user.id && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">You</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{member.user.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className={\`inline-flex h-8 w-8 rounded-full items-center justify-center text-sm font-bold \${isCurrentRecipient ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 border border-gray-200'}\`}>
                            {member.payout_order}
                          </div>
                          {isCurrentRecipient && <div className="text-xs text-green-600 mt-1 font-medium">Current</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {formatDate(member.joined_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>`
  );

  return newContent;
});

// 2. ContributionsTab.jsx
updateFile('/home/basman/Personal/osusu/client/src/components/groups/ContributionsTab.jsx', (content) => {
  // Update Cycle Selector to be Pill Tab Row (<= 6) or Dropdown
  let newContent = content.replace(
    /<div className="bg-white shadow rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between">[\s\S]*?<\/div>\s*<\/div>/,
    `<div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 md:mb-0">Cycle Contributions</h2>
          {cycleData && (
            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
               <div className="text-sm text-gray-500">Recipient:</div>
               <div className="flex items-center">
                 <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold mr-2">
                    {cycleData.payoutUser?.full_name?.charAt(0)}
                 </div>
                 <div className="text-sm font-bold text-gray-900">{cycleData.payoutUser?.full_name}</div>
               </div>
            </div>
          )}
        </div>
        
        {cycles.length <= 6 ? (
          <div className="flex flex-wrap gap-2">
            {cycles.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCycleId(c.id)}
                className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${selectedCycleId === c.id ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
              >
                Cycle {c.cycle_number}
              </button>
            ))}
          </div>
        ) : (
          <select 
            className="block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md shadow-sm border"
            value={selectedCycleId}
            onChange={(e) => setSelectedCycleId(e.target.value)}
          >
            {cycles.map(c => (
              <option key={c.id} value={c.id}>
                Cycle {c.cycle_number} — Due {formatDate(c.due_date)} {c.status === 'PAID_OUT' ? '(Completed)' : ''}
              </option>
            ))}
          </select>
        )}
      </div>`
  );

  // Update Collection Progress to circular indicator
  newContent = newContent.replace(
    /<div className="px-6 py-5 border-b border-gray-200">[\s\S]*?<\/div>\s*<ul/,
    `<div className="px-6 py-8 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="relative w-24 h-24 mr-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="text-green-500"
                    strokeDasharray={\`\${progressPercent}, 100\`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-xl font-bold text-gray-900">{cycleData.contributions?.length || 0}</span>
                  <span className="text-xs text-gray-500 block">/ {members.length}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className="text-xl font-bold text-gray-900">Collection Status</h3>
                  <Badge status={cycleData.status} />
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-green-700">{formatCurrency(cycleData.total_collected)}</span> collected of <span className="font-medium text-gray-900">{formatCurrency(cycleData.total_expected)}</span>
                </div>
              </div>
            </div>

            {isOrganiser && !isCycleComplete && cycleData.status === 'COLLECTING' && progressPercent === 100 && (
               <Button variant="primary" onClick={handleCompleteCycle} loading={actionLoading} className="w-full md:w-auto px-6 py-3">
                 Finalise & Payout
               </Button>
            )}
          </div>
          
          <ul`
  );

  // Member Rows Update
  newContent = newContent.replace(
    /<li key=\{member\.id\} className=\{`px-6 py-4 flex items-center justify-between \$\{hasPaid \? 'bg-green-50' : 'bg-white'\}`\}>[\s\S]*?<\/li>/g,
    (match) => {
      // Need a function replacement here because we need member variable references. Let's just do a blanket regex replace of the content of the map.
      return match;
    }
  );

  newContent = newContent.replace(
    /\{members\.map\(member => \{[\s\S]*?return \([\s\S]*?<\/li>\);\s*\}\)\}/,
    `{members.map(member => {
              const contribution = cycleData.contributions?.find(c => c.user_id === member.user.id);
              const hasPaid = !!contribution;
              const initials = member.user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

              return (
                <li key={member.id} className={\`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors \${hasPaid ? 'bg-green-50/30' : 'bg-white'}\`}>
                  <div className="flex items-center mb-4 sm:mb-0">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm mr-4">
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{member.user.fullName}</div>
                      <div className="text-xs text-gray-500">
                        {hasPaid ? (
                           <span className="flex items-center text-green-600 mt-0.5">
                             <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                             Paid {formatCurrency(contribution.amount)}
                           </span>
                        ) : (
                           <span className="mt-0.5 inline-block">Expected: {formatCurrency(group.contribution_amount)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-4 w-full sm:w-auto">
                    {!isOrganiser ? (
                       hasPaid ? <Badge status="PAID" /> : <Badge status="UNPAID" />
                    ) : (
                      <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                        {hasPaid && <Badge status="PAID" />}
                        {!hasPaid && <Badge status="UNPAID" />}
                        
                        {!isCycleComplete && (
                          !hasPaid ? (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => {
                                setSelectedMember(member.user);
                                setIsModalOpen(true);
                              }}
                              className="w-full sm:w-auto"
                            >
                              Mark Paid
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
                              onClick={() => handleDeleteContribution(contribution.id)}
                            >
                               Undo
                            </Button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}`
  );

  return newContent;
});

// 3. ScheduleTab.jsx
updateFile('/home/basman/Personal/osusu/client/src/components/groups/ScheduleTab.jsx', (content) => {
  let newContent = content.replace(
    /<div className="overflow-x-auto">[\s\S]*?<\/div>/,
    `<div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cycle</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pot Size</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Collected</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cycles.map((cycle) => {
              const isCollecting = cycle.status === 'COLLECTING';
              const isPaidOut = cycle.status === 'PAID_OUT';
              
              let rowClass = "hover:bg-gray-50 transition-colors";
              if (isCollecting) rowClass += " bg-amber-50/40";
              if (isPaidOut) rowClass += " bg-green-50/40";
              
              const initials = cycle.payoutUser?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

              return (
                <tr key={cycle.id} className={rowClass}>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={\`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold \${isCollecting ? 'bg-amber-100 text-amber-800' : isPaidOut ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}\`}>
                        {cycle.cycle_number}
                      </div>
                      {isCollecting && <span className="ml-2 text-xs font-bold text-amber-600 uppercase tracking-wide">Current</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {formatDate(cycle.due_date)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{cycle.payoutUser.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                    {formatCurrency(cycle.total_expected)}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm">
                    <span className={cycle.total_collected === cycle.total_expected ? "text-green-600 font-bold" : "text-gray-600 font-medium"}>
                      {formatCurrency(cycle.total_collected)}
                    </span>
                    <span className="text-gray-400 text-xs ml-1">/ {formatCurrency(cycle.total_expected)}</span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <Badge status={cycle.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>`
  );

  return newContent;
});

