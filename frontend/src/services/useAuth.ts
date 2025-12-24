import { reactive } from '@vue/reactivity';
import { TOKEN_HEADER_KEY } from '../api';

const TOKEN_STORAGE_KEY = 'sendme_auth_token';

const authState = reactive<{
  token: string | null;
  needsAuth: boolean;
}>({
  token: sessionStorage.getItem(TOKEN_STORAGE_KEY),
  needsAuth: false,
});

const setToken = (token: string) => {
  authState.token = token;
  sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
};

const getAuthToken = () => {
  const headers: HeadersInit = {};
  const token =
    authState.token || sessionStorage.getItem(TOKEN_STORAGE_KEY) || '';
  if (token) {
    headers[TOKEN_HEADER_KEY] = token;
  }
  return { headers, token };
};

const clearAuth = () => {
  authState.needsAuth = true;
  authState.token = null;
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
};

export { authState, setToken, getAuthToken, clearAuth };
