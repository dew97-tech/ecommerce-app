const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASSWORD
const is_live = process.env.IS_LIVE === 'true'

export const sslcommerz = {
  init: async (data) => {
    const baseUrl = is_live ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com'
    const initUrl = `${baseUrl}/gwprocess/v4/api.php`

    const formData = new URLSearchParams()
    formData.append('store_id', store_id)
    formData.append('store_passwd', store_passwd)
    
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key])
      }
    }

    try {
      const response = await fetch(initUrl, {
        method: 'POST',
        body: formData,
      })
      return await response.json()
    } catch (error) {
      console.error("SSLCommerz Init Fetch Error:", error)
      throw error
    }
  },
  
  validate: async (data) => {
     const baseUrl = is_live ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com'
     const validateUrl = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${data.val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json&v=1`
     
     try {
       const response = await fetch(validateUrl)
       return await response.json()
     } catch (error) {
       console.error("SSLCommerz Validate Fetch Error:", error)
       throw error
     }
  }
}
