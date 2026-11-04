import { Button } from '@base-ui/react'
import { ArrowLeft } from 'lucide-react'


export default function settings() {
    return (
        <main className='w-screen h-screen text-white bg-black'>
            <h2 className='text-center p-70 mask-conic-from-neutral-900 font-mono'>Welcome to Settings page</h2>
            <div >
                <a href={"/"}  className="inline-flex items-center w-10 h-10 fixed left-8 top-2">
                     <ArrowLeft />
                </a>
                <h1 className=' fixed left-20 top-4'>Settings</h1>
            </div>
            <aside className='fixed top-20 w-35 h-full z-100 text-white bg-gray-900 border-white border-2  text-center'>
                <Button className='p-3 h-15' >
                    History
                </Button>
                <hr className='w-31 fixed left-2'></hr>
                <Button className='p-3 h-15 '>
                    Notifications
                </Button>
                <hr className='w-31 fixed left-2'></hr>
            </aside>
           
        </main>
    )
}

