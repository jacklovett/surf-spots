const apiUrl = 'http://localhost:8080/api'

export const get = async <T>(endpoint: string): Promise<T | undefined> => {
  try {
    console.log(`${apiUrl}/${endpoint}`)
    const response = await fetch(`${apiUrl}/${endpoint}`)
    console.log(response)
    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      throw new Error('Error fetching data')
    }
  } catch (error) {
    console.log(error)
  }
}

export const post = async <T, R>(
  endpoint: string,
  body: T,
): Promise<R | null> => {
  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data: R = await response.json()
      return data
    } else {
      throw new Error('Error fetching data')
    }
  } catch (error) {
    console.log('Network error:', error)
  }

  return null
}

export const edit = async <T>(endpoint: string, body: T): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      console.log('Edited')
    } else {
      throw new Error('Error fetching data')
    }
  } catch (error) {
    console.log(error)
  }
}

export const deleteData = async (endpoint: string): Promise<void> => {
  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      console.log('Deleted')
    } else {
      throw new Error('Error fetching data')
    }
  } catch (error) {
    console.log(error)
  }
}
