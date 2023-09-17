import { ReactNode, } from "react"
import { useHydrateAtoms } from 'jotai/utils'
import { Provider, atom, useAtom, useAtomValue } from 'jotai'
import { DevTools as JotaiDevTools } from 'jotai-devtools'
import { atomsWithQuery, queryClientAtom } from 'jotai-tanstack-query'
import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from '@tanstack/react-query'
/**
 * ReactQueryDevtools 5.0.0-beta.29 crash, 28ok
 */
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
const queryClient = new QueryClient()


const messageAtom = atom('Edit me and see output in console')
const [, jotaiQueryAtom] = atomsWithQuery<string>((get) => ({
    queryKey: ['jotai', get(messageAtom)],
    queryFn: async ({ queryKey: [, message] }) => {
        // console.log('queryFn jotai')
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve('' + message)
            }, 500)
        })
    },
}))
jotaiQueryAtom.debugLabel = 'jotaiQueryAtom'


function TryQuery() {
    console.log('')
    // const [{ data, isSuccess, status }] = useAtom(todosQueryAtom)
    const [message, setMessage] = useAtom(messageAtom)
    const jotaiQuery = useAtomValue(jotaiQueryAtom)

    const reactQuery = useQuery<string>({
        queryKey: ['react', message],
        queryFn: async ({ queryKey: [, message] }) => {
            // console.log('queryFn react')
            return new Promise((resolve) => {
                setTimeout(function () {
                    resolve('' + message)
                }, 500)
            })
        },
    })

    console.log(`[jotaiQuery] %c${jotaiQuery.status} %cmessageInAtom: %c${message} %cmessageInQuery: %c${jotaiQuery.data}`, jotaiQuery.isPending ? 'color: yellow' : 'color: cyan', 'color: auto', 'color: green', 'color: auto', 'color: green',)
    if (jotaiQuery.status === 'success' && message !== jotaiQuery.data) {
        console.warn('↑ OH NO, queryKey has changed, but still success with old value!')
    }
    console.log(`[reactQuery] %c${reactQuery.status} %cmessageInAtom: %c${message} %cmessageInQuery: %c${reactQuery.data}`, reactQuery.isPending ? 'color: yellow' : 'color: cyan', 'color: auto', 'color: green', 'color: auto', 'color: green',)
    if (reactQuery.status === 'success' && message !== reactQuery.data) {
        console.warn('↑ OH NO, queryKey has changed, but still success with old value!')
    }

    return (
        <>
            <input type='text' id='value' value={ message } autoComplete="off" style={ { width: '80vw', height: '32px' } } onChange={ (e) => { console.log('* message changed');setMessage(e.currentTarget.value)} } />
            <div>{ jotaiQuery.status }</div>
            <div>{ jotaiQuery.data ?? '...' }</div>
            <div>{ reactQuery.status }</div>
            <div>{ reactQuery.data ?? '...' }</div>

            <JotaiDevTools theme="dark"></JotaiDevTools>
        </>
    )

}


function HydrateAtoms({ children }: { children: ReactNode }) {
    useHydrateAtoms([[queryClientAtom, queryClient]])
    return children
}
export default function App() {
    return (
        <QueryClientProvider client={ queryClient }>
            <Provider>
                <HydrateAtoms>
                    <TryQuery></TryQuery>
                </HydrateAtoms>
            </Provider>
            <ReactQueryDevtools initialIsOpen={ false } client={ queryClient } />
        </QueryClientProvider>
    )
}