import { useNavigate } from 'react-router'
import Button from '../Button'
import { signInProviders } from './index'
import { IconKey } from '../Icon'

export const SignInOptions = () => {
  const navigate = useNavigate()
  return (
    <div className="sign-in-providers-container">
      <div className="sign-in-providers">
        {signInProviders.map(({ name }) => (
          <Button
            key={name}
            label=""
            icon={{
              name: name as IconKey,
            }}
            onClick={() => navigate(`/auth/${name}`)}
          />
        ))}
      </div>
    </div>
  )
}
