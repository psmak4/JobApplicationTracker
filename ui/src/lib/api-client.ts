import axios from 'axios'

const apiClient = axios.create({
	baseURL: 'http://localhost:4000/api',
	withCredentials: true, // Crucial for Better Auth sessions
})

export default apiClient
