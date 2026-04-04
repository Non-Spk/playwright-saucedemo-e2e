import en from './en.json'

const translations: Record<string, typeof en> = { en }

const locale = process.env.LOCALE || 'en'

export default translations[locale] ?? translations['en']
