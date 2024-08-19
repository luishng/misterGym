import AsyncStorage from "@react-native-async-storage/async-storage";

import { TOKEN_STORAGE } from '@storage/storageConfig'

export async function storageTokenSave(token: string) {
  await AsyncStorage.setItem(TOKEN_STORAGE, token)
}

export async function storageTokenGet() {
  const storage = await AsyncStorage.getItem(TOKEN_STORAGE)

  const token: string = storage ? storage : ''

  return token
}

export async function storageTokenRemove() {
  await AsyncStorage.removeItem(TOKEN_STORAGE)
}