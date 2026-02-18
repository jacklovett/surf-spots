import { useRef, useState, DragEvent, ChangeEvent } from 'react'
import Icon from '../Icon'

export interface MediaUploadProps {
  onFilesSelected: (files: FileList) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
}

export const MediaUpload = ({
  onFilesSelected,
  accept = 'image/*,video/*',
  multiple = true,
  disabled = false,
}: MediaUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFilesSelected(files)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div
      className={`media-upload-card ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="media-upload-input-hidden"
        disabled={disabled}
      />
      <div className="media-upload-content">
        <div className="media-upload-icon">
          <Icon iconKey="plus" />
        </div>
        <p className="media-upload-text">
          {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="media-upload-hint">
          Photos and videos (PNG, JPG, MP4, etc.), up to 500 MB each
        </p>
      </div>
    </div>
  )
}
