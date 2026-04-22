const fs = require('fs');

// Fix ContributionsTab.jsx
let cContent = fs.readFileSync('/home/basman/Personal/osusu/client/src/components/groups/ContributionsTab.jsx', 'utf8');
cContent = cContent.replace(
`          </select>
        )}
      </div>
        )}
      </div>`,
`          </select>
        )}
      </div>`
);
fs.writeFileSync('/home/basman/Personal/osusu/client/src/components/groups/ContributionsTab.jsx', cContent, 'utf8');

// Fix ScheduleTab.jsx
let sContent = fs.readFileSync('/home/basman/Personal/osusu/client/src/components/groups/ScheduleTab.jsx', 'utf8');
sContent = sContent.replace(
/      <\/div>[\s\S]*?<\/table>\s*<\/div>\s*<\/div>/,
`      </div>
    </div>`
);
fs.writeFileSync('/home/basman/Personal/osusu/client/src/components/groups/ScheduleTab.jsx', sContent, 'utf8');
