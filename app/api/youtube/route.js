import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { query, maxResults = 5 } = await request.json()
    
    const apiKey = process.env.YT_API
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      )
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Enhance query for better educational results
    const educationalQuery = `${query} educational tutorial lesson learn`

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(educationalQuery)}&` +
      `type=video&` +
      `maxResults=${maxResults}&` +
      `key=${apiKey}&` +
      `videoEmbeddable=true&` +
      `videoSyndicated=true&` +
      `safeSearch=strict&` +
      `relevanceLanguage=en&` +
      `videoCategoryId=27&` + // Education category
      `order=relevance`
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ videos: [] })
    }

    const videos = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
    }))

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error searching YouTube videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error.message },
      { status: 500 }
    )
  }
}
