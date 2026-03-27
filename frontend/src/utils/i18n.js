import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      appName: 'CivicPulse',
      subtitle: 'Smart City Grievance & Feedback System',
      login: 'Login',
      register: 'Register',
      rolePreview: 'Role Preview',
      logout: 'Logout',
      dashboard: 'Dashboard',
      submitComplaint: 'Submit Complaint',
      myComplaints: 'My Complaints',
      analytics: 'Analytics',
      officerDesk: 'Officer Desk',
      adminDesk: 'Admin Desk',
      feedback: 'Feedback',
      darkMode: 'Dark Mode',
      language: 'Language',
    },
  },
  hi: {
    translation: {
      appName: 'सिविकपल्स',
      subtitle: 'स्मार्ट सिटी शिकायत और फीडबैक सिस्टम',
      login: 'लॉगिन',
      register: 'रजिस्टर',
      rolePreview: 'भूमिका पूर्वावलोकन',
      logout: 'लॉगआउट',
      dashboard: 'डैशबोर्ड',
      submitComplaint: 'शिकायत दर्ज करें',
      myComplaints: 'मेरी शिकायतें',
      analytics: 'विश्लेषण',
      officerDesk: 'अधिकारी डेस्क',
      adminDesk: 'एडमिन डेस्क',
      feedback: 'फीडबैक',
      darkMode: 'डार्क मोड',
      language: 'भाषा',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('civicpulse_lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
