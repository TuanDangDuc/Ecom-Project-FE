const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload một file ảnh lên Cloudinary.
 * @param {File} file - File ảnh từ <input type="file">
 * @returns {Promise<string>} secure_url của ảnh sau khi upload
 */
export async function uploadToCloudinary(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Thiếu cấu hình Cloudinary. Kiểm tra VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET trong file .env'
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Cloudinary upload thất bại (HTTP ${res.status})`)
  }

  const data = await res.json()
  return data.secure_url
}
