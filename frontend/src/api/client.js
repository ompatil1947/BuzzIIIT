import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const client = axios.create({ baseURL: API_URL });

// ── Restaurants ────────────────────────────────────────────────────────────
export const getRestaurants = async (filters = {}) => {
  const { data } = await client.get('/restaurants', { params: filters });
  return data;
};

export const getRestaurant = async (id) => {
  const { data } = await client.get(`/restaurant/${id}`);
  return data;
};

// ── Chat ───────────────────────────────────────────────────────────────────
export const chatWithBot = async (message, history) => {
  const { data } = await client.post('/chat', { message, history });
  return data;
};

// ── Reviews ────────────────────────────────────────────────────────────────
export const getReviews = async (restaurantId) => {
  const { data } = await client.get(`/restaurants/${restaurantId}/reviews`);
  return data;
};

export const postReview = async (restaurantId, { nickname, rating, text }) => {
  const { data } = await client.post(`/restaurants/${restaurantId}/reviews`, { nickname, rating, text });
  return data;
};

export const getRatingSummary = async (restaurantId) => {
  const { data } = await client.get(`/restaurants/${restaurantId}/rating-summary`);
  return data;
};

// ── Q&A ────────────────────────────────────────────────────────────────────
export const getQuestions = async (restaurantId) => {
  const { data } = await client.get(`/restaurants/${restaurantId}/questions`);
  return data;
};

export const postQuestion = async (restaurantId, { nickname, text }) => {
  const { data } = await client.post(`/restaurants/${restaurantId}/questions`, { nickname, text });
  return data;
};

export const postAnswer = async (questionId, { nickname, text }) => {
  const { data } = await client.post(`/questions/${questionId}/answers`, { nickname, text });
  return data;
};

export default client;
