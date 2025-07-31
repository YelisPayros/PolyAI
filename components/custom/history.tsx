'use client'

import cx from 'classnames'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { Chat, fetcher, getTitleFromChat } from '@/lib/utils'
import { InfoIcon, MenuIcon, MoreHorizontalIcon, PencilEditIcon, TrashIcon } from './icons'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../ui/alert-dialog'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export const History = ({ user }: { user: User | undefined }) => {
  const { id } = useParams()
  const pathname = usePathname()

  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const {
    data: history,
    isLoading,
    mutate
  } = useSWR<Array<Chat>>(user ? '/api/history' : null, fetcher, {
    fallbackData: []
  })

  useEffect(() => {
    mutate()
  }, [pathname, mutate])

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const router = useRouter()
  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat/${deleteId}`, {
      method: 'DELETE'
    })

    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        mutate((history: Array<Chat> | undefined) => {
          if (history) {
            // only redirect if the deleted chat is the current one
            if (deleteId === id) router.push('/')

            return history.filter(h => h.chat_id !== id)
          }
        })
        return 'Chat deleted successfully'
      },
      error: 'Failed to delete chat'
    })

    setShowDeleteDialog(false)
  }

  return (
    <>
      <Button
        variant="outline"
        className="p-1.5 h-fit"
        onClick={() => {
          setIsHistoryVisible(true)
        }}
      >
        <MenuIcon />
      </Button>

      <Sheet
        open={isHistoryVisible}
        onOpenChange={state => {
          setIsHistoryVisible(state)
        }}
      >
        <SheetContent side="left" className="p-3 w-80">
          <SheetHeader>
            <SheetTitle className="text-left">History</SheetTitle>
            <SheetDescription className="text-left">
              {history === undefined ? 'loading' : history.length} chats
            </SheetDescription>
          </SheetHeader>

          <div className="px-2 flex flex-col gap-2">
            {user && (
              <Button variant="outline" className="self-start" asChild>
                <Link href="/">
                  <PencilEditIcon /> New Chat
                </Link>
              </Button>
            )}

            <div className="flex flex-col gap-1 h-[calc(100dvh-124px)]">
              {!user ? (
                <div className="text-zinc-10 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                  <InfoIcon />
                  <div>Login to save and revisit previous chats!</div>
                </div>
              ) : null}

              {!isLoading && history?.length === 0 && user ? (
                <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                  <InfoIcon />
                  <div>No chats found</div>
                </div>
              ) : null}

              {isLoading && user ? (
                <div className="flex flex-col">
                  {[44, 32, 28, 52].map(item => (
                    <div key={item} className="p-2 my-[2px]">
                      <div
                        className={`w-${item} h-[20px] rounded-md bg-zinc-200 dark:bg-zinc-600 animate-pulse`}
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {history &&
                history.map((chat: Chat) => (
                  <div
                    key={chat.chat_id}
                    className={cx(
                      'flex flex-row items-center gap-6 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md pr-2',
                      { 'bg-zinc-100 dark:bg-zinc-900': chat.chat_id === id }
                    )}
                  >
                    <Button
                      variant="ghost"
                      className={cx(
                        'hover:bg-zinc-100 dark:hover:bg-zinc-900 justify-between p-0 text-sm font-normal flex flex-row items-center gap-2 pr-2 w-full transition-none'
                      )}
                      asChild
                    >
                      <Link
                        href={`/${chat.chat_id}`}
                        className="text-ellipsis overflow-hidden text-left py-2 pl-2 rounded-lg outline-zinc-900"
                      >
                        {getTitleFromChat(chat)}
                      </Link>
                    </Button>

                    <DropdownMenu modal={true}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="p-0 h-fit font-normal text-zinc-500 transition-none hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          variant="ghost"
                        >
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left" className="z-[60]">
                        <DropdownMenuItem asChild>
                          <Button
                            className="flex flex-row gap-2 items-center justify-start w-full h-fit font-normal p-1.5 rounded-sm cursor-pointer"
                            variant="ghost"
                            onClick={() => {
                              setDeleteId(chat.chat_id)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <TrashIcon />
                            <div>Delete</div>
                          </Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your chat and remove it
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
