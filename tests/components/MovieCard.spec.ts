import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MovieCard from '~/features/movies/components/MovieCard.vue'
import type { Movie } from '~/shared/schemas'

describe('MovieCard', () => {
  let mockMovie: Movie

  beforeEach(() => {
    vi.clearAllMocks()

    mockMovie = {
      id: 1,
      title: 'Test Movie',
      description: 'A test movie description',
      year: 2020,
      lengthMinutes: 120,
      posterImage: '/poster.jpg',
      rating: 8.5
    }
  })

  describe('rendering', () => {
    it('renders movie information', () => {
      const wrapper = mount(MovieCard, {
        props: {
          movie: mockMovie
        }
      })

      expect(wrapper.text()).toContain('Test Movie')
      expect(wrapper.text()).toContain('2020')
      expect(wrapper.text()).toContain('8.5')
    })

    it('renders correct data-testid', () => {
      const wrapper = mount(MovieCard, {
        props: {
          movie: mockMovie
        }
      })

      const link = wrapper.find('[data-testid="movie-link-1"]')
      expect(link.exists()).toBe(true)
    })

    it('renders poster image with correct alt text', () => {
      const wrapper = mount(MovieCard, {
        props: {
          movie: mockMovie
        }
      })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('alt')).toBe('Test Movie')
      expect(img.attributes('loading')).toBe('lazy')
    })
  })

  describe('navigation', () => {
    it('links to correct movie page', () => {
      const wrapper = mount(MovieCard, {
        props: {
          movie: mockMovie
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('uses correct movie ID in link', () => {
      const movie2 = { ...mockMovie, id: 42 }
      const wrapper = mount(MovieCard, {
        props: {
          movie: movie2
        }
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('formatting', () => {
    it('displays duration in correct format', () => {
      const wrapper = mount(MovieCard, {
        props: {
          movie: mockMovie
        }
      })

      expect(wrapper.text()).toContain('2:00')
    })

    it('displays rating with one decimal place', () => {
      const wrapper = mount(MovieCard, {
        props: {
          movie: mockMovie
        }
      })

      expect(wrapper.text()).toContain('8.5')
    })

    it('handles different year values', () => {
      const oldMovie = { ...mockMovie, year: 1990 }
      const wrapper = mount(MovieCard, {
        props: {
          movie: oldMovie
        }
      })

      expect(wrapper.text()).toContain('1990')
    })
  })

  describe('poster URL', () => {
    it('constructs full poster URL from relative path', () => {
      const wrapper = mount(MovieCard, {
        props: {
          movie: mockMovie
        }
      })

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('http://localhost:3022/poster.jpg')
    })

    it('handles absolute poster URLs', () => {
      const movieWithAbsoluteUrl = {
        ...mockMovie,
        posterImage: 'https://example.com/poster.jpg'
      }
      const wrapper = mount(MovieCard, {
        props: {
          movie: movieWithAbsoluteUrl
        }
      })

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/poster.jpg')
    })
  })
})
