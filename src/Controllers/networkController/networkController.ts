const apiUrl = 'http://localhost:3000/'

export const get = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${apiUrl}/${endpoint}`)
    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      throw new Error('Error fetching data')
    }
  } catch (error) {
    console.log(error)
  }

  return null
}

export const post = async <T>(endpoint: string, body: T): Promise<T | null> => {
  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      throw new Error('Error fetching data')
    }
  } catch (error) {
    console.log(error)
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
