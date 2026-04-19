import { useState } from 'react'

import Icon from '~/components/Icon'
import { AccordionItem } from './index'

interface AccordionProps {
  items: AccordionItem[]
  defaultOpenItemId?: string
}

export const Accordion = (props: AccordionProps) => {
  const { items, defaultOpenItemId } = props
  const [openItemId, setOpenItemId] = useState<string | null>(
    defaultOpenItemId ?? null,
  )

  const toggleItem = (itemId: string) => 
    setOpenItemId((current) => (current === itemId ? null : itemId))

  return (
    <div className="accordion-list" role="list">
      {items.map((item) => {
        const answerId = `accordion-answer-${item.id}`
        const isOpen = openItemId === item.id

        return (
          <article
            key={item.id}
            className={`accordion-card ${isOpen ? 'accordion-card-expanded' : ''}`}
            role="listitem"
          >
            <div className="accordion-card-row">
              <div className="accordion-card-top">
                <button
                  type="button"
                  className="accordion-card-toggle"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleItem(item.id)}
                >
                  <span
                    className={`accordion-card-chevron ${
                      isOpen ? 'accordion-card-chevron-open' : ''
                    }`}
                    aria-hidden
                  >
                    <Icon iconKey="chevron-down" useCurrentColor />
                  </span>
                  <span className="accordion-card-primary">
                    <span className="accordion-card-title">{item.title}</span>
                  </span>
                </button>
              </div>
            </div>
            {isOpen && (
              <div
                id={answerId}
                className="accordion-card-panel"
                role="region"
                aria-label={item.title}
              >
                {item.content}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}