import Link from 'next/link'
import React, { memo, ReactNode, HTMLAttributes } from 'react'
import ReactMarkdown, { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

// --- Definición del tipo para las props del componente 'code'
// Antes usabas `any` lo cual causa error en linting y tipos.
// Ahora definimos un tipo explícito con propiedades opcionales, 
// especialmente `children` que ReactMarkdown espera que sea opcional.

type CodeComponentProps = {
  inline?: boolean
  className?: string
  children?: ReactNode  // <-- CAMBIO: children ahora es opcional para evitar error TS
} & HTMLAttributes<HTMLElement>

// Definimos los componentes personalizados para ReactMarkdown
const components: Components = {
  code: ({ inline, className, children, ...props }: CodeComponentProps) => {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <pre
        {...props}
        className={`${className} text-sm w-[80dvw] md:max-w-[500px] overflow-x-scroll bg-zinc-100 p-3 rounded-lg mt-2 dark:bg-zinc-800`}
      >
        <code className={match[1]}>{children}</code>
      </pre>
    ) : (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    )
  },

  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-outside ml-4" {...props}>
      {children}
    </ol>
  ),

  li: ({ children, ...props }) => (
    <li className="py-1" {...props}>
      {children}
    </li>
  ),

  ul: ({ children, ...props }) => (
     // CAMBIO: corregí clase de lista de decimal a disc para ul
    <ul className="list-disc list-outside ml-4" {...props}>
      {children}
    </ul>
  ),

  strong: ({ children, ...props }) => (
    <span className="font-semibold" {...props}>
      {children}
    </span>
  ),

  // CAMBIO IMPORTANTE: El componente `a` ahora maneja `href` explícitamente,
  // porque Next.js Link requiere que se pase `href` a su hijo <a> para funcionar bien

  a: ({ children, href, ...props }) => {
    if (!href) return <a {...props}>{children}</a>
    return (
      <Link href={href} legacyBehavior>
        <a
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline"
          {...props}
        >
          {children}
        </a>
      </Link>
    )
  },
}

// Componente principal que usa ReactMarkdown con los componentes personalizados

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  )
}

// Exportamos el componente memoizado para evitar renders innecesarios

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
)
