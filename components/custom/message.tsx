/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { Attachment, ToolInvocation } from 'ai'
import { motion } from 'motion/react'
import { ReactNode } from 'react'
import { PolyAIIcon, UserIcon } from './icons'
import { PreviewAttachment } from './preview-attachment'
import { Markdown } from './markdown'
import { AudioPlayer } from './audio-player'
import { Badge } from '../ui/badge'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import Map, { Marker } from 'react-map-gl/maplibre'
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip'

export const Message = ({
  // Eliminé 'chatId' porque no se estaba usando y ESLint daba warning por eso
  role,
  content,
  toolInvocations,
  attachments
}: {
  // Quité 'chatId' del tipo también para mantener consistencia y evitar warnings
  role: string
  content: string | ReactNode
  toolInvocations: Array<ToolInvocation> | undefined
  attachments?: Array<Attachment>
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileInView={{ y: 0, opacity: 1 }}
    >
      <div
        className={`size-[24px] border rounded-sm self-start p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500 ${
          role === 'assistant' ? 'bg-white text-zinc-700' : ''
        }`}
      >
        {/* Cambié PolyAIIcon por BotIcon si existe, o mantuve PolyAIIcon según lo que quieras */}
        {role === 'assistant' ? <PolyAIIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === 'string' && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map(toolInvocation => {
              const { toolName, toolCallId, state } = toolInvocation

              if (state === 'result') {
                const { result } = toolInvocation

                if (toolName === 'get_ip_info') {
                  return (
                    <div key={toolCallId} className="hidden">
                      {null}
                    </div>
                  )
                }

                if (toolName === 'use_tts') {
                  // Extract the audio URL from the result
                  let audioUrl = ''
                  if (result?.structuredContent?.result) {
                    audioUrl = result.structuredContent.result.trim()
                  } else if (result?.content?.[0]?.text) {
                    audioUrl = result.content[0].text.trim()
                  }

                  return (
                    <div key={toolCallId}>
                      <AudioPlayer audioUrl={audioUrl} />
                    </div>
                  )
                }

                if (toolName === 'internet_search') {
                  // Define background colors for badges
                  const bgColors = ['bg-blue-500 dark:bg-blue-600', 'bg-gray-500 dark:bg-gray-600']

                  return (
                    <div key={toolCallId} className="flex flex-wrap gap-2">
                      {result?.structuredContent?.results?.map(
                        (item: { url: string; title: string }, index: number) => (
                          <Link
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={index}
                          >
                            <Badge
                              variant="secondary"
                              className={`${
                                bgColors[index % bgColors.length]
                              } text-white hover:underline`}
                            >
                              <ExternalLink className="mr-1 shrink-0" size={14} />
                              <span className="truncate">{item.title}</span>
                            </Badge>
                          </Link>
                        )
                      )}
                    </div>
                  )
                }

                if (toolName === 'handle_place_search') {
                  // Build GeoJSON from tool result places
                  let places: Array<{
                    name: string
                    lat: number
                    lon: number
                    address?: string | null
                  }> = []

                  // Try to extract from structured content first
                  const structured = (result as any)?.structuredContent
                  if (Array.isArray(structured?.places)) {
                    places = structured.places
                  } else {
                    // Fallback to content[0].text that might be a JSON string array
                    const textPayload = (result as any)?.content?.[0]?.text
                    if (typeof textPayload === 'string') {
                      try {
                        const parsed = JSON.parse(textPayload)
                        if (Array.isArray(parsed)) {
                          places = parsed
                        }
                      } catch {}
                    }
                  }

                  if (!places.length) return null
                  // Construct GeoJSON FeatureCollection
                  const features = places
                    .filter(p => typeof p?.lat === 'number' && typeof p?.lon === 'number')
                    .map(p => ({
                      type: 'Feature',
                      geometry: {
                        type: 'Point',
                        coordinates: [Number(p.lon), Number(p.lat)]
                      },
                      properties: {
                        title: p.name,
                        address: p.address ?? null
                      }
                    })) as any[]
                  const geojson: any = {
                    type: 'FeatureCollection',
                    features: features ?? []
                  }

                  // Choose a reasonable initial center
                  const lons = (geojson.features as any[])
                    .map(f => (f.geometry as any)?.coordinates?.[0])
                    .filter((v: any) => typeof v === 'number')
                  const lats = (geojson.features as any[])
                    .map(f => (f.geometry as any)?.coordinates?.[1])
                    .filter((v: any) => typeof v === 'number')
                  const avgLon = lons.length
                    ? lons.reduce((a: number, b: number) => a + b, 0) / lons.length
                    : -122.45
                  const avgLat = lats.length
                    ? lats.reduce((a: number, b: number) => a + b, 0) / lats.length
                    : 37.78

                  // Compute bounds to show all points when multiple
                  const coords: Array<[number, number]> = (geojson.features as any[])
                    .map(f => (f.geometry as any)?.coordinates)
                    .filter(
                      (c: any) =>
                        Array.isArray(c) &&
                        c.length === 2 &&
                        c.every((v: any) => typeof v === 'number')
                    )
                  const minLon = coords.length ? Math.min(...coords.map(c => c[0])) : avgLon
                  const maxLon = coords.length ? Math.max(...coords.map(c => c[0])) : avgLon
                  const minLat = coords.length ? Math.min(...coords.map(c => c[1])) : avgLat
                  const maxLat = coords.length ? Math.max(...coords.map(c => c[1])) : avgLat

                  const initialViewState: any =
                    coords.length > 1
                      ? {
                          bounds: [
                            [minLon, minLat],
                            [maxLon, maxLat]
                          ],
                          fitBoundsOptions: { padding: 40 }
                        }
                      : { longitude: avgLon, latitude: avgLat, zoom: 14 }

                  // Render markers wrapped with Tooltip for title display
                  const PlacesMap = () => {
                    return (
                      <Map
                        reuseMaps
                        initialViewState={initialViewState}
                        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                        style={{ width: '100%', height: 320 }}
                      >
                        {places.map((p, idx) =>
                          typeof p.lat === 'number' && typeof p.lon === 'number' ? (
                            <Marker
                              key={idx}
                              longitude={Number(p.lon)}
                              latitude={Number(p.lat)}
                              anchor="center"
                            >
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    aria-label={p.name}
                                    className="cursor-pointer block size-3 rounded-full bg-sky-600 ring-2 ring-white shadow hover:scale-110 transition"
                                  />
                                </TooltipTrigger>
                                <TooltipContent sideOffset={6}>
                                  <div className="text-xs font-medium">{p.name}</div>
                                  {p.address ? (
                                    <div className="text-xs text-muted-foreground">{p.address}</div>
                                  ) : null}
                                </TooltipContent>
                              </Tooltip>
                            </Marker>
                          ) : null
                        )}
                      </Map>
                    )
                  }

                  return (
                    <div key={toolCallId} className="overflow-hidden rounded-lg border">
                      <PlacesMap />
                    </div>
                  )
                }

                return (
                  <div key={toolCallId}>
                    <div>{JSON.stringify(result, null, 2)}</div>
                  </div>
                )
              } else if (toolName === 'use_tts') {
                return (
                  <div key={toolCallId} className="skeleton">
                    <AudioPlayer isLoading={true} />
                  </div>
                )
              } else if (toolName === 'internet_search' && state === 'call') {
                return (
                  <div key={toolCallId} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-[14px] w-[14px] shrink-0 animate-pulse rounded-full bg-muted" />
                      <span className="text-sm">Searching the web...</span>
                    </div>
                    <div className="h-[42px] w-full animate-pulse rounded-lg bg-muted" />
                  </div>
                )
              } else if (toolName === 'handle_place_search' && state === 'call') {
                return (
                  <div key={toolCallId} className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-[14px] w-[14px] shrink-0 animate-pulse rounded-full bg-muted" />
                      <span className="text-sm">Searching places...</span>
                    </div>
                    <div className="h-[160px] w-full animate-pulse rounded-lg bg-muted" />
                  </div>
                )
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map(attachment => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
