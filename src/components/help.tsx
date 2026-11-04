import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function help() {
  return (
    <div className='bg-black w-screen h-screen text-white overflow-visible'>
      <div>
        <a href={"/"}  className="inline-flex items-center fixed top-3 left-8">
          <ArrowLeft />
        </a>
        <h1 className='fixed left-20 top-3'>
          Help
        </h1>
      </div>
      <h1 className='font-bold fixed left-140 top-30'>Help & Support</h1>
      <p className='font-normal p-30 fixed top-15'>
        Welcome to the Help & Support page. This section is designed to help you use our video calling application easily and
        efficiently. You can create or join a meeting, turn your camera and microphone on or off, switch between cameras, and
        manage participants during a call. If your camera or microphone is not working, make sure your browser has permission
        to access your device. For the best experience, use a modern browser and ensure that you have a stable internet connection.
        If you experience any problems while joining a meeting or using the calling features,please check your device permissions,
        refresh the page, and try again. If the issue continues, contact the support team for further assistance.
      </p>
      <p className='font-normal p-30 fixed top-45'>
        If your camera or microphone is not working, first check whether your device is connected correctly. Make sure your browser has permission
        to access the camera and microphone. During a meeting, you can use the camera and microphone buttons to turn your video and audio on or off.
        If the buttons are not responding, try refreshing the page or restarting your browser.
      </p>
      <p className='font-normal p-30 fixed top-65'>
        To create a meeting, select the option to start a new meeting. A meeting room will be created for you, and you can share the meeting link or ID
        with other participants. Once participants join the meeting, you can communicate with them using the available video and audio controls.
      </p>
      <p className='font-normal p-30 fixed top-80'>
        The participant section allows you to view the users who are currently present in the meeting. You can open the participants list by selecting
        the users icon. This helps you easily identify who has joined the meeting and keep track of all participants during the call.

      </p>
    </div>
  )
}
