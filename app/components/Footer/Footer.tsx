import classNames from 'classnames'

interface IProps {
  isAlternate: boolean
}

export const Footer = ({ isAlternate }: IProps) => (
  <footer
    className={classNames({
      alternate: isAlternate,
    })}
  >
    © 2025 Surf Spots
  </footer>
)
