import { useState, useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import { courses } from './data/courses'
import './index.css'

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#1e293b',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#475569',
    lineColor: '#94a3b8',
    secondaryColor: '#334155',
    tertiaryColor: '#0f172a',
    noteBkgColor: '#334155',
    noteTextColor: '#e2e8f0',
    noteBorderColor: '#475569',
    actorBkg: '#1e293b',
    actorBorder: '#22c55e',
    actorTextColor: '#e2e8f0',
    signalColor: '#94a3b8',
    labelBoxBkgColor: '#1e293b',
    labelBoxBorderColor: '#475569',
    labelTextColor: '#e2e8f0',
    loopTextColor: '#94a3b8',
    activationBorderColor: '#22c55e',
    sequenceNumberColor: '#fff',
  },
  flowchart: { curve: 'basis', padding: 15 },
  sequence: { mirrorActors: false },
  fontFamily: 'Inter, sans-serif',
})

let mermaidCounter = 0

function MermaidDiagram({ chart }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current) return
      try {
        const id = 'mmd-' + (++mermaidCounter)
        const { svg } = await mermaid.render(id, chart)
        containerRef.current.innerHTML = svg
      } catch {
        containerRef.current.innerHTML = '<pre style="color:#94a3b8">' + chart + '</pre>'
      }
    }
    render()
  }, [chart])

  return <div ref={containerRef} className="mermaid-diagram" />
}

function App() {
  const [activeCourseId, setActiveCourseId] = useState(courses[0].id)
  const [activeLesson, setActiveLesson] = useState(1)

  const currentCourse = courses.find(c => c.id === activeCourseId)
  const currentLesson = currentCourse.lessons.find(l => l.id === activeLesson)

  const goToLesson = (id) => {
    setActiveLesson(id)
    window.scrollTo(0, 0)
  }

  const switchCourse = (courseId) => {
    setActiveCourseId(courseId)
    setActiveLesson(1)
    window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">Backend Handbook</span>
        </div>
        <nav className="course-tabs">
          {courses.map(course => (
            <button
              key={course.id}
              className={`course-tab ${activeCourseId === course.id ? 'active' : ''}`}
              style={activeCourseId === course.id ? { '--course-color': course.color } : {}}
              onClick={() => switchCourse(course.id)}
            >
              <span className="course-tab-icon">{course.icon}</span>
              {course.name}
            </button>
          ))}
        </nav>
      </header>

      <aside className="sidebar">
        <h1 style={{ color: currentCourse.color }}>
          {currentCourse.icon} {currentCourse.name}
        </h1>
        <p className="subtitle">{currentCourse.description}</p>

        <nav>
          <div className="nav-section">
            <h3>Lessons</h3>
            {currentCourse.lessons.map(lesson => (
              <div
                key={lesson.id}
                className={`nav-item ${activeLesson === lesson.id ? 'active' : ''}`}
                style={activeLesson === lesson.id ? { background: `linear-gradient(135deg, ${currentCourse.color} 0%, ${currentCourse.color}cc 100%)` } : {}}
                onClick={() => goToLesson(lesson.id)}
              >
                <span className="num">{lesson.id}</span>
                {lesson.title}
              </div>
            ))}
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="lesson-header">
          <div className="lesson-number" style={{ color: currentCourse.color }}>
            BÀI {currentLesson.id} / {currentCourse.lessons.length}
          </div>
          <h1 className="lesson-title">{currentLesson.title}</h1>
          <p className="lesson-desc">{currentLesson.desc}</p>
        </header>

        <LessonContent content={currentLesson.content} />

        <div className="nav-buttons">
          {activeLesson > 1 ? (
            <button className="nav-btn" onClick={() => goToLesson(activeLesson - 1)}>
              <div className="nav-btn-label">Previous</div>
              <div>{currentCourse.lessons[activeLesson - 2].title}</div>
            </button>
          ) : <div />}

          {activeLesson < currentCourse.lessons.length ? (
            <button
              className="nav-btn primary"
              style={{ background: `linear-gradient(135deg, ${currentCourse.color} 0%, ${currentCourse.color}cc 100%)` }}
              onClick={() => goToLesson(activeLesson + 1)}
            >
              <div className="nav-btn-label">Next</div>
              <div>{currentCourse.lessons[activeLesson].title}</div>
            </button>
          ) : (
            <button
              className="nav-btn primary"
              style={{ background: `linear-gradient(135deg, ${currentCourse.color} 0%, ${currentCourse.color}cc 100%)` }}
              onClick={() => goToLesson(1)}
            >
              <div className="nav-btn-label">Restart</div>
              <div>Quay lại bài 1</div>
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

function LessonContent({ content }) {
  const lines = content.trim().split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Headers
    if (line.startsWith('## ')) {
      elements.push(
        <div key={i} className="content-section">
          <h2>{line.slice(3)}</h2>
        </div>
      )
      i++
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i}>{line.slice(4)}</h3>)
      i++
      continue
    }

    // Code blocks (including mermaid)
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim() || 'text'
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }

      if (lang === 'mermaid') {
        elements.push(
          <MermaidDiagram key={i} chart={codeLines.join('\n')} />
        )
      } else {
        elements.push(
          <div key={i} className="code-block">
            <div className="code-header">{lang}</div>
            <pre>{codeLines.join('\n')}</pre>
          </div>
        )
      }
      i++
      continue
    }

    // Tables
    if (line.startsWith('|') && lines[i + 1]?.includes('---')) {
      const tableLines = []
      while (i < lines.length && lines[i].startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      elements.push(<Table key={i} lines={tableLines} />)
      continue
    }

    // Info boxes
    if (line.startsWith('> ⚠️')) {
      elements.push(
        <div key={i} className="info-box warning">
          <div className="info-box-title">⚠️ Lưu ý</div>
          <p>{line.slice(5).trim()}</p>
        </div>
      )
      i++
      continue
    }

    // Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={i}>
          {listItems.map((item, idx) => (
            <li key={idx}>{formatInlineCode(item)}</li>
          ))}
        </ul>
      )
      continue
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      const listItems = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      elements.push(
        <ol key={i}>
          {listItems.map((item, idx) => (
            <li key={idx}>{formatInlineCode(item)}</li>
          ))}
        </ol>
      )
      continue
    }

    // Regular paragraphs
    if (line.trim()) {
      elements.push(<p key={i}>{formatInlineCode(line)}</p>)
    }

    i++
  }

  return <div className="content">{elements}</div>
}

function Table({ lines }) {
  const headers = lines[0].split('|').filter(c => c.trim()).map(c => c.trim())
  const rows = lines.slice(2).map(line =>
    line.split('|').filter(c => c.trim()).map(c => c.trim())
  )

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i}>{formatInlineCode(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{formatInlineCode(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatInlineCode(text) {
  if (!text) return text

  const parts = text.split(/(`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1, -1)}</code>
    }
    // Bold
    if (part.includes('**')) {
      const boldParts = part.split(/(\*\*[^*]+\*\*)/)
      return boldParts.map((bp, j) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return <strong key={j}>{bp.slice(2, -2)}</strong>
        }
        return bp
      })
    }
    return part
  })
}

export default App
