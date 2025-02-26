import { useNavigate } from '@remix-run/react'
import Button from '../Button'
import { signInProviders } from './index'

export const SignInOptions = () => {
  const navigate = useNavigate()
  return (
    <div className="sign-in-providers-container">
      <div className="sign-in-providers">
        {signInProviders.map(({ name, icon }) => (
          <Button
            key={name}
            label=""
            icon={{
              name,
              filePath: icon,
            }}
            onClick={() => navigate(`/auth/${name}`)}
          />
        ))}
      </div>
    </div>
  )
}
