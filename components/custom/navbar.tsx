import Image from 'next/image'
import { History } from './history'
import { SlashIcon } from './icons'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './user-menu'

export const Navbar = async () => {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return (
    <>
      <div className="bg-background absolute top-0 left-0 w-dvw py-2 px-3 justify-between flex flex-row items-center z-30">
        <div className="flex flex-row gap-3 items-center">
          <History user={user ?? undefined} />
          <div className="flex flex-row gap-2 items-center">
            <Image src="/logo.png" height={25} width={25} alt="polyai logo" />
            <div className="text-zinc-500">
              <SlashIcon size={16} />
            </div>
            <div className="text-sm dark:text-zinc-300 truncate w-28 md:w-fit">PolyAI Chat</div>
          </div>
        </div>

        <UserMenu user={user ?? undefined} />
      </div>
    </>
  )
}
