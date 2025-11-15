/import { ConfirmDialog } from '@\/components\/ConfirmDialog'/a\
import { useStatistics } from '@/hooks/useStatistics'
/useNotebooks()/a\
  const { statistics, isLoading: statsLoading } = useStatistics()
s/{notebooks\.length}/{statsLoading ? '...' : statistics.totalNotebooks}/
s/--/{statsLoading ? '...' : statistics.totalNotes}/
/Tasks Completed/,/rounded-full shadow-lg shadow-green-500\/50/c\
              Tasks Completed\
              {!statsLoading && statistics.totalTasks > 0 && (\
                <span className="text-gray-500 ml-1">\
                  ({statistics.completionRate}%)\
                </span>\
              )}\
            </div>\
            <div className="mt-3 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full overflow-hidden relative">\
              <div\
                className="h-full bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-500 shadow-lg shadow-green-500/50"\
                style={{ width: `${statistics.completionRate}%` }}\
              />
