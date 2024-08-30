import { HashRouter as Router, Routes, Route } from 'react-router-dom'

import {
  Home,
  MySurfSpots,
  PageNotFound,
  Profile,
  Settings,
  SurfSpotEditor,
  SurfSpotDetails,
  SurfSpots,
  WishList,
} from './Views'

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/surf-spots" element={<SurfSpots />} />
      <Route path="/my-surf-spots" element={<MySurfSpots />} />
      <Route path="/add-surf-spot" element={<SurfSpotEditor />} />
      <Route path="/edit-surf-spot/:id" element={<SurfSpotEditor />} />
      <Route path="/surf-spot/:id" element={<SurfSpotDetails />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/wishlist" element={<WishList />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  </Router>
)

export default App
