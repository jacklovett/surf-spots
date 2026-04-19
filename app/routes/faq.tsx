import type { MetaFunction } from 'react-router'
import { Link } from 'react-router'

import { Accordion, Page } from '~/components'

interface FaqItem {
  question: string
  answer: string
}

interface FaqSection {
  title: string
  subtitle: string
  items: FaqItem[]
}

const faqSections: FaqSection[] = [
  {
    title: 'General',
    subtitle: 'Overview of what Surf Spots does.',
    items: [
      {
        question: 'What is Surf Spots?',
        answer:
          'Surf Spots is a surf planning and tracking app. You can discover spots, log sessions, manage your surfboards, and organize trips.',
      },
      {
        question: 'Do I need an account to use Surf Spots?',
        answer:
          'No account is required to browse surf spots. An account is required to save sessions, watch list spots, trips, and surfboards.',
      },
      {
        question: 'Can I book lessons, camps, or accommodation in Surf Spots?',
        answer:
          'No. Surf Spots currently focuses on discovery, planning, and tracking rather than in-app booking and checkout.',
      },
      {
        question: 'How is Surf Spots different from a forecast app?',
        answer:
          'Forecast apps focus on day-to-day conditions. Surf Spots focuses on your surf history and planning tools such as sessions, watch list, and trips.',
      },
    ],
  },
  {
    title: 'Spot Data and Conditions',
    subtitle: 'What information is available and how to use it.',
    items: [
      {
        question: 'Does Surf Spots provide live forecast data?',
        answer:
          'Not currently. Use Surf Spots for planning and tracking, and use your preferred forecast tools for live conditions before a session.',
      },
      {
        question: 'Can I rely on Surf Spots alone for safety decisions?',
        answer:
          'No. Surf conditions can change quickly, so always verify local real-time conditions and follow local safety guidance before entering the water.',
      },
      {
        question: 'Why are some spots missing details?',
        answer:
          'Spot data coverage varies by location and available sources. Some spots include more complete details than others.',
      },
      {
        question: 'Can I keep personal discoveries private?',
        answer:
          'Yes. You can create private spots that are not publicly visible.',
      },
    ],
  },
  {
    title: 'Sessions and Trips',
    subtitle: 'Answers about logging and planning features.',
    items: [
      {
        question: 'What is required when logging a session?',
        answer:
          'Session date is required. Additional fields such as notes, conditions, and board details are optional.',
      },
      {
        question: 'Can I plan trips with other people?',
        answer:
          'Yes. You can invite members to trips and manage collaboration from the trip workflow.',
      },
      {
        question: 'Can I upload photos to sessions and trips?',
        answer:
          'Yes. Media uploads are supported for both sessions and trips.',
      },
      {
        question: 'Is Trip Planner available?',
        answer:
          'Trip Planner is currently marked as coming soon. You can still use Trips, Sessions, and Watch List for planning today.',
      },
    ],
  },
]

export const meta: MetaFunction = () => [
  { title: 'Surf Spots - FAQ' },
  {
    name: 'description',
    content:
      'Frequently asked questions about how Surf Spots works, current limitations, and what to expect as the product evolves.',
  },
]

const FAQ = () => {
  return (
    <Page showHeader>
      <div className="info-page-content mv faq-page">
        <h1>Frequently Asked Questions</h1>
        <p className="faq-intro">
          Find answers to common questions about Surf Spots features and usage.
        </p>

        {faqSections.map((section, sectionIndex) => (
          <section key={section.title} className="faq-section">
            <h2>{section.title}</h2>
            <p className="faq-section-subtitle">{section.subtitle}</p>

            <Accordion
              items={section.items.map((item, itemIndex) => ({
                id: `${sectionIndex}-${itemIndex}`,
                title: item.question,
                content: <p>{item.answer}</p>,
              }))}
              defaultOpenItemId={sectionIndex === 0 ? '0-0' : undefined}
            />
          </section>
        ))}

        <section className="faq-note">
          <h2>Still need help?</h2>
          <p>
            If your question is not listed here,{' '}
            <Link to="/contact" prefetch="intent" className="text-link">
              Contact us
            </Link>{' '}. We'll do our best to help you.
          </p>
        </section>
      </div>
    </Page>
  )
}

export default FAQ
