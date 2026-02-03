import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    ['babel-plugin-react-compiler'],
                    [
                        "@babel/plugin-proposal-decorators",
                        {
                            "legacy": true
                        }
                    ],
                    [
                        "@babel/plugin-proposal-class-properties",
                        {
                            "loose": true
                        }
                    ]
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@/lib': resolve(__dirname, '../core/src/lib')
        }
    }
})
