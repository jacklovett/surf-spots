import { FormInput, TextButton } from '~/components'

export interface UrlLinkItem {
  url: string
  errorMessage?: string
}

interface UrlLinkListProps {
  links: UrlLinkItem[]
  onChange: (links: UrlLinkItem[]) => void
  inputName: string
  linkLabel: string
  addButtonText: string
  maxLinks?: number
}

const DEFAULT_MAX_LINKS = 3

const UrlLinkList = ({
  links,
  onChange,
  inputName,
  linkLabel,
  addButtonText,
  maxLinks = DEFAULT_MAX_LINKS,
}: UrlLinkListProps) => {
  const handleAdd = () => onChange([...links, { url: '', errorMessage: '' }])

  const handleRemove = (index: number) =>
    onChange(links.filter((_, i) => i !== index))

  const handleUpdate = (index: number, value: string) => {
    const updated = [...links]
    updated[index].url = value
    onChange(updated)
  }

  return (
    <>
      {links.map((link, index) => (
        <div key={index} className="form-inline">
          <FormInput
            field={{
              label: `${linkLabel} ${index + 1}`,
              name: inputName,
              type: 'url',
            }}
            value={link.url}
            onChange={(e) => handleUpdate(index, e.target.value)}
            errorMessage={link.errorMessage}
            showLabel
          />
          <TextButton
            text="Remove"
            onClick={() => handleRemove(index)}
            iconKey="bin"
            filled
            danger
          />
        </div>
      ))}
      <div className="mt">
        <TextButton
          text={addButtonText}
          onClick={handleAdd}
          iconKey="plus"
          filled
          disabled={links.length >= maxLinks}
        />
      </div>
    </>
  )
}

export default UrlLinkList
