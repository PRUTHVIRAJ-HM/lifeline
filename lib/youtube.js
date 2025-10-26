/**
 * YouTube API utility functions
 */

const YT_API_KEY = process.env.YT_API || process.env.NEXT_PUBLIC_YT_API

/**
 * Search for YouTube videos related to a topic
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results (default: 5)
 * @returns {Promise<Array>} Array of video objects
 */
export async function searchYouTubeVideos(query, maxResults = 5) {
  try {
    const apiKey = YT_API_KEY
    if (!apiKey) {
      console.error('YouTube API key not found')
      return []
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
      return []
    }

    return data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
    }))
  } catch (error) {
    console.error('Error searching YouTube videos:', error)
    return []
  }
}

/**
 * Get video details by ID
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object|null>} Video details object
 */
export async function getVideoDetails(videoId) {
  try {
    const apiKey = YT_API_KEY
    if (!apiKey) {
      console.error('YouTube API key not found')
      return null
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return null
    }

    const video = data.items[0]
    return {
      videoId: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
      likeCount: video.statistics.likeCount,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      embedUrl: `https://www.youtube.com/embed/${video.id}`
    }
  } catch (error) {
    console.error('Error getting video details:', error)
    return null
  }
}

/**
 * Convert ISO 8601 duration to readable format
 * @param {string} duration - ISO 8601 duration (e.g., PT4M13S)
 * @returns {string} Readable duration (e.g., "4:13")
 */
export function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  
  if (!match) return '0:00'
  
  const hours = (match[1] || '').replace('H', '')
  const minutes = (match[2] || '').replace('M', '')
  const seconds = (match[3] || '').replace('S', '')
  
  if (hours) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
  }
  
  return `${minutes || '0'}:${seconds.padStart(2, '0')}`
}

/**
 * Search for videos for each lesson topic
 * @param {Array} lessons - Array of lesson objects with title
 * @param {string} courseTopic - Main course topic for context
 * @returns {Promise<Array>} Lessons with video URLs added
 */
export async function enrichLessonsWithVideos(lessons, courseTopic) {
  try {
    const enrichedLessons = await Promise.all(
      lessons.map(async (lesson) => {
        // Enhanced search query with educational context
        const searchQuery = `${courseTopic} ${lesson.title} tutorial course complete guide`
        const videos = await searchYouTubeVideos(searchQuery, 1)
        
        if (videos.length > 0) {
          return {
            ...lesson,
            videoUrl: videos[0].url,
            videoTitle: videos[0].title,
            videoThumbnail: videos[0].thumbnail,
            videoChannel: videos[0].channelTitle
          }
        }
        
        return lesson
      })
    )
    
    return enrichedLessons
  } catch (error) {
    console.error('Error enriching lessons with videos:', error)
    return lessons
  }
}
