import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Home, Overview, PageNotFound, SurfSpotEditor } from './Views'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/add-surf-spot" element={<SurfSpotEditor />} />
        <Route path="/edit-surf-spot/:id" element={<SurfSpotEditor />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  )
}

export default App
