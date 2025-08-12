import { motion } from 'motion/react'
import { LanguageIcon } from './icons'
import Image from 'next/image'

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-none bg-muted/50 rounded-2xl p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <p className="flex flex-row justify-center gap-4 items-center text-zinc-900 dark:text-zinc-50">
          <LanguageIcon />
        </p>
        <p>
          Welcome to <code className="rounded-sm bg-muted-foreground/15 px-1.5 py-0.5">PolyAI</code>
          ! Your multilingual virtual assistant, I&#8217;m here to help with tasks and questions.
          Start by typing below!
        </p>
        <Image
          src="/overview.png"
          width={500}
          height={100}
          alt="Overview"
          className="w-full rounded-xl h-[150px] object-cover"
        />
      </div>
    </motion.div>
  )
}
