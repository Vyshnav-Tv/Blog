export default function getRequestErrorMessage(error, fallbackMessage) {
  const validationErrors = error.response?.data?.errors

  if (validationErrors) {
    const firstError = Object.values(validationErrors).flat()[0]
    if (firstError) return firstError
  }

  return error.response?.data?.message || fallbackMessage
}
