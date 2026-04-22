const USERS_KEY = 'pixel-file-users'
const SESSION_KEY = 'pixel-file-session'

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const registerUser = ({ name, email, password }) => {
  const users = readUsers()
  const normalizedEmail = email.trim().toLowerCase()

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('Email da ton tai')
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  }

  writeUsers([...users, newUser])

  const session = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export const loginUser = ({ email, password }) => {
  const users = readUsers()
  const normalizedEmail = email.trim().toLowerCase()

  const user = users.find((entry) => entry.email === normalizedEmail)

  if (!user || user.password !== password) {
    throw new Error('Email hoac mat khau khong dung')
  }

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY)
}
