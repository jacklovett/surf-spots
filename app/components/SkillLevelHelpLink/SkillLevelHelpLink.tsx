import { Link } from 'react-router'

export const SkillLevelHelpLink = () => (
  <div className="profile-links">
    <Link to='/skill-levels' prefetch="intent" className="text-link">
      {'What do these skill levels mean?'}
    </Link>
  </div>
)

export default SkillLevelHelpLink
