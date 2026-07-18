import { MetaFunction, useNavigate } from 'react-router'
import { Page, TextButton } from '~/components'
import { SkillLevel } from '~/types/surfSpots'

export const meta: MetaFunction = () => [
  { title: 'Surf Spots - Skill Levels' },
  { name: 'description', content: 'Understanding surf skill levels' },
]

const SkillLevels = () => {
  const navigate = useNavigate()

  return (
    <Page showHeader>
      <div className="info-page-content mv">
        <div className="back-nav">
          <TextButton
            text="Back to Profile"
            onClick={() => navigate('/profile')}
            iconKey="chevron-left"
          />
        </div>
        <h1>Skill Levels</h1>

        <section className="mb-l">
          <h2 className="mb-s">Why we ask</h2>
          <p className="mb">
            Your skill level is saved on your profile and used when you log or end
            sessions. It helps us show spot insights that match your experience,
            such as typical crowd levels and how other surfers at your level rate
            sessions at a break.
          </p>
        </section>

        <h2 className="mb">What each level means</h2>
        <p className="mb text-secondary">
          Pick the level that best matches you today. You can change it on your
          profile any time.
        </p>

        <section>
          <div className="skill-level-item">
            <h2 className="mb">{SkillLevel.BEGINNER}</h2>
            <p>
              You're just starting out! You can paddle, catch whitewater waves,
              and are learning to stand up on your board. You're still developing
              your balance and basic techniques in small, gentle waves.
            </p>
          </div>

          <div className="skill-level-item">
            <h2 className="mb">{SkillLevel.BEGINNER_INTERMEDIATE}</h2>
            <p>
              You can consistently catch and ride whitewater waves, and you're
              starting to catch unbroken waves. You can turn your board and are
              working on reading waves and improving your positioning.
            </p>
          </div>

          <div className="skill-level-item">
            <h2 className="mb">{SkillLevel.INTERMEDIATE}</h2>
            <p>
              You can consistently catch unbroken waves, perform basic turns,
              and ride along the face of the wave. You can handle different wave
              conditions and are developing your style while learning more
              advanced maneuvers.
            </p>
          </div>

          <div className="skill-level-item">
            <h2 className="mb">{SkillLevel.INTERMEDIATE_ADVANCED}</h2>
            <p>
              You're a confident surfer who can handle most conditions. You can
              perform cutbacks, bottom turns, and ride the wave with good flow.
              You're comfortable surfing in various conditions including reef
              breaks and point breaks.
            </p>
          </div>

          <div className="skill-level-item">
            <h2 className="mb">{SkillLevel.ADVANCED}</h2>
            <p>
              You're an experienced surfer who can handle challenging conditions
              and perform advanced maneuvers. You can surf overhead waves, handle
              powerful breaks, and have a strong understanding of wave dynamics.
              You're comfortable in a wide variety of surf conditions and
              locations.
            </p>
          </div>
        </section>
      </div>
    </Page>
  )
}

export default SkillLevels