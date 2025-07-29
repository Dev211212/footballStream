export function decryptString(encryptedBase64: string, key = "devxseven"): string {
  if (!encryptedBase64 || typeof encryptedBase64 !== "string") {
    return ""
  }

  if (!key) {
    return encryptedBase64
  }

  try {
    const decoded = atob(encryptedBase64)
    let decrypted = ""

    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      decrypted += String.fromCharCode(charCode)
    }

    return decodeURIComponent(decrypted)
  } catch (error) {
    console.warn("Decryption failed:", error)
    return encryptedBase64
  }
}

export function encryptString(plaintext: string, key = "devxseven"): string {
  if (!plaintext || typeof plaintext !== "string") {
    return ""
  }

  try {
    const encoded = encodeURIComponent(plaintext)
    let encrypted = ""

    for (let i = 0; i < encoded.length; i++) {
      const charCode = encoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      encrypted += String.fromCharCode(charCode)
    }

    return btoa(encrypted)
  } catch (error) {
    console.error("Encryption failed:", error)
    return plaintext
  }
}
