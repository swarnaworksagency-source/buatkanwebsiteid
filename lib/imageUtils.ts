export async function convertToWebP(
  file: File, 
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      // Resize jika terlalu besar
      // Maksimal 1920px untuk portofolio
      // Maksimal 400px untuk logo
      const maxWidth = file.name.includes('logo') 
        ? 400 : 1920
      
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      
      canvas.width = width
      canvas.height = height
      
      ctx?.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Konversi gagal'))
            return
          }
          // Ganti nama file menjadi .webp
          const newFileName = file.name
            .replace(/\.(jpg|jpeg|png|gif|bmp|tiff)$/i, '.webp')
          const webpFile = new File([blob], newFileName, {
            type: 'image/webp'
          })
          URL.revokeObjectURL(url)
          resolve(webpFile)
        },
        'image/webp',
        quality
      )
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Gagal load gambar'))
    }
    
    img.src = url
  })
}

// Batch convert multiple files
export async function convertAllToWebP(
  files: File[],
  quality: number = 0.85
): Promise<File[]> {
  return Promise.all(
    files.map(file => {
      // Skip jika sudah WebP atau bukan gambar
      if (file.type === 'image/webp') return file
      if (!file.type.startsWith('image/')) return file
      return convertToWebP(file, quality)
    })
  )
}
