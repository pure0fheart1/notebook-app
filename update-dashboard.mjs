import fs from 'fs';

const filePath = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add import
if (!content.includes("import { useStatistics }")) {
  content = content.replace(
    "import { ConfirmDialog } from '@/components/ConfirmDialog'",
    `import { useStatistics } from '@/hooks/useStatistics'\nimport { ConfirmDialog } from '@/components/ConfirmDialog'`
  );
}

// Add hook call
if (!content.includes("useStatistics()")) {
  content = content.replace(
    "  } = useNotebooks()",
    `  } = useNotebooks()\n  const { statistics, isLoading: statsLoading } = useStatistics()`
  );
}

// Replace notebook count
content = content.replace(
  '<div className="text-4xl font-bold text-gradient">{notebooks.length}</div>',
  `<div className="text-4xl font-bold text-gradient">
                {statsLoading ? '...' : statistics.totalNotebooks}
              </div>`
);

// Replace notes count
content = content.replace(
  `<div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                --
              </div>`,
  `<div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                {statsLoading ? '...' : statistics.totalNotes}
              </div>`
);

// Replace tasks section
const tasksOld = `              <div class Name="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                --
              </div>
            </div>
            <div className="text-sm font-medium text-gray-300">Tasks Completed</div>
            <div className="mt-3 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg shadow-green-500/50"></div>`;

const tasksNew = `              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                {statsLoading ? '...' : statistics.completedTasks}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-300">
              Tasks Completed
              {!statsLoading && statistics.totalTasks > 0 && (
                <span className="text-gray-500 ml-1">
                  ({statistics.completionRate}%)
                </span>
              )}
            </div>
            <div className="mt-3 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-500 shadow-lg shadow-green-500/50"
                style={{ width: \`\${statistics.completionRate}%\` }}
              />
            </div>`;

// Fix the className typo in the search string
const tasksOldFixed = tasksOld.replace('class Name', 'className');
content = content.replace(tasksOldFixed, tasksNew);

// If that didn't work, try the version as-is in the file
if (!content.includes('statistics.completedTasks')) {
  const actualTasksOld = `              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
                --
              </div>
            </div>
            <div className="text-sm font-medium text-gray-300">Tasks Completed</div>
            <div className="mt-3 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg shadow-green-500/50"></div>`;

  content = content.replace(actualTasksOld, tasksNew);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Dashboard.tsx updated successfully!');
