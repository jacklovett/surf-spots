import { FormInput, TextButton } from '~/components'
import { ForecastLink } from './index'

interface ForecastLinksProps {
  forecastLinks: ForecastLink[]
  onChange: (links: ForecastLink[]) => void
}

const ForecastLinks = ({ forecastLinks, onChange }: ForecastLinksProps) => {
  const handleAddForecast = () => {
    const updatedLinks = [...forecastLinks, { url: '', errorMessage: '' }]
    onChange(updatedLinks)
  }

  const handleRemoveForecast = (index: number) => {
    const updatedLinks = forecastLinks.filter((_, i) => i !== index)
    onChange(updatedLinks)
  }

  const handleUpdateForecast = (index: number, value: string) => {
    const updatedLinks = [...forecastLinks]
    updatedLinks[index].url = value
    onChange(updatedLinks)
  }

  return (
    <>
      {forecastLinks.map((link, index) => (
        <div key={index} className="form-inline">
          <FormInput
            field={{
              label: `Forecast Link ${index + 1}`,
              name: 'forecasts',
              type: 'url',
            }}
            value={link.url}
            onChange={(e) => handleUpdateForecast(index, e.target.value)}
            errorMessage={link.errorMessage}
            showLabel
          />
          <TextButton
            text="Remove"
            onClick={() => handleRemoveForecast(index)}
            iconKey="bin"
            filled
          />
        </div>
      ))}
      <div className="mt">
        <TextButton
          text="Add Forecast Link"
          onClick={handleAddForecast}
          iconKey="plus"
          filled
          disabled={forecastLinks.length >= 3}
        />
      </div>
    </>
  )
}

export default ForecastLinks
