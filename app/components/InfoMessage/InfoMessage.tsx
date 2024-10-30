interface IProps {
  message: string
}

export const InfoMessage = ({ message }: IProps) => {
  return (
    <div className="info-message">
      <div className="info-icon">
        {/* TODO: Move to SVGIcon.tsx */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#ffffff"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm0 22C6.478 22 2 17.522 2 12S6.478 2 12 2s10 4.478 10 10-4.478 10-10 10zm-1-16h2v2h-2zm0 4h2v8h-2z" />
        </svg>
      </div>
      <div className="info-content">{message}</div>
    </div>
  )
}
