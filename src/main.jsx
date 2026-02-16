import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import {ComposeProvider} from "./components/composeProvider"
import {AppDataProvider} from "@team4am/fp-core"
import {DialogProvider} from "@team4am/fp-core"
import { ToastContainer } from "react-toastify"
import {LocalizationProvider} from "@mui/x-date-pickers"
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs"
import "dayjs/locale/ja"
import "./main.css"

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import {UserDataProvider} from "@_views/user/data/index.jsx"
import {getApps, initializeApp} from "firebase/app"
import _ from "ansuko"
import {ErrorBoundary} from "react-error-boundary"
import ErrorFallback from "./error.jsx"

// ライトテーマを作成
const lightTheme = createTheme({
    palette: {
        mode: 'light', // これが重要！
    },
});

// dayjsの設定
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Tokyo")
dayjs.locale("ja")

if (_.size(getApps()) === 0) {
    initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    })
}

document.title = import.meta.env.VITE_PROJECT_SHORT_NAME

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ThemeProvider theme={lightTheme}>
          <CssBaseline />
          <ErrorBoundary FallbackComponent={ErrorFallback} onError={console.error}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
                  <ComposeProvider providers={[DialogProvider, AppDataProvider]}>
                      <App />
                      <ToastContainer />
                  </ComposeProvider>
              </LocalizationProvider>
          </ErrorBoundary>
      </ThemeProvider>
  </StrictMode>,
)
