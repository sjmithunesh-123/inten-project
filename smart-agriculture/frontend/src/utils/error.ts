import axios from 'axios'

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail ?? error.response?.data?.message ?? error.message

    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
