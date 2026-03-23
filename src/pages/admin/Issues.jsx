import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Clock, CheckCircle2, Send, X } from 'lucide-react'
import { useIssues } from '../../hooks/useApi'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

const TABS = ['All', 'Open', 'In Progress', 'Resolved']

const PRIORITY_COLOR = {
  Emergency: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300',
  High: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300',
  Medium: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300',
  Low: 'bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-400',
}

export default function AdminIssues() {
  const { data: issues = [], isLoading, editMutation } = useIssues({})
  const [tab, setTab] = useState('All')
  const [noteId, setNoteId] = useState(null)
  const [note, setNote] = useState('')

  const filtered = tab === 'All' ? issues : issues.filter(i => i.status === tab)

  const update = (id, status, adminNote) => {
    editMutation.mutate({ id, status, ...(adminNote !== undefined ? { adminNote } : {}) }, {
      onSuccess: () => toast.success(`Issue marked as ${status}`)
    })
  }

  const addNote = (id) => {
    if (!note.trim()) {
      toast.error('Please enter a note')
      return
    }
    
    editMutation.mutate({ 
      id, 
      adminNote: note,
      // Keep the current status, just add note
      status: issues.find(i => i.id === id)?.status || 'Open'
    }, {
      onSuccess: () => {
        toast.success('Note added successfully')
        setNoteId(null)
        setNote('')
      },
      onError: () => toast.error('Failed to add note')
    })
  }

  const cancelNote = () => {
    setNoteId(null)
    setNote('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Issues</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{issues.filter(i => i.status === 'Open').length} open issues</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[#2A2A2A] rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {t}
            {t !== 'All' && (
              <span className="ml-1.5 text-xs text-gray-400">
                {issues.filter(i => i.status === t).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-36 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">No issues in this category</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue, i) => (
            <motion.div key={issue.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{issue.title}</h3>
                <div className="flex gap-1.5 shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    issue.status === 'Open' ? 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-300' :
                    issue.status === 'In Progress' ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300' :
                    'bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300'
                  }`}>{issue.status}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[issue.priority] || PRIORITY_COLOR.Low}`}>{issue.priority}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{issue.description}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                <span className="bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{issue.category}</span>
                <span className="text-gray-400">{formatDate(issue.createdAt)}</span>
                <span className="text-gray-400">by {issue.reportedBy}</span>
              </div>
              
              {/* Display existing admin notes */}
              {issue.adminNote && (
                <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-xl p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mb-1">Admin Note:</p>
                      <p className="text-sm text-brand-700 dark:text-brand-300">{issue.adminNote}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setNoteId(issue.id)
                        setNote(issue.adminNote)
                      }}
                      className="text-xs text-brand-500 hover:text-brand-600"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )}

              {/* Admin note input with Send button */}
              {noteId === issue.id && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add/Edit Admin Note
                  </label>
                  <div className="flex gap-2">
                    <textarea 
                      value={note} 
                      onChange={e => setNote(e.target.value)} 
                      rows={2} 
                      placeholder="Add admin note about this issue..." 
                      className="flex-1 input-field resize-none text-sm"
                      autoFocus
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => addNote(issue.id)}
                        disabled={!note.trim()}
                        className="p-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Save note"
                      >
                        <Send size={18} />
                      </button>
                      <button
                        onClick={cancelNote}
                        className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {issue.status === 'Open' && (
                  <button 
                    onClick={() => update(issue.id, 'In Progress')} 
                    className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-all"
                  >
                    <Clock size={12} /> Mark In Progress
                  </button>
                )}
                {issue.status !== 'Resolved' && (
                  <button 
                    onClick={() => update(issue.id, 'Resolved')} 
                    className="flex items-center gap-1 text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-all"
                  >
                    <CheckCircle2 size={12} /> Mark Resolved
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (noteId === issue.id) {
                      cancelNote()
                    } else {
                      setNoteId(issue.id)
                      setNote(issue.adminNote || '')
                    }
                  }} 
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {noteId === issue.id ? 'Cancel' : issue.adminNote ? 'Edit Note' : 'Add Note'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}