import { storageTokenGet, storageTokenSave } from '@storage/storageToken'
import { AppError } from '@utils/AppError'
import axios, { AxiosInstance, AxiosError } from 'axios'

type SignOut = () => void

type PromiseType = {
  onSucess: (token: string) => void
  onFailure: (error: AxiosError) => void
}

type ApiInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void
}

const api = axios.create({
  baseURL: "http://192.168.1.13:3333",
  timeout: 1000
}) as ApiInstanceProps

let failedQueue: Array<PromiseType> = []
let isRefresing = false;

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = api.interceptors.response.use((response) => {
    return response
  }, async (requestError) => {
    if (requestError?.response?.status === 401) {
      if (
        requestError.response.data?.message === 'token.expired' ||
        requestError.response.data?.message === 'token.invalid'
      ) {
        const { refresh_token } = await storageTokenGet();

        if (!refresh_token) {
          signOut();

          return Promise.reject(requestError)
        }

        const originalRequestConfig = requestError.config;

        if (isRefresing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              onSucess: (token) => {
                originalRequestConfig.headers = { 'Authorization': `Bearer ${token}` };
                resolve(api(originalRequestConfig))
              },
              onFailure: (error) => {
                reject(error)
              }
            })
          })
        }

        isRefresing = true;

        return new Promise(async (resolve, reject) => {
          try {
            const { data } = await api.post('/sessions/refresh-token', { refresh_token })
            await storageTokenSave({ token: data.token, refresh_token: data.refresh_token })

            if (originalRequestConfig.data) {
              originalRequestConfig.data = JSON.parse(originalRequestConfig.data)
            }

            originalRequestConfig.headers = { 'Authorization': `Bearer ${data.token}` };
            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

            failedQueue.forEach(request => {
              request.onSucess(data.token)
            })

            resolve(api(originalRequestConfig))
          } catch (error: any) {
            failedQueue.forEach(request => {
              request.onFailure(error)
            })
            signOut();
            reject(error)
          } finally {
            isRefresing = false
            failedQueue = []
          }
        })
      }

      signOut();
    }



    if (requestError.response && requestError.response.data) {
      return Promise.reject(new AppError(requestError.response.data.message))
    } else {
      return Promise.reject(requestError)
    }
  })

  return () => {
    api.interceptors.response.eject(interceptTokenManager)
  }
}



export { api }