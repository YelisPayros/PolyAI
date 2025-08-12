import { Attachment } from 'ai'
import { LoaderIcon, DocumentIcon } from './icons'
import { Badge } from '../ui/badge'

export const PreviewAttachment = ({
  attachment,
  isUploading = false
}: {
  attachment: Attachment
  isUploading?: boolean
}) => {
  const { name, url, contentType } = attachment
  const isImage = contentType?.startsWith('image')
  return (
    <div className={`flex flex-col gap-2 ${isImage ? 'max-w-16' : ''}`}>
      <div
        className={`${
          isImage ? 'h-20 w-16 bg-muted' : null
        } rounded-md relative flex flex-col items-center justify-center`}
      >
        {contentType ? (
          isImage ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <Badge variant="secondary" className="bg-zinc-500 text-zinc-300 dark:bg-zinc-600">
              <DocumentIcon />
              {name}
            </Badge>
          )
        ) : (
          <div className=""></div>
        )}

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <LoaderIcon />
          </div>
        )}
      </div>

      {isImage ? <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div> : null}
    </div>
  )
}
